import { Request, Response } from 'express';
import { CreateJobDTO } from '../dtos/createJob.dto';
import { AppError } from '../../../utils/AppError';
import { IJobController, IJobService } from '../interfaces/job.interface';

export class JobController implements IJobController {
    private jobService: IJobService;

    constructor(jobService: IJobService) {
        this.jobService = jobService;
    }

    createJob = async (req: Request, res: Response, next: any): Promise<void> => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new AppError('Unauthorized access', 401);
            }
            console.log("Create Job Request Body:", req.body);
            const dto = CreateJobDTO.create(req.body);
            console.log("Validated DTO:", dto);
            const result = await this.jobService.createJob(userId, dto);

            if (!result.success) {
                throw new AppError(result.message, 400);
            }

            res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    };

    getUserJobs = async (req: Request, res: Response, next: any): Promise<void> => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new AppError('Unauthorized access', 401);
            }

            const result = await this.jobService.getJobsByUser(userId);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    };

    availableJobs = async (req: Request, res: Response, next: any): Promise<void> => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const skillId = req.query.skillId as string;
            const locationId = req.query.locationId as string;

            const result = await this.jobService.availableJobs(page, limit, { skillId, locationId });
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    };
    
    getJobById = async (req: Request, res: Response, next: any): Promise<void> => {
        try {
            const jobId = req.params.jobId as string;
            if (!jobId) {
                throw new AppError('Job ID is required', 400);
            }

            const result = await this.jobService.getJobById(jobId);
            if (!result.success) {
                throw new AppError(result.message || 'Job not found', 404);
            }
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    };
}
