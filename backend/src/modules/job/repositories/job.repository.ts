import { IJob, IJobRepository } from '../interfaces/job.interface';
import mongoose, { Types } from 'mongoose';
import { JOB_STATUS } from '../../../constants/jobStatus';
import { JobModel } from '../models/job.model';
import { SkillModel } from '../../skill/models/skill.model';
import { LocationModel } from '../../location/models/location.model';
import { JobResponseDTO, mapJobToResponseDTO } from '../dtos/jobResponse.dto';

export class JobRepository implements IJobRepository {
    async create(jobData: Partial<IJob>): Promise<IJob> {
        const job = new JobModel(jobData);
        return await job.save();
    }

    async findByUser(userId: string): Promise<IJob[]> {
        return await JobModel.find({ userId })
            .populate('skillId', 'name')
            .populate('locationId', 'name')
            .sort({ createdAt: -1 });
    }

    async findAllOpen(page: number, limit: number, filters: any): Promise<{ jobs: IJob[], total: number }> {
        const query: any = {
            status: { $in: [JOB_STATUS.OPEN, JOB_STATUS.PARTIALLY_ASSIGNED] },
            visibility: 'public'
        };

        console.log("Incoming filters in repository:", filters);

        if (filters.skillId) {
            if (mongoose.Types.ObjectId.isValid(filters.skillId)) {
                query.skillId = new mongoose.Types.ObjectId(filters.skillId);
            } else {
                const skill = await SkillModel.findOne({ name: new RegExp(`^${filters.skillId}$`, 'i') });
                if (skill) {
                    query.skillId = skill._id;
                } else {
                    return { jobs: [], total: 0 };
                }
            }
        }
        if (filters.locationId) {
            if (mongoose.Types.ObjectId.isValid(filters.locationId)) {
                query.locationId = new mongoose.Types.ObjectId(filters.locationId);
            } else {
                const location = await LocationModel.findOne({ name: new RegExp(`^${filters.locationId}$`, 'i') });
                if (location) {
                    query.locationId = location._id;
                } else {
                    return { jobs: [], total: 0 };
                }
            }
        }

        // Budget Filtering
        if (filters.minBudget !== undefined && filters.minBudget !== null) {
            query['budget.max'] = { $gte: Number(filters.minBudget) };
        }
        if (filters.maxBudget !== undefined && filters.maxBudget !== null) {
            query['budget.min'] = { $lte: Number(filters.maxBudget) };
        }

        // Search Filtering (Title or Description)
        if (filters.search) {
            const searchRegex = new RegExp(filters.search, 'i');
            query.$or = [
                { title: searchRegex },
                { description: searchRegex }
            ];
        }

        console.log("Final MongoDB Query:", JSON.stringify(query, null, 2));

        const skip = (page - 1) * limit;

        const [jobs, total] = await Promise.all([
            JobModel.find(query)
                .populate('skillId', 'name')
                .populate('locationId', 'name')
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
            .populate('locationId', 'name')
            .populate('userId', 'name email')
            .populate({
                path: 'hiredProviderId',
                populate: { path: 'userId', select: 'name email profileImage headline isBlocked' }
            });
    }

    async findByProvider(providerId: string): Promise<IJob[]> {
        return await JobModel.find({
            hiredProviderId: providerId,
            status: { $in: [JOB_STATUS.OPEN, JOB_STATUS.PARTIALLY_ASSIGNED, JOB_STATUS.FULLY_ASSIGNED] }
        })
            .populate('skillId', 'name')
            .populate('locationId', 'name')
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

    async getJobById(jobId: string): Promise<{ success: boolean; data?: JobResponseDTO; message?: string }> {
        const job = await this.findById(jobId);
        if (!job) {
            return { success: false, message: 'Job not found' };
        }
        return { success: true, data: mapJobToResponseDTO(job) };
    }
}