import { IJob, IJobRepository } from '../interfaces/job.interface';
import { ErrorMessages } from '../../../constants/messages/errorMessages';
import mongoose from 'mongoose';
import { JOB_STATUS } from '../../../constants/jobStatus';
import { JobModel } from '../models/job.model';
import { SkillModel } from '../../skill/models/skill.model';
import { LocationModel } from '../../location/models/location.model';
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
        const query: any = { userId };


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
            query.$or = [
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

    async findAllOpen(
        page: number,
        limit: number,
        filters: any,
        skill: string[],
        excludeJobIds?: string[]
    ): Promise<{ jobs: IJob[], total: number }> {

        const query: any = {
            status: { $in: [JOB_STATUS.OPEN, JOB_STATUS.PARTIALLY_ASSIGNED] },
            visibility: 'public',
            skillId: { $in: skill }
        };

        if (excludeJobIds && excludeJobIds.length > 0) {
            query._id = { $nin: excludeJobIds.map(id => new mongoose.Types.ObjectId(id)) };
        }


        if (filters.skillId) {
            if (mongoose.Types.ObjectId.isValid(filters.skillId)) {
                query.skillId = new mongoose.Types.ObjectId(filters.skillId);
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
            if (mongoose.Types.ObjectId.isValid(filters.locationId)) {
                query['location.district'] = new mongoose.Types.ObjectId(filters.locationId);
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
            const searchRegex = new RegExp(filters.search, 'i');
            query.$or = [
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

    async updateStatus(id: string, status: JOB_STATUS): Promise<IJob | null> {
        return await JobModel.findByIdAndUpdate(
            id,
            { $set: { status } },
            { new: true }
        );
    }

    async findByConditionAndUpdate(query: any, update: any): Promise<IJob | null> {
        return await JobModel.findOneAndUpdate(query, update, { new: true });
    }

    async find(query: any): Promise<IJob[]> {
        return await JobModel.find(query);
    }

    async getJobById(jobId: string): Promise<{ success: boolean; data?: JobResponseDTO; message?: string }> {
        const job = await this.findById(jobId);

        if (!job) {
            return { success: false, message: ErrorMessages.JOB_NOT_FOUND };
        }

        return { success: true, data: await mapJobToResponseDTO(job) };
    }
}