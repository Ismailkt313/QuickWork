import { Request, Response } from 'express';
import { CreateJobDTO } from '../dtos/createJob.dto';
import { AppError } from '../../../utils/AppError';
import { IJobController, IJobService } from '../interfaces/job.interface';
import { mapProviderToResponseDTO } from '../../serviceProvider/dtos/providerResponse.dto';
import {HttpStatusCode} from "../../../constants/httpStatusCode"
import { IAssignmentRepository } from '../../assignment/interfaces/assignment.interface';

export class JobController implements IJobController {
    private _jobService: IJobService;
    private _assignmentRepo: IAssignmentRepository;

    constructor(jobService: IJobService, assignmentRepo: IAssignmentRepository) {
        this._jobService = jobService;
        this._assignmentRepo = assignmentRepo;
    }
    createJob = async (req: Request, res: Response, next: any): Promise<void> => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new AppError('Unauthorized access', HttpStatusCode.UNAUTH0RIZED);
            }
             const dto = CreateJobDTO.create(req.body);

            const result = await this._jobService.createJob(userId, dto);

            if (!result.success) {
                throw new AppError(result.message, HttpStatusCode.BAD_REQUEST);
            }

            res.status(HttpStatusCode.CREATED).json(result);
        } catch (error) {
            next(error);
        }
    };

    getUserJobs = async (req: Request, res: Response, next: any): Promise<void> => {
        try {
             const userId = req.user?.userId;
            if (!userId) {
                throw new AppError('Unauthorized access', HttpStatusCode.BAD_REQUEST);
            }

            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const status = req.query.status as string;
            const search = req.query.search as string;
            const visibility = req.query.visibility as string;

             const result = await this._jobService.getJobsByUser(userId, page, limit, { status, search, visibility });
             res.status(HttpStatusCode.OK).json(result);
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

            const result = await this._jobService.availableJobs(
                page,
                limit,
                { skillId, locationId, minBudget, maxBudget, search },
                userId
            );
            res.status(HttpStatusCode.OK).json(result);
        } catch (error) {
            next(error);
        }
    };

    getJobById = async (req: Request, res: Response, next: any): Promise<void> => {
        try {
            const jobId = req.params.jobId as string;
            if (!jobId) {
                throw new AppError('Job ID is required', HttpStatusCode.BAD_REQUEST);
            }

            const userId = req.user?.userId;
            const result = await this._jobService.getJobById(jobId, userId);
            if (!result.success) {
                throw new AppError(result.message || 'Job not found', HttpStatusCode.NOT_FOUND);
            }
            res.status(HttpStatusCode.OK).json(result);
        } catch (error) {
            next(error);
        }
    };

    getDirectOffers = async (req: Request, res: Response, next: any): Promise<void> => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new AppError('Unauthorized access', HttpStatusCode.UNAUTH0RIZED);
            }

            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const search = req.query.search as string;
            const filter = req.query.filter as string;

            const result = await this._jobService.getDirectOffers(userId, page, limit, search, filter);
            res.status(HttpStatusCode.OK).json(result);
        } catch (error) {
            next(error);
        }
    };

    acceptOffer = async (req: Request, res: Response, next: any): Promise<void> => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new AppError('Unauthorized access', HttpStatusCode.UNAUTH0RIZED);
            }

            const jobId = req.params.jobId as string;
            const { amount } = req.body;
            const result = await this._jobService.acceptOffer(jobId, userId, amount);
            res.status(HttpStatusCode.OK).json(result);
        } catch (error) {
            next(error);
        }
    };

    rejectOffer = async (req: Request, res: Response, next: any): Promise<void> => {
        try {
            const userId = req.user?.userId;

            if (!userId) {
                throw new AppError('Unauthorized access', HttpStatusCode.UNAUTH0RIZED);
            }

            const jobId = req.params.jobId as string;
            const { reason } = req.body;
            const result = await this._jobService.rejectOffer(jobId, userId, reason);
            res.status(HttpStatusCode.OK).json(result);
        } catch (error) {
            next(error);
        }
    };

    acceptJob = async (req: Request, res: Response, next: any): Promise<void> => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new AppError('Unauthorized access', HttpStatusCode.UNAUTH0RIZED);
            }

            const jobId = req.params.jobId as string;
            const { amount } = req.body;
            const result = await this._jobService.acceptJob(jobId, userId, amount);
            res.status(HttpStatusCode.OK).json(result);
        } catch (error) {
            next(error);
        }
    };

    cancelJob = async (req: Request, res: Response, next: any): Promise<void> => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new AppError('Unauthorized access', HttpStatusCode.UNAUTH0RIZED);
            }

            const jobId = req.params.jobId as string;
            const result = await this._jobService.cancelJob(jobId, userId);
            res.status(HttpStatusCode.OK).json(result);
        } catch (error) {
            next(error);
        }
    };

    getJobAssignments = async (req: Request, res: Response, next: any): Promise<void> => {
        try {
            const userId = req.user?.userId;
            if (!userId) throw new AppError('Unauthorized access', HttpStatusCode.UNAUTH0RIZED);

            const jobId = req.params.jobId as string;
            const assignments = await this._assignmentRepo.findWithFreelancer(jobId);

            const providers = assignments.map((a: any) => ({
                assignmentId: a._id.toString(),
                workStatus: a.workStatus,
                assignedAt: a.assignedAt,
                provider: a.freelancerId ? mapProviderToResponseDTO(a.freelancerId) : null
            }));

            res.status(HttpStatusCode.OK).json({ success: true, data: providers });
        } catch (error) {
            next(error);
        }
    };
}
