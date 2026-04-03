import { IJob, IJobRepository } from '../interfaces/job.interface';
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
            status: { $in: ['open', 'partially_assigned'] },
            visibility: 'public' 
        };
        
        if (filters.skillId) {
            if (filters.skillId.match(/^[0-9a-fA-F]{24}$/)) {
                query.skillId = filters.skillId;
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
            if (filters.locationId.match(/^[0-9a-fA-F]{24}$/)) {
                query.locationId = filters.locationId;
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
            status: { $in: ['open', 'partially_assigned', 'fully_assigned'] }
        })
        .populate('skillId', 'name')
        .populate('locationId', 'name')
        .populate('userId', 'name email')
        .sort({ createdAt: -1 });
    }

    async updateStatus(id: string, status: string): Promise<IJob | null> {
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