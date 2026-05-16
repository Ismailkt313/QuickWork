import { IJob, IJobRepository } from '../interfaces/job.interface';
import { ErrorMessages } from '../../../constants/messages/errorMessages';
import mongoose from 'mongoose';
import { JOB_STATUS } from '../../../constants/jobStatus';
import { JobModel } from '../models/job.model';
import { SkillModel } from '../../skill/models/skill.model';
import { LocationModel } from '../../location/models/location.model';
import { UserModel } from '../../auth/models/user.model';
import { ServiceProviderModel } from '../../serviceProvider/models/serviceProvider.model';
import { JobResponseDTO, mapJobToResponseDTO } from '../dtos/jobResponse.dto';

export class JobRepository implements IJobRepository {

    async create(jobData: IJob): Promise<IJob> {
        const job = new JobModel(jobData);
        return await job.save();
    }

    async findByUser(userId: string): Promise<IJob[]> {
        return await JobModel.find({ userId })
            .populate('skillId', 'name')
            .populate('location.district', 'name')
            .sort({ createdAt: -1 });
    }

    async findByUserPaginated(
        userId: string,
        page: number,
        limit: number,
        filters?: { status?: string; search?: string; visibility?: string }
    ): Promise<{ jobs: IJob[]; total: number }> {
        const query: Record<string, unknown> = { userId };

        if (filters?.status) {
            switch (filters.status) {
                case 'pending':
                    query.status = { $in: [JOB_STATUS.OPEN, JOB_STATUS.PARTIALLY_ASSIGNED] };
                    break;
                case 'ongoing':
                    query.status = { $in: [JOB_STATUS.FULLY_ASSIGNED, JOB_STATUS.IN_PROGRESS] };
                    break;
                case 'completed':
                    query.status = JOB_STATUS.COMPLETED;
                    break;
                case 'cancelled':
                    query.status = { $in: [JOB_STATUS.CANCELLED, JOB_STATUS.REJECTED] };
                    break;

            }
        }

        if (filters?.status === 'direct') {
            query.visibility = 'private';
        } else if (filters?.visibility) {
            query.visibility = filters.visibility;
        }

        if (filters?.search) {
            const searchRegex = new RegExp(filters.search, 'i');

            const searchConditions: Record<string, unknown>[] = [
                { jobCode: searchRegex },
                { title: searchRegex },
                { description: searchRegex }
            ];

            const matchingUsers = await UserModel.find({ name: searchRegex }).select('_id');
            const userIds = matchingUsers.map(u => u._id);

            const matchingProviders = await ServiceProviderModel.find({ userId: { $in: userIds } }).select('_id');
            const providerIds = matchingProviders.map(p => p._id);

            if (providerIds.length > 0) {
                searchConditions.push({ hiredProviderId: { $in: providerIds } });
            }

            query.$or = searchConditions;
        }

        const skip = (page - 1) * limit;

        const [jobs, total] = await Promise.all([
            JobModel.find(query)
                .populate('skillId', 'name')
                .populate('location.district', 'name')
                .populate('userId', 'name email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            JobModel.countDocuments(query)
        ]);

        return { jobs, total };
    }

    async countByUserGrouped(userId: string): Promise<{
        all: number;
        direct: number;
        pending: number;
        ongoing: number;
        completed: number;
        cancelled: number;
    }> {
        const result = await JobModel.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(userId) } },
            {
                $facet: {
                    all: [{ $count: 'count' }],
                    direct: [
                        { $match: { visibility: 'private' } },
                        { $count: 'count' }
                    ],
                    pending: [
                        { $match: { status: { $in: [JOB_STATUS.OPEN, JOB_STATUS.PARTIALLY_ASSIGNED] } } },
                        { $count: 'count' }
                    ],
                    ongoing: [
                        { $match: { status: { $in: [JOB_STATUS.FULLY_ASSIGNED, JOB_STATUS.IN_PROGRESS] } } },
                        { $count: 'count' }
                    ],
                    completed: [
                        { $match: { status: JOB_STATUS.COMPLETED } },
                        { $count: 'count' }
                    ],
                    cancelled: [
                        { $match: { status: { $in: [JOB_STATUS.CANCELLED, JOB_STATUS.REJECTED] } } },
                        { $count: 'count' }
                    ]
                }
            }
        ]);

        const facets = result[0] || {};
        return {
            all: facets.all?.[0]?.count || 0,
            direct: facets.direct?.[0]?.count || 0,
            pending: facets.pending?.[0]?.count || 0,
            ongoing: facets.ongoing?.[0]?.count || 0,
            completed: facets.completed?.[0]?.count || 0,
            cancelled: facets.cancelled?.[0]?.count || 0,
        };
    }

    async findAllPaginated(
        page: number,
        limit: number,
        filters?: {
            status?: string;
            search?: string;
            visibility?: string;
            isUrgent?: boolean;
            durationType?: string;
            skillId?: string;
            minBudget?: number;
            maxBudget?: number;
        }
    ): Promise<{ jobs: IJob[]; total: number }> {
        const query: Record<string, unknown> = {};

        if (filters?.status) {
            query.status = filters.status;
        }

        if (filters?.visibility) {
            query.visibility = filters.visibility;
        }

        if (filters?.isUrgent !== undefined) {
            query.isUrgent = filters.isUrgent;
        }

        if (filters?.durationType) {
            query.durationType = filters.durationType;
        }

        if (filters?.skillId) {
            query.skillId = new mongoose.Types.ObjectId(filters.skillId);
        }

        if (filters?.minBudget !== undefined || filters?.maxBudget !== undefined) {
            const budgetQuery: Record<string, unknown> = {};
            if (filters.minBudget !== undefined) budgetQuery.$gte = filters.minBudget;
            if (filters.maxBudget !== undefined) budgetQuery.$lte = filters.maxBudget;
            query['budget.min'] = budgetQuery;
        }

        if (filters?.search) {
            const searchRegex = new RegExp(filters.search, 'i');
            const matchingUsers = await UserModel.find({ name: searchRegex }).select('_id');
            const userIds = matchingUsers.map(u => u._id);

            query.$or = [
                { jobCode: searchRegex },
                { title: searchRegex },
                { description: searchRegex },
                { userId: { $in: userIds } }
            ];
        }

        const skip = (page - 1) * limit;

        const [jobs, total] = await Promise.all([
            JobModel.find(query)
                .populate('skillId', 'name')
                .populate('location.district', 'name')
                .populate('userId', 'name email')
                .populate({
                    path: 'hiredProviderId',
                    populate: { path: 'userId', select: 'name email' }
                })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            JobModel.countDocuments(query)
        ]);

        return { jobs, total };
    }

    async findAllOpen(
        page: number,
        limit: number,
        filters: Record<string, unknown>,
        skill: string[],
        excludeJobIds?: string[],
        currentUserId?: string
    ): Promise<{ jobs: IJob[], total: number }> {

        const query: Record<string, unknown> = {
            status: { $in: [JOB_STATUS.OPEN, JOB_STATUS.PARTIALLY_ASSIGNED] },
            visibility: 'public',
            skillId: { $in: skill }
        };

        if (currentUserId) {
            query.userId = { $ne: new mongoose.Types.ObjectId(currentUserId) };
        }

        if (excludeJobIds && excludeJobIds.length > 0) {
            query._id = { $nin: excludeJobIds.map(id => new mongoose.Types.ObjectId(id)) };
        }

        if (filters.skillId) {
            if (mongoose.Types.ObjectId.isValid(filters.skillId as string)) {
                query.skillId = new mongoose.Types.ObjectId(filters.skillId as string);
            } else {
                const skillDoc = await SkillModel.findOne({
                    name: new RegExp(`^${filters.skillId}$`, 'i')
                });
                if (skillDoc) {
                    query.skillId = skillDoc._id;
                } else {
                    return { jobs: [], total: 0 };
                }
            }
        }

        if (filters.locationId) {
            if (mongoose.Types.ObjectId.isValid(filters.locationId as string)) {
                query['location.district'] = new mongoose.Types.ObjectId(filters.locationId as string);
            } else {
                const location = await LocationModel.findOne({
                    name: new RegExp(`^${filters.locationId}$`, 'i')
                });
                if (location) {
                    query['location.district'] = location._id;
                } else {
                    return { jobs: [], total: 0 };
                }
            }
        }

        if (filters.minBudget !== undefined) {
            query['budget.max'] = { $gte: Number(filters.minBudget) };
        }

        if (filters.maxBudget !== undefined) {
            query['budget.min'] = { $lte: Number(filters.maxBudget) };
        }

        if (filters.search) {
            const searchRegex = new RegExp(filters.search as string, 'i');
            query.$or = [
                { jobCode: searchRegex },
                { title: searchRegex },
                { description: searchRegex }
            ];
        }

        const skip = (page - 1) * limit;

        const [jobs, total] = await Promise.all([
            JobModel.find(query)
                .populate('skillId', 'name')
                .populate('location.district', 'name')
                .populate('userId', 'name email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),

            JobModel.countDocuments(query)
        ]);

        return { jobs, total };
    }

    async findById(id: string): Promise<IJob | null> {
        return await JobModel.findById(id)
            .populate('skillId', 'name')
            .populate('location.district', 'name')
            .populate('userId', 'name email')
            .populate({
                path: 'hiredProviderId',
                populate: {
                    path: 'userId',
                    select: 'name email profileImage headline isBlocked'
                }
            });
    }

    async findByProvider(providerId: string): Promise<IJob[]> {
        return await JobModel.find({
            hiredProviderId: providerId,
            status: {
                $in: [
                    JOB_STATUS.OPEN,
                    JOB_STATUS.PARTIALLY_ASSIGNED,
                    JOB_STATUS.FULLY_ASSIGNED
                ]
            }
        })
            .populate('skillId', 'name')
            .populate('location.district', 'name')
            .populate('userId', 'name email')
            .sort({ createdAt: -1 });
    }

    async findByProviderPaginated(
        providerId: string,
        page: number,
        limit: number,
        search?: string,
        filter?: string
    ): Promise<{ jobs: IJob[]; total: number }> {
        const query: Record<string, unknown> = {
            hiredProviderId: new mongoose.Types.ObjectId(providerId),
        };

        if (filter) {
            if (filter === 'pending') query.status = JOB_STATUS.OPEN;
            else if (filter === 'accepted') query.status = JOB_STATUS.FULLY_ASSIGNED;
            else if (filter === 'rejected') query.status = { $in: [JOB_STATUS.CANCELLED, JOB_STATUS.REJECTED] };
        } else {
            query.status = {
                $in: [
                    JOB_STATUS.OPEN,
                    JOB_STATUS.PARTIALLY_ASSIGNED,
                    JOB_STATUS.FULLY_ASSIGNED,
                    JOB_STATUS.REJECTED,
                    JOB_STATUS.CANCELLED
                ]
            };
        }

        if (search) {
            const searchRegex = new RegExp(search, 'i');
            const matchingUsers = await UserModel.find({ name: searchRegex }).select('_id');
            const userIds = matchingUsers.map(u => u._id);

            query.$or = [
                { jobCode: searchRegex },
                { title: searchRegex },
                { description: searchRegex },
                { userId: { $in: userIds } }
            ];
        }

        const skip = (page - 1) * limit;

        const [jobs, total] = await Promise.all([
            JobModel.find(query)
                .populate('skillId', 'name')
                .populate('location.district', 'name')
                .populate('userId', 'name email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            JobModel.countDocuments(query)
        ]);

        return { jobs, total };
    }

    async countByProviderGrouped(providerId: string): Promise<{
        all: number;
        pending: number;
        accepted: number;
        rejected: number;
    }> {
        const result = await JobModel.aggregate([
            { $match: { hiredProviderId: new mongoose.Types.ObjectId(providerId) } },
            {
                $facet: {
                    all: [{ $count: 'count' }],
                    pending: [
                        { $match: { status: JOB_STATUS.OPEN } },
                        { $count: 'count' }
                    ],
                    accepted: [
                        { $match: { status: JOB_STATUS.FULLY_ASSIGNED } },
                        { $count: 'count' }
                    ],
                    rejected: [
                        { $match: { status: { $in: [JOB_STATUS.CANCELLED, JOB_STATUS.REJECTED] } } },
                        { $count: 'count' }
                    ]
                }
            }
        ]);

        const facets = result[0] || {};
        return {
            all: facets.all?.[0]?.count || 0,
            pending: facets.pending?.[0]?.count || 0,
            accepted: facets.accepted?.[0]?.count || 0,
            rejected: facets.rejected?.[0]?.count || 0,
        };
    }

    async updateStatus(id: string, status: JOB_STATUS): Promise<IJob | null> {
        return await JobModel.findByIdAndUpdate(
            id,
            { $set: { status } },
            { new: true }
        );
    }

    async findByConditionAndUpdate(query: Record<string, unknown>, update: Record<string, unknown>): Promise<IJob | null> {
        return await JobModel.findOneAndUpdate(query, update, { new: true });
    }

    async find(query: Record<string, unknown>): Promise<IJob[]> {
        return JobModel.find(query);
    }

    async count(query: Record<string, unknown>): Promise<number> {
        return JobModel.countDocuments(query);
    }

    async countActiveJobs(): Promise<number> {
        return JobModel.countDocuments({
            status: {
                $in: [
                    JOB_STATUS.OPEN,
                    JOB_STATUS.PARTIALLY_ASSIGNED,
                    JOB_STATUS.FULLY_ASSIGNED,
                    JOB_STATUS.IN_PROGRESS
                ]
            }
        });
    }

    async countCompletedJobs(): Promise<number> {
        return JobModel.countDocuments({ status: JOB_STATUS.COMPLETED });
    }

    async getStatusDistribution(): Promise<{ status: string; count: number }[]> {
        return JobModel.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } },
            { $project: { _id: 0, status: "$_id", count: 1 } }
        ]);
    }

    async getJobById(jobId: string): Promise<{ success: boolean; data?: JobResponseDTO; message?: string }> {
        const job = await this.findById(jobId);

        if (!job) {
            return { success: false, message: ErrorMessages.JOB_NOT_FOUND };
        }

        return { success: true, data: await mapJobToResponseDTO(job) };
    }
}