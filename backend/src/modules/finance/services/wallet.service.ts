import { IWallet, IWalletTransaction, IWalletRepository, IWalletService } from '../interfaces/finance.interface';

export class WalletService implements IWalletService {
    private walletRepository: IWalletRepository;

    constructor(walletRepository: IWalletRepository) {
        this.walletRepository = walletRepository;
    }

    
    async getOrCreateWallet(providerId: string): Promise<IWallet> {
        let wallet = await this.walletRepository.findByProviderId(providerId);
        if (!wallet) {
            wallet = await this.walletRepository.create(providerId, 0);
        }
        return wallet;
    }

    
    private async updateBalance(
        providerId: string,
        amount: number,
        type: 'credit' | 'debit',
        source: 'cash_fee' | 'online_payment' | 'withdrawal'
    ): Promise<IWallet> {
        const wallet = await this.getOrCreateWallet(providerId);
        
        const change = type === 'credit' ? amount : -amount;
        const updatedWallet = await this.walletRepository.updateBalance(wallet._id.toString(), change);

        if (!updatedWallet) throw new Error('Wallet not found for update');

        await this.walletRepository.createTransaction(
            providerId,
            type,
            source,
            amount,
            updatedWallet.balance
        );

        return updatedWallet;
    }

    
    async processCashPayment(providerId: string, platformFee: number): Promise<void> {
        await this.updateBalance(providerId, platformFee, 'debit', 'cash_fee');
    }

    
    async processOnlinePayment(providerId: string, totalAmount: number, platformFee: number): Promise<void> {
        
        await this.updateBalance(providerId, totalAmount, 'credit', 'online_payment');
        
        
        await this.updateBalance(providerId, platformFee, 'debit', 'cash_fee');
    }

    
    async getAdminOverview(): Promise<any> {
        const wallets = await this.walletRepository.findAllWithProvider();
        
        const totalUnpaidFees = await this.walletRepository.getPendingDues();

        return {
            totalUnpaidFees,
            wallets
        };
    }

    
    async isBlocked(providerId: string): Promise<boolean> {
        const wallet = await this.getOrCreateWallet(providerId);
        return wallet.balance < -1000;
    }

    
    async getTransactions(providerId: string, page: number = 1, limit: number = 10): Promise<{ transactions: IWalletTransaction[], total: number }> {
        const skip = (page - 1) * limit;
        const [transactions, total] = await this.walletRepository.getTransactionsWithCount(providerId, skip, limit);
        return { transactions, total };
    }
}
