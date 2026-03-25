import { IJobRepository, IJobService } from '../interfaces/job.interface';
import { CreateJobDTO } from '../dtos/createJob.dto';
import { JobResponseDTO, mapJobToResponseDTO } from '../dtos/jobResponse.dto';
import { Types } from 'mongoose';

export class JobService implements IJobService {
    private jobRepository: IJobRepository;

    constructor(jobRepository: IJobRepository) {
        this.jobRepository = jobRepository;
    }

    async createJob(userId: string, dto: CreateJobDTO): Promise<{ success: boolean; message: string; data?: JobResponseDTO }> {
        let endDate: Date;
        const start = new Date(dto.startDate);

        if (dto.durationType === 'multi_day' && dto.days) {
            endDate = new Date(start);
            endDate.setDate(start.getDate() + (dto.days - 1));
        } else {
            endDate = start;
        }

        const newJob = await this.jobRepository.create({
            title: dto.title,
            description: dto.description,
            skillId: new Types.ObjectId(dto.skillId) as any,
            locationId: new Types.ObjectId(dto.locationId) as any,
            userId: new Types.ObjectId(userId) as any,
            budget: dto.budget,
            jobType: dto.jobType,
            isUrgent: dto.isUrgent,
            experience: dto.experience,
            durationType: dto.durationType,
            schedule: {
                startDate: start,
                endDate: endDate
            },
            days: dto.days,
            freelancersNeeded: dto.freelancersNeeded,
            status: 'open',
            applicantsCount: 0
        });
        console.log("New Job Created:", newJob);
        const job = await this.jobRepository.findById(newJob._id.toString());

        return {
            success: true,
            message: 'Job created successfully',
            data: job ? mapJobToResponseDTO(job) : undefined
        };
    }

    async getJobsByUser(userId: string): Promise<{ success: boolean; data: JobResponseDTO[] }> {
        const jobs = await this.jobRepository.findByUser(userId);
        return {
            success: true,
            data: jobs.map(mapJobToResponseDTO)
        };
    }

    async availableJobs(page: number = 1, limit: number = 10, filters: any = {}): Promise<import('../interfaces/job.interface').IJobPaginationResponse> {
        const { jobs, total } = await this.jobRepository.findAllOpen(page, limit, filters);
        
        return {
            success: true,
            data: jobs.map(mapJobToResponseDTO),
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        };
    }
    
    async getJobById(jobId: string): Promise<{ success: boolean; data?: JobResponseDTO; message?: string }> {
        const job = await this.jobRepository.findById(jobId);
        if (!job) {
            return { success: false, message: 'Job not found' };
        }
        return { success: true, data: mapJobToResponseDTO(job) };
    }

}
