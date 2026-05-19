import { Request, Response, NextFunction } from 'express';
import { IAssignmentController, IAssignmentService, IAssignment } from '../interfaces/assignment.interface';
import { AppError } from '../../../utils/AppError';
import { IServiceProviderService } from '../../serviceProvider/interfaces/serviceProvider.interface';
import { mapAssignmentToResponseDTO } from '../dtos/assignmentResponse.dto';
import { HttpStatusCode } from '../../../constants/httpStatusCode'
import { SuccessMessages } from '../../../constants/messages/successMessages';
import { ErrorMessages } from '../../../constants/messages/errorMessages';
import { ApiResponse } from '../../../utils/ApiResponse';

export class AssignmentController implements IAssignmentController {
    private _assignmentService: IAssignmentService;
    private _serviceProviderService: IServiceProviderService;

    constructor(
        assignmentService: IAssignmentService,
        serviceProviderService: IServiceProviderService
    ) {
        this._assignmentService = assignmentService;
        this._serviceProviderService = serviceProviderService;
    }

    public getProviderAssignments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.userId;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const search = req.query.search as string;
            const status = req.query.status as string;

            if (!userId) {
                throw new AppError(ErrorMessages.UNAUTHORIZED, HttpStatusCode.UNAUTH0RIZED);
            }

            const provider = await this._serviceProviderService.getProviderByUserId(userId);
            if (!provider) {
                throw new AppError(ErrorMessages.PROVIDER_NOT_FOUND, HttpStatusCode.NOT_FOUND);
            }

            const { assignments, total, counts } = await this._assignmentService.getAssignmentsByProvider(provider._id.toString(), { page, limit, search, status });

