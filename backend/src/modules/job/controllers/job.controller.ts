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

    getAllOpenJobs = async (req: Request, res: Response, next: any): Promise<void> => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const skillId = req.query.skillId as string;
            const locationId = req.query.locationId as string;

            const result = await this.jobService.getAllOpenJobs(page, limit, { skillId, locationId });
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    };

    getAvailableJobs = async (req: Request, res: Response, next: any): Promise<void> => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const skillId = req.query.skillId as string;
            const locationId = req.query.locationId as string;

            const result = await this.jobService.getAllOpenJobs(page, limit, { skillId, locationId });
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    };
}
