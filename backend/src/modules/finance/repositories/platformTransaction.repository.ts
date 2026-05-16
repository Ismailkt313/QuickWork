import { PlatformTransactionModel } from '../models/platformTransaction.model';
import { IPlatformTransactionRepository } from '../interfaces/finance.interface';

export class PlatformTransactionRepository implements IPlatformTransactionRepository {
    async create(data: Record<string, unknown>): Promise<Record<string, unknown>> {
        return PlatformTransactionModel.create(data) as unknown as Promise<Record<string, unknown>>;
    }

    async findWithPagination(query: Record<string, unknown>, skip: number, limit: number): Promise<[Record<string, unknown>[], number]> {
        const [items, count] = await Promise.all([
            PlatformTransactionModel.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('jobId', 'title jobCode')
                .populate('providerId', 'name email')
                .lean(),
            PlatformTransactionModel.countDocuments(query)
        ]);
        return [items as Record<string, unknown>[], count];
    }

    async getAdminFinanceOverview(): Promise<Record<string, unknown>> {
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
        return result[0] || {};
    }

    async getTransactionsWithCount(filter: Record<string, unknown>, skip: number, limit: number): Promise<[Record<string, unknown>[], number]> {
        const [items, count] = await Promise.all([
            PlatformTransactionModel.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('jobId', 'title jobCode')
                .lean(),
            PlatformTransactionModel.countDocuments(filter)
        ]);
        return [items as Record<string, unknown>[], count];
    }

    async countTotalTransactions(): Promise<number> {
        return PlatformTransactionModel.countDocuments();
    }

    async getEarningsStats(): Promise<Record<string, unknown>> {
        const res = await PlatformTransactionModel.aggregate([
            { $group: { _id: null, total: { $sum: "$platformFee" } } }
        ]);
        return res[0] || { total: 0 };
    }

    async getRecentTransactions(limit: number): Promise<Record<string, unknown>[]> {
        const items = await PlatformTransactionModel.find()
            .populate('providerId', 'name email profileImage')
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();
        return items as Record<string, unknown>[];
    }

    async getMonthlyRevenue(): Promise<Record<string, unknown>[]> {
        const items = await PlatformTransactionModel.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                    revenue: { $sum: "$platformFee" }
                }
            },
            { $sort: { "_id": 1 } },
            { $project: { _id: 0, month: "$_id", revenue: 1 } }
        ]);
        return items as Record<string, unknown>[];
    }

    async getFinanceSummary(): Promise<Record<string, unknown>> {
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
        return result[0] || {};
    }
}
