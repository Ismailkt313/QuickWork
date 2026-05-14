import { PlatformTransactionModel } from '../models/platformTransaction.model';
import { IPlatformTransactionRepository } from '../interfaces/finance.interface';

export class PlatformTransactionRepository implements IPlatformTransactionRepository {
    async create(data: any): Promise<any> {
        return PlatformTransactionModel.create(data);
    }

    async findWithPagination(query: any, skip: number, limit: number): Promise<[any[], number]> {
        return Promise.all([
            PlatformTransactionModel.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('jobId', 'title jobCode')
                .populate('providerId', 'name email'),
            PlatformTransactionModel.countDocuments(query)
        ]);
    }

    async getAdminFinanceOverview(): Promise<any> {
        const result = await PlatformTransactionModel.aggregate([
            {
                $group: {
                    _id: null,
                    totalPlatformEarnings: { $sum: '$platformFee' },
                    totalTransactions: { $count: {} },
                    totalOnlinePayments: {
                        $sum: { $cond: [{ $eq: ['$paymentMethod', 'ONLINE'] }, 1, 0] }
                    },
                    totalCashPayments: {
                        $sum: { $cond: [{ $eq: ['$paymentMethod', 'CASH'] }, 1, 0] }
                    }
                }
            }
        ]);
        return result[0];
    }

    async getTransactionsWithCount(filter: any, skip: number, limit: number): Promise<[any[], number]> {
        return Promise.all([
            PlatformTransactionModel.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('jobId', 'title jobCode')
                .lean(),
            PlatformTransactionModel.countDocuments(filter)
        ]);
    }

    async countTotalTransactions(): Promise<number> {
        return PlatformTransactionModel.countDocuments();
    }

    async getEarningsStats(): Promise<any> {
        return PlatformTransactionModel.aggregate([
            { $group: { _id: null, total: { $sum: "$platformFee" } } }
        ]);
    }

    async getRecentTransactions(limit: number): Promise<any[]> {
        return PlatformTransactionModel.find()
            .populate('providerId', 'name email profileImage')
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();
    }

    async getMonthlyRevenue(): Promise<any[]> {
        return PlatformTransactionModel.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                    revenue: { $sum: "$platformFee" }
                }
            },
            { $sort: { "_id": 1 } },
            { $project: { _id: 0, month: "$_id", revenue: 1 } }
        ]);
    }

    async getFinanceSummary(): Promise<any> {
        const result = await PlatformTransactionModel.aggregate([
            {
                $group: {
                    _id: null,
                    totalEarnings: { $sum: "$platformFee" },
                    totalPayouts: { $sum: "$providerAmount" },
                    transactionVolume: { $sum: "$totalAmount" }
                }
            }
        ]);
        return result[0];
    }
}
