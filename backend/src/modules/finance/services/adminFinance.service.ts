import { IPlatformTransactionRepository, IWalletRepository, IAdminFinanceService } from '../interfaces/finance.interface';

export class AdminFinanceService implements IAdminFinanceService {
    private _platformTransactionRepo: IPlatformTransactionRepository;
    private _walletRepo: IWalletRepository;

    constructor(
        platformTransactionRepo: IPlatformTransactionRepository,
        walletRepo: IWalletRepository
    ) {
        this._platformTransactionRepo = platformTransactionRepo;
        this._walletRepo = walletRepo;
    }

    async getFinanceOverview() {
        const overview = await this._platformTransactionRepo.getAdminFinanceOverview() || {
            totalPlatformEarnings: 0,
            totalTransactions: 0,
            totalOnlinePayments: 0,
            totalCashPayments: 0
        };

        const totalPendingDues = await this._walletRepo.getPendingDues();

        return {
            totalPlatformEarnings: overview.totalPlatformEarnings,
            totalTransactions: overview.totalTransactions,
            totalOnlinePayments: overview.totalOnlinePayments,
            totalCashPayments: overview.totalCashPayments,
            totalPendingDues
        };
    }

    async getTransactions(query: {
        page?: number;
        limit?: number;
        paymentMethod?: string;
        startDate?: string;
        endDate?: string;
        search?: string;
    }) {
        const { page = 1, limit = 10, paymentMethod, startDate, endDate, search } = query;
        const skip = (page - 1) * limit;

        const filter: any = {};
        if (paymentMethod && paymentMethod !== 'all') {
            filter.paymentMethod = paymentMethod.toUpperCase();
        }

        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) filter.createdAt.$lte = new Date(endDate);
        }

        if (search) {
            filter.$or = [
                { razorpay_payment_id: { $regex: search, $options: 'i' } },
                { $expr: { $regexMatch: { input: { $toString: "$jobId" }, regex: search, options: "i" } } },
                { $expr: { $regexMatch: { input: { $toString: "$providerId" }, regex: search, options: "i" } } }
            ];
        }

        const [transactions, total] = await this._platformTransactionRepo.getTransactionsWithCount(filter, skip, limit);

        return {
            transactions,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        };
    }
}
