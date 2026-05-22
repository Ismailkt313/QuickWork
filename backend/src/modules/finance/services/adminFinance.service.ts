import { IPlatformTransactionRepository, IWalletRepository, IAdminFinanceService } from '../interfaces/finance.interface';
import { UserModel } from '../../auth/models/user.model';
import { JobModel } from '../../job/models/job.model';
import { ServiceProviderModel } from '../../serviceProvider/models/serviceProvider.model';

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

        const filter: Record<string, unknown> = {};
        if (paymentMethod && paymentMethod !== 'all') {
            filter.paymentMethod = paymentMethod.toUpperCase();
        }

        if (startDate || endDate) {
            const dateFilter: Record<string, Date> = {};
            if (startDate) dateFilter.$gte = new Date(startDate);
            if (endDate) dateFilter.$lte = new Date(endDate);
            filter.createdAt = dateFilter;
        }

        if (search) {
            const searchRegex = new RegExp(search, 'i');

            const orConditions: Record<string, unknown>[] = [
                { razorpay_payment_id: { $regex: search, $options: 'i' } }
            ];

            const matchingUsers = await UserModel.find({ name: searchRegex }).select('_id').lean();
            if (matchingUsers.length > 0) {
                const userIds = matchingUsers.map(u => u._id);
                const matchingProviders = await ServiceProviderModel.find({ userId: { $in: userIds } }).select('_id').lean();
                if (matchingProviders.length > 0) {
                    const providerIds = matchingProviders.map(p => p._id);
                    orConditions.push({ providerId: { $in: providerIds } });
                }
            }

            const matchingJobs = await JobModel.find({
                $or: [
                    { jobCode: searchRegex },
                    { title: searchRegex }
                ]
            }).select('_id').lean();
            if (matchingJobs.length > 0) {
                const jobIds = matchingJobs.map(j => j._id);
                orConditions.push({ jobId: { $in: jobIds } });
            }

            filter.$or = orConditions;
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
