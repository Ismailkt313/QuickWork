import { Request, Response } from 'express';
import { CreateJobDTO } from '../dtos/createJob.dto';
import { AppError } from '../../../utils/AppError';
import { IJobController, IJobService } from '../interfaces/job.interface';
import { mapProviderToResponseDTO } from '../../serviceProvider/dtos/providerResponse.dto';

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
            console.log("Fetching jobs for userId:", req.user?.userId);
            const userId = req.user?.userId;
            if (!userId) {
                throw new AppError('Unauthorized access', 401);
            }
                console.log("Fetching jobs for userId:", userId);
            const result = await this.jobService.getJobsByUser(userId);
            console.log("Jobs fetched for userId:", userId, "Result:", result);
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
            const minBudget = req.query.minBudget as string;
            const maxBudget = req.query.maxBudget as string;
            const search = req.query.search as string;
            const userId = req.user?.userId;

            const result = await this.jobService.availableJobs(
                page, 
                limit, 
                { skillId, locationId, minBudget, maxBudget, search }, 
                userId
            );
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

            const userId = req.user?.userId;
            const result = await this.jobService.getJobById(jobId, userId);
            if (!result.success) {
                throw new AppError(result.message || 'Job not found', 404);
            }
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    };

    getDirectOffers = async (req: Request, res: Response, next: any): Promise<void> => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new AppError('Unauthorized access', 401);
            }

            const result = await this.jobService.getDirectOffers(userId);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    };

    acceptOffer = async (req: Request, res: Response, next: any): Promise<void> => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new AppError('Unauthorized access', 401);
            }

            const jobId = req.params.jobId as string;
            const result = await this.jobService.acceptOffer(jobId, userId);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    };

    rejectOffer = async (req: Request, res: Response, next: any): Promise<void> => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new AppError('Unauthorized access', 401);
            }

            const jobId = req.params.jobId as string;
            const { reason } = req.body;
            const result = await this.jobService.rejectOffer(jobId, userId, reason);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    };

    acceptJob = async (req: Request, res: Response, next: any): Promise<void> => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new AppError('Unauthorized access', 401);
            }

            const jobId = req.params.jobId as string;
            const result = await this.jobService.acceptJob(jobId, userId);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    };

    cancelJob = async (req: Request, res: Response, next: any): Promise<void> => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new AppError('Unauthorized access', 401);
            }

            const jobId = req.params.jobId as string;
            const result = await this.jobService.cancelJob(jobId, userId);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    };

    getJobAssignments = async (req: Request, res: Response, next: any): Promise<void> => {
        try {
            const userId = req.user?.userId;
            if (!userId) throw new AppError('Unauthorized access', 401);

            const jobId = req.params.jobId as string;
            // Fetch AssignmentModel dynamically to avoid circular deps, or just require it
            const { AssignmentModel } = require('../../assignment/models/assignment.model');
            const assignments = await AssignmentModel.find({ jobId })
                .populate({
                    path: 'freelancerId',
                    populate: { path: 'userId', select: 'name email profileImage headline' }
                });

            const providers = assignments.map((a: any) => ({
                assignmentId: a._id.toString(),
                workStatus: a.workStatus,
                assignedAt: a.assignedAt,
                provider: a.freelancerId ? mapProviderToResponseDTO(a.freelancerId) : null
            }));

            res.status(200).json({ success: true, data: providers });
        } catch (error) {
            next(error);
        }
    };
}
