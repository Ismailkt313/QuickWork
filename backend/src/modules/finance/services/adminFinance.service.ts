import { IPlatformTransactionRepository, IWalletRepository, IAdminFinanceService } from '../interfaces/finance.interface';

export class AdminFinanceService implements IAdminFinanceService {
    private platformTransactionRepo: IPlatformTransactionRepository;
    private walletRepo: IWalletRepository;

    constructor(
        platformTransactionRepo: IPlatformTransactionRepository,
        walletRepo: IWalletRepository
    ) {
        this.platformTransactionRepo = platformTransactionRepo;
        this.walletRepo = walletRepo;
    }

    
    async getFinanceOverview() {
        const overview = await this.platformTransactionRepo.getAdminFinanceOverview() || {
            totalPlatformEarnings: 0,
            totalTransactions: 0,
            totalOnlinePayments: 0,
            totalCashPayments: 0
        };

        const totalPendingDues = await this.walletRepo.getPendingDues();

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
    }) {
        const { page = 1, limit = 10, paymentMethod, startDate, endDate } = query;
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

        const [transactions, total] = await this.platformTransactionRepo.getTransactionsWithCount(filter, skip, limit);

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
