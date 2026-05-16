import { Request, Response, NextFunction } from 'express';
import { CreateJobDTO } from '../dtos/createJob.dto';
import { AppError } from '../../../utils/AppError';
import { IJobController, IJobService } from '../interfaces/job.interface';
import { mapProviderToResponseDTO } from '../../serviceProvider/dtos/providerResponse.dto';
import { HttpStatusCode } from "../../../constants/httpStatusCode";
import { IAssignmentService } from '../../assignment/interfaces/assignment.interface';
import { ErrorMessages } from '../../../constants/messages/errorMessages';

import { ITokenPayload } from '../../auth/interfaces/auth.interface';

interface RequestWithUser extends Request {
    user?: ITokenPayload;
}

export class JobController implements IJobController {
    private _jobService: IJobService;
    private _assignmentService: IAssignmentService;

    constructor(jobService: IJobService, assignmentService: IAssignmentService) {
        this._jobService = jobService;
        this._assignmentService = assignmentService;
    }
    public createJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = (req as RequestWithUser).user?.userId;
            if (!userId) {
                throw new AppError(ErrorMessages.UNAUTHORIZED, HttpStatusCode.UNAUTH0RIZED);
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

    public getUserJobs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
             const userId = (req as RequestWithUser).user?.userId;
            if (!userId) {
                throw new AppError(ErrorMessages.UNAUTHORIZED, HttpStatusCode.BAD_REQUEST);
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

    public availableJobs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const skillId = req.query.skillId as string;
            const locationId = req.query.locationId as string;
            const minBudget = req.query.minBudget as string;
            const maxBudget = req.query.maxBudget as string;
            const search = req.query.search as string;
            const userId = (req as RequestWithUser).user?.userId;

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

    public getJobById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const jobId = req.params.jobId as string;
            if (!jobId) {
                throw new AppError(ErrorMessages.JOB_ID_REQUIRED, HttpStatusCode.BAD_REQUEST);
            }

            const userId = (req as RequestWithUser).user?.userId;
            const result = await this._jobService.getJobById(jobId, userId);
            if (!result.success) {
                throw new AppError(result.message || ErrorMessages.JOB_NOT_FOUND, HttpStatusCode.NOT_FOUND);
            }
            res.status(HttpStatusCode.OK).json(result);
        } catch (error) {
            next(error);
        }
    };

    public getDirectOffers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = (req as RequestWithUser).user?.userId;
            if (!userId) {
                throw new AppError(ErrorMessages.UNAUTHORIZED, HttpStatusCode.UNAUTH0RIZED);
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

    public acceptOffer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = (req as RequestWithUser).user?.userId;
            if (!userId) {
                throw new AppError(ErrorMessages.UNAUTHORIZED, HttpStatusCode.UNAUTH0RIZED);
            }

            const jobId = req.params.jobId as string;
            const { amount } = req.body;
            const result = await this._jobService.acceptOffer(jobId, userId, amount);
            res.status(HttpStatusCode.OK).json(result);
        } catch (error) {
            next(error);
        }
    };

    public rejectOffer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = (req as RequestWithUser).user?.userId;

            if (!userId) {
                throw new AppError(ErrorMessages.UNAUTHORIZED, HttpStatusCode.UNAUTH0RIZED);
            }

            const jobId = req.params.jobId as string;
            const { reason } = req.body;
            const result = await this._jobService.rejectOffer(jobId, userId, reason);
            res.status(HttpStatusCode.OK).json(result);
        } catch (error) {
            next(error);
        }
    };

    public acceptJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = (req as RequestWithUser).user?.userId;
            if (!userId) {
                throw new AppError(ErrorMessages.UNAUTHORIZED, HttpStatusCode.UNAUTH0RIZED);
            }

            const jobId = req.params.jobId as string;
            const { amount } = req.body;
            const result = await this._jobService.acceptJob(jobId, userId, amount);
            res.status(HttpStatusCode.OK).json(result);
        } catch (error) {
            next(error);
        }
    };

    public cancelJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = (req as RequestWithUser).user?.userId;
            if (!userId) {
                throw new AppError(ErrorMessages.UNAUTHORIZED, HttpStatusCode.UNAUTH0RIZED);
            }

            const jobId = req.params.jobId as string;
            const result = await this._jobService.cancelJob(jobId, userId);
            res.status(HttpStatusCode.OK).json(result);
        } catch (error) {
            next(error);
        }
    };

    public getJobAssignments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = (req as RequestWithUser).user?.userId;
            if (!userId) throw new AppError(ErrorMessages.UNAUTHORIZED, HttpStatusCode.UNAUTH0RIZED);

            const jobId = req.params.jobId as string;
            const assignments = await this._assignmentService.getJobAssignments(jobId);

            const providers = assignments.map((a) => ({
                assignmentId: a._id.toString(),
                workStatus: a.workStatus,
                assignedAt: a.assignedAt as Date,
                provider: a.freelancerId ? mapProviderToResponseDTO(a.freelancerId as unknown as Record<string, unknown>) : null
            }));

            res.status(HttpStatusCode.OK).json({ success: true, data: providers });
        } catch (error) {
            next(error);
        }
    };

    public getAllJobsAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const status = req.query.status as string;
            const search = req.query.search as string;
            const visibility = req.query.visibility as string;
            const type = req.query.type as string;
            const skillId = req.query.skillId as string;
            const minBudget = req.query.minBudget ? parseInt(req.query.minBudget as string) : undefined;
            const maxBudget = req.query.maxBudget ? parseInt(req.query.maxBudget as string) : undefined;

            const result = await this._jobService.getAllJobsAdmin(page, limit, { 
                status, search, visibility, type: type as 'disputed' | 'flagged' | 'stalled' | 'payments' | undefined, skillId, minBudget, maxBudget 
            });
            res.status(HttpStatusCode.OK).json(result);
        } catch (error) {
            next(error);
        }
    };

    public getJobDetailsAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const jobId = req.params.jobId as string;
            const result = await this._jobService.adminGetJobDetails(jobId);
            if (!result.success) {
                throw new AppError(result.message || ErrorMessages.JOB_NOT_FOUND, HttpStatusCode.NOT_FOUND);
            }
            res.status(HttpStatusCode.OK).json(result);
        } catch (error) {
            next(error);
        }
    };

    public adminCancelJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const jobId = req.params.jobId as string;
            const { reason } = req.body;
            const adminId = (req as RequestWithUser).user?.userId;

            if (!reason) {
                throw new AppError(ErrorMessages.CANCELLATION_REASON_REQUIRED, HttpStatusCode.BAD_REQUEST);
            }

            const result = await this._jobService.adminCancelJob(jobId, reason, adminId || '');
            res.status(HttpStatusCode.OK).json(result);
        } catch (error) {
            next(error);
        }
    };
}