            ApiResponse.sendPagination(res, await Promise.all(assignments.map(mapAssignmentToResponseDTO)), { total, page, limit, counts });
        } catch (error) {
            next(error);
        }
    };

    public getAssignmentById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.userId;
            const assignmentId = req.params.id as string;
            const provider = await this._serviceProviderService.getProviderByUserId(userId as string);
            const assignment = await this._assignmentService.getAssignmentById(assignmentId);

            const freelancerId = assignment?.freelancerId?._id ? assignment.freelancerId._id.toString() : assignment?.freelancerId?.toString();

            if (!assignment || !provider || freelancerId !== provider._id.toString()) {
                throw new AppError(ErrorMessages.ASSIGNMENT_NOT_FOUND, HttpStatusCode.UNAUTH0RIZED);
            }

            const jobId = assignment.jobId?._id ? assignment.jobId._id.toString() : assignment.jobId.toString();
            const coWorkers = await this._assignmentService.getAssignmentsByJobId(jobId);

            const mappedCoWorkers = coWorkers
                .filter(a => a._id.toString() !== assignmentId)
                .map((a: IAssignment) => {
                    const freelancer = a.freelancerId as unknown as { userId?: { _id?: { toString: () => string }; toString: () => string; name?: string }; headline?: string; profileImage?: string };
                    return {
                        id: a._id.toString(),
                        userId: freelancer?.userId?._id?.toString() || freelancer?.userId?.toString() || '',
                        name: freelancer?.userId?.name || 'Provider',
                        headline: freelancer?.headline || '',
                        profileImage: freelancer?.profileImage || '',
                        workStatus: a.workStatus
                    };
                });

            const responseData = await mapAssignmentToResponseDTO(assignment);
            responseData.coWorkers = mappedCoWorkers;

            ApiResponse.sendSuccess(res, responseData);
        } catch (error) {
            next(error);
        }
    };

    public updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.userId;
            const assignmentId = req.params.id as string;
            const { status } = req.body;

            const provider = await this._serviceProviderService.getProviderByUserId(userId as string);
            const assignment = await this._assignmentService.getAssignmentById(assignmentId);

            const freelancerId = assignment?.freelancerId?._id ? assignment.freelancerId._id.toString() : assignment?.freelancerId?.toString();

            if (!assignment || !provider || freelancerId !== provider._id.toString()) {
                throw new AppError(ErrorMessages.ASSIGNMENT_NOT_FOUND, HttpStatusCode.NOT_FOUND);
            }

            const updated = await this._assignmentService.updateStatus(assignmentId, status);
            ApiResponse.sendSuccess(res, updated ? await mapAssignmentToResponseDTO(updated) : null, SuccessMessages.STATUS_UPDATED(status));
        } catch (error) {
            next(error);
        }
    };

    public submitProof = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.userId;
            const assignmentId = req.params.id as string;
            const { images, description } = req.body;

            const provider = await this._serviceProviderService.getProviderByUserId(userId as string);
            const assignment = await this._assignmentService.getAssignmentById(assignmentId);

            const freelancerId = assignment?.freelancerId?._id ? assignment.freelancerId._id.toString() : assignment?.freelancerId?.toString();

            if (!assignment || !provider || freelancerId !== provider._id.toString()) {
                throw new AppError(ErrorMessages.ASSIGNMENT_NOT_FOUND, HttpStatusCode.NOT_FOUND);
            }

            const updated = await this._assignmentService.submitProof(assignmentId, { images, description });
            ApiResponse.sendSuccess(res, updated ? await mapAssignmentToResponseDTO(updated) : null, SuccessMessages.PROOF_SUBMITTED);
        } catch (error) {
            next(error);
        }
    };

    public cancelByProvider = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.userId;
            const id = req.params.id as string;
            const { notes } = req.body;

            const provider = await this._serviceProviderService.getProviderByUserId(userId as string);
            if (!provider) {
                throw new AppError(ErrorMessages.PROVIDER_NOT_FOUND, HttpStatusCode.NOT_FOUND);
            }

            const updated = await this._assignmentService.cancelByProvider(id, provider._id.toString(), notes);

            ApiResponse.sendSuccess(res, await mapAssignmentToResponseDTO(updated), 'Assignment cancelled successfully by provider');
        } catch (error) {
            next(error);
        }
    };

    public cancelByClient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.userId;
            const id = req.params.id as string;
            const { notes } = req.body;

            const updated = await this._assignmentService.cancelByClient(id, userId as string, notes);

            ApiResponse.sendSuccess(res, await mapAssignmentToResponseDTO(updated), 'Assignment cancelled successfully by client');
        } catch (error) {
            next(error);
        }
    };

    public reportAbsence = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.userId;
            const id = req.params.id as string;
            const { notes, evidence } = req.body;
            const updated = await this._assignmentService.reportAbsence(id, userId as string, notes, evidence);

            ApiResponse.sendSuccess(res, await mapAssignmentToResponseDTO(updated), 'Absence reported successfully');
        } catch (error) {
            next(error);
        }
    };

    public markAsPaidByCash = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.userId;
            const id = req.params.id as string;
            const updated = await this._assignmentService.markAsPaidByCash(id, userId as string);
            ApiResponse.sendSuccess(res, await mapAssignmentToResponseDTO(updated), 'Payment marked as paid by cash');
        } catch (error) {
            next(error);
        }
    };

    public confirmPayment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.userId;
            const id = req.params.id as string;
            const provider = await this._serviceProviderService.getProviderByUserId(userId as string);
            if (!provider) throw new AppError('Provider not found', HttpStatusCode.NOT_FOUND);

            const updated = await this._assignmentService.confirmPayment(id, provider._id.toString());
            ApiResponse.sendSuccess(res, await mapAssignmentToResponseDTO(updated), 'Payment confirmed');
        } catch (error) {
            next(error);
        }
    };

    public providerMarkAsPaid = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.userId;
            const id = req.params.id as string;
            const provider = await this._serviceProviderService.getProviderByUserId(userId as string);

            if (!provider) throw new AppError('Provider not found', HttpStatusCode.NOT_FOUND);

            const updated = await this._assignmentService.providerMarkAsPaid(id, provider._id.toString());
            ApiResponse.sendSuccess(res, await mapAssignmentToResponseDTO(updated), 'Payment marked as received by hand');
        } catch (error) {
            next(error);
        }
    };

    public rejectPayment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.userId;
            const id = req.params.id as string;
            const provider = await this._serviceProviderService.getProviderByUserId(userId as string);
            if (!provider) throw new AppError('Provider not found', HttpStatusCode.NOT_FOUND);

            const updated = await this._assignmentService.rejectPayment(id, provider._id.toString());
            ApiResponse.sendSuccess(res, await mapAssignmentToResponseDTO(updated), 'Payment confirmation rejected');
        } catch (error) {
            next(error);
        }
    };
}


