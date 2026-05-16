import { Types } from 'mongoose';
import { WorkHistoryModel } from '../models/workHistory.model';
import { IWorkHistory } from '../interfaces/finance.interface';
import { IWorkHistoryRepository } from '../interfaces/finance.interface';

export class WorkHistoryRepository implements IWorkHistoryRepository {
    async findById(id: string): Promise<IWorkHistory | null> {
        return WorkHistoryModel.findById(id);
    }

    async findByAssignmentId(assignmentId: string): Promise<IWorkHistory | null> {
        return WorkHistoryModel.findOne({ assignmentId });
    }

    async findByJobAndStatus(jobId: string, finalStatus: string): Promise<IWorkHistory[]> {
        return WorkHistoryModel.find({ jobId, finalStatus });
    }

    async findEligibleForJobPayment(jobId: string): Promise<IWorkHistory[]> {
        return WorkHistoryModel.find({
            jobId,
            finalStatus: 'COMPLETED',
            'payment.status': { $ne: 'completed' }
        });
    }

    async findProviderHistory(providerId: string, status: string | undefined, skip: number, limit: number): Promise<[IWorkHistory[], number]> {
        const query: Record<string, unknown> = { providerId: new Types.ObjectId(providerId) };
        if (status === 'pending') {
            query['payment.status'] = { $in: ['pending', 'awaiting_confirmation'] };
        } else if (status === 'completed') {
            query['payment.status'] = 'completed';
        }

        return Promise.all([
            WorkHistoryModel.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('jobId', 'title description location jobCode'),
            WorkHistoryModel.countDocuments(query)
        ]);
    }

    async getPlatformEarnings(): Promise<number> {
        const result = await WorkHistoryModel.aggregate([
            { $match: { 'payment.status': 'completed' } },
            { $group: { _id: null, total: { $sum: '$payment.platformFee' } } }
        ]);
        return result.length > 0 ? result[0].total : 0;
    }

    async save(workHistory: IWorkHistory): Promise<IWorkHistory> {

        if (typeof (workHistory as unknown as { save: () => Promise<IWorkHistory> }).save === 'function') {
            return (workHistory as unknown as { save: () => Promise<IWorkHistory> }).save();
        }

        return WorkHistoryModel.findByIdAndUpdate(workHistory._id, workHistory, { new: true }) as unknown as Promise<IWorkHistory>;
    }

    async create(data: Record<string, unknown>): Promise<IWorkHistory> {
        return WorkHistoryModel.create(data);
    }

    async getByProvider(providerId: string): Promise<IWorkHistory[]> {
        return WorkHistoryModel.find({ providerId: new Types.ObjectId(providerId) }).sort({ endedAt: -1 });
    }

    async findByJob(jobId: string): Promise<IWorkHistory[]> {
        return WorkHistoryModel.find({ jobId });
    }

    async getEarningsStats(providerId: string): Promise<Record<string, unknown>> {
        const result = await WorkHistoryModel.aggregate([
            { $match: { providerId: new Types.ObjectId(providerId), finalStatus: 'COMPLETED' } },
            { $group: { _id: null, total: { $sum: '$payment.providerAmount' } } }
        ]);
        return result[0] || { total: 0 };
    }

    async getMonthlyEarnings(providerId: string, limit: number = 6): Promise<Record<string, unknown>[]> {
        const date = new Date();
        date.setMonth(date.getMonth() - limit);

        return await WorkHistoryModel.aggregate([
            { $match: { providerId: new Types.ObjectId(providerId), finalStatus: 'COMPLETED', createdAt: { $gte: date } } },
            {
                $group: {
                    _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
                    amount: { $sum: '$payment.providerAmount' }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);
    }
}
