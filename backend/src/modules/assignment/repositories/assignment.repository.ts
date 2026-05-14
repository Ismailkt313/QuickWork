import { IAssignment, IAssignmentRepository } from '../interfaces/assignment.interface';
import { AssignmentModel } from '../models/assignment.model';
import mongoose, { Types } from 'mongoose';

export class AssignmentRepository implements IAssignmentRepository {
    async create(data: Partial<IAssignment>): Promise<IAssignment> {
        const assignment = new AssignmentModel(data);
        return await assignment.save();
    }

    async findById(id: string): Promise<IAssignment | null> {
        return await AssignmentModel.findById(id)
            .populate({
                path: 'jobId',
                populate: [
                    { path: 'userId', select: 'name email' },
                    { path: 'location.district', select: 'name' },
                    { path: 'skillId', select: 'name' }
                ]
            })
            .populate({
                path: 'freelancerId',
                populate: { path: 'userId', select: 'name email' }
            });
    }

    async findOne(query: any): Promise<IAssignment | null> {
        return await AssignmentModel.findOne(query);
    }

    async find(query: any, options?: { page?: number, limit?: number, sort?: any }): Promise<IAssignment[]> {
        const { page = 1, limit = 10, sort = { createdAt: -1 } } = options || {};
        const skip = (page - 1) * limit;

        return await AssignmentModel.find(query)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .populate({
                path: 'jobId',
                populate: [
                    { path: 'userId', select: 'name email' },
                    { path: 'location.district', select: 'name' },
                    { path: 'skillId', select: 'name' }
                ]
            })
            .populate({
                path: 'freelancerId',
                populate: { path: 'userId', select: 'name email' }
            });
    }

    async update(id: string, data: Partial<IAssignment>): Promise<IAssignment | null> {
        return await AssignmentModel.findByIdAndUpdate(id, { $set: data }, { new: true });
    }

    async updateByJobId(jobId: string, data: Partial<IAssignment>): Promise<any> {
        return await AssignmentModel.updateMany({ jobId }, { $set: data });
    }

    async exists(query: any): Promise<boolean> {
        const result = await AssignmentModel.exists(query);
        return !!result;
    }

    async count(query: any): Promise<number> {
        return await AssignmentModel.countDocuments(query);
    }

    async findWithFreelancer(jobId: string): Promise<IAssignment[]> {
        return await AssignmentModel.find({ jobId })
            .populate({
                path: 'freelancerId',
                populate: { path: 'userId', select: 'name email profileImage headline' }
            });
    }

    async getDashboardStats(providerId: string): Promise<any> {
        const stats = await AssignmentModel.aggregate([
            { $match: { freelancerId: new Types.ObjectId(providerId) } },
            {
                $group: {
                    _id: null,
                    activeJobs: {
                        $sum: {
                            $cond: [
                                { $in: ['$workStatus', ['IN_PROGRESS', 'ASSIGNED']] },
                                1,
                                0
                            ]
                        }
                    },
                    completedJobs: { $sum: { $cond: [{ $eq: ['$workStatus', 'COMPLETED'] }, 1, 0] } },
                    pendingAssignments: { $sum: { $cond: [{ $eq: ['$invite.status', 'PENDING'] }, 1, 0] } },
                    upcomingJobs: { $sum: { $cond: [{ $eq: ['$workStatus', 'ASSIGNED'] }, 1, 0] } },
                    totalAssignments: { $sum: 1 },
                    assignmentEarnings: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ['$workStatus', 'COMPLETED'] },
                                        { $eq: ['$payment.status', 'completed'] }
                                    ]
                                },
                                { $ifNull: ['$payment.amount', 0] },
                                0
                            ]
                        }
                    }
                }
            }
        ]);
        return stats[0] || { activeJobs: 0, completedJobs: 0, pendingAssignments: 0, upcomingJobs: 0, totalAssignments: 0, assignmentEarnings: 0 };
    }

    async findRecentAssignments(providerId: string, limit: number): Promise<IAssignment[]> {
        return await AssignmentModel.find({ freelancerId: providerId })
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate('jobId', 'title description');
    }

    async getStatusDistribution(providerId: string): Promise<any[]> {
        return await AssignmentModel.aggregate([
            { $match: { freelancerId: new Types.ObjectId(providerId) } },
            { $group: { _id: '$workStatus', count: { $sum: 1 } } }
        ]);
    }

    async getWeeklyActivity(providerId: string): Promise<any[]> {
        return await AssignmentModel.aggregate([
            {
                $match: {
                    freelancerId: new Types.ObjectId(providerId),
                    createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
                }
            },
            {
                $group: {
                    _id: { $dayOfWeek: '$createdAt' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id': 1 } }
        ]);
    }

    async getPerformanceStats(providerId: string): Promise<any> {
        const stats = await AssignmentModel.aggregate([
            { $match: { freelancerId: new Types.ObjectId(providerId) } },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    completed: { $sum: { $cond: [{ $eq: ['$workStatus', 'COMPLETED'] }, 1, 0] } },
                    accepted: { $sum: { $cond: [{ $eq: ['$invite.status', 'ACCEPTED'] }, 1, 0] } },
                    rejected: { $sum: { $cond: [{ $eq: ['$invite.status', 'REJECTED'] }, 1, 0] } },
                    pending: { $sum: { $cond: [{ $eq: ['$invite.status', 'PENDING'] }, 1, 0] } }
                }
            }
        ]);
        return stats[0] || { total: 0, completed: 0, accepted: 0, rejected: 0, pending: 0 };
    }
}
