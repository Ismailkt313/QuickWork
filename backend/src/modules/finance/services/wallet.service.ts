import { IWallet, IWalletTransaction, IWalletRepository, IWalletService } from '../interfaces/finance.interface';
import { ILogger } from '../../../shared/interfaces/ILogger';

export class WalletService implements IWalletService {
    private _walletRepository: IWalletRepository;
    private _logger: ILogger;

    constructor(walletRepository: IWalletRepository, logger: ILogger) {
        this._walletRepository = walletRepository;
        this._logger = logger;
    }

    async getOrCreateWallet(providerId: string): Promise<IWallet> {
        let wallet = await this._walletRepository.findByProviderId(providerId);
        if (!wallet) {
            wallet = await this._walletRepository.create(providerId, 0);
        }
        return wallet;
    }

    private async _updateBalance(
        providerId: string,
        amount: number,
        type: 'credit' | 'debit',
        source: 'cash_fee' | 'online_payment' | 'withdrawal'
    ): Promise<IWallet> {
        const wallet = await this.getOrCreateWallet(providerId);

        const change = type === 'credit' ? amount : -amount;
        const updatedWallet = await this._walletRepository.updateBalance(wallet._id.toString(), change);

        if (!updatedWallet) throw new Error('Wallet not found for update');

        await this._walletRepository.createTransaction(
            providerId,
            type,
            source,
            amount,
            updatedWallet.balance
        );

        if (type === 'credit') {
            this._logger.info("Wallet Credited", { providerId, amount, source });
        } else if (type === 'debit') {
            this._logger.info("Wallet Debited", { providerId, amount, source });
        }

        return updatedWallet;
    }

    async processCashPayment(providerId: string, platformFee: number): Promise<void> {
        await this._updateBalance(providerId, platformFee, 'debit', 'cash_fee');
    }

    async processOnlinePayment(providerId: string, totalAmount: number, platformFee: number): Promise<void> {

        await this._updateBalance(providerId, totalAmount, 'credit', 'online_payment');

        await this._updateBalance(providerId, platformFee, 'debit', 'cash_fee');
    }

    async getAdminOverview(): Promise<Record<string, unknown>> {
        const wallets = await this._walletRepository.findAllWithProvider();

        const totalUnpaidFees = await this._walletRepository.getPendingDues();

        return {
            totalUnpaidFees,
            wallets
        };
    }

    async isBlocked(providerId: string): Promise<boolean> {
        const wallet = await this.getOrCreateWallet(providerId);
        return wallet.balance < -1000;
    }

    async getTransactions(providerId: string, page: number = 1, limit: number = 10, search?: string, type?: string, source?: string): Promise<{ transactions: IWalletTransaction[], total: number }> {
        const skip = (page - 1) * limit;
        const [transactions, total] = await this._walletRepository.getTransactionsWithCount(providerId, skip, limit, search, type, source);
        return { transactions, total };
    }

    async requestWithdrawal(providerId: string, amount: number): Promise<IWallet> {
        this._logger.info("Withdrawal Requested", { providerId, amount });
        const wallet = await this.getOrCreateWallet(providerId);

        if (wallet.balance < amount) {
            throw new Error('Insufficient balance in your wallet for this withdrawal');
        }

        if (amount <= 0) {
            throw new Error('Withdrawal amount must be greater than zero');
        }

        const updatedWallet = await this._updateBalance(providerId, amount, 'debit', 'withdrawal');
        this._logger.info("Withdrawal Completed", { providerId, amount });
        return updatedWallet;
    }
}
