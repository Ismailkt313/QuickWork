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
                .populate('jobId', 'title')
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
                .lean(),
            PlatformTransactionModel.countDocuments(filter)
        ]);
    }
}
