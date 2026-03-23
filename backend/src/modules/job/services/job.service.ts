import { IJobRepository, IJobService } from '../interfaces/job.interface';
import { CreateJobDTO } from '../dtos/createJob.dto';
import { JobResponseDTO, mapJobToResponseDTO } from '../dtos/jobResponse.dto';

export class JobService implements IJobService {
    private jobRepository: IJobRepository;

    constructor(jobRepository: IJobRepository) {
        this.jobRepository = jobRepository;
    }

    async createJob(userId: string, dto: CreateJobDTO): Promise<{ success: boolean; message: string; data?: JobResponseDTO }> {
        const newJob = await this.jobRepository.create({
            title: dto.title,
            description: dto.description,
            skillId: dto.skillId as any,
            locationId: dto.locationId as any,
            budget: dto.budget,
            jobType: dto.jobType,
            isUrgent: dto.isUrgent,
            experience: dto.experience || 'Intermediate',
            duration: dto.duration || 1,
            freelancersNeeded: dto.freelancersNeeded || 1,
            userId: userId as any,
            status: 'open'
        });

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

    async getAllOpenJobs(page: number = 1, limit: number = 10, filters: any = {}): Promise<{ 
        success: boolean; 
        data: JobResponseDTO[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            pages: number;
        }
    }> {
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
}
