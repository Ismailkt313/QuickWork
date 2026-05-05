import { Request, Response } from 'express';
import { IAssignmentController, IAssignmentService } from '../interfaces/assignment.interface';
import { AppError } from '../../../utils/AppError';
import { IServiceProviderRepository } from '../../serviceProvider/interfaces/serviceProvider.interface';
import { mapAssignmentToResponseDTO } from '../dtos/assignmentResponse.dto';
import { HttpStatusCode } from '../../../constants/httpStatusCode'
import { SuccessMessages } from '../../../constants/messages/successMessages';
import { ErrorMessages } from '../../../constants/messages/errorMessages';

export class AssignmentController implements IAssignmentController {
    private _assignmentService: IAssignmentService;
    private _serviceProviderRepository: IServiceProviderRepository;

    constructor(
        assignmentService: IAssignmentService,
        serviceProviderRepository: IServiceProviderRepository
    ) {
        this._assignmentService = assignmentService;
        this._serviceProviderRepository = serviceProviderRepository;
    }

    getProviderAssignments = async (req: Request, res: Response, next: any): Promise<void> => {
        try {
            const userId = req.user?.userId;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const search = req.query.search as string;
            const status = req.query.status as string;

            if (!userId) {
                throw new AppError(ErrorMessages.UNAUTHORIZED, HttpStatusCode.UNAUTH0RIZED);
            }

            const provider = await this._serviceProviderRepository.findByUserId(userId);
            if (!provider) {
                throw new AppError(ErrorMessages.PROVIDER_NOT_FOUND, HttpStatusCode.NOT_FOUND);
            }

            const { assignments, total, counts } = await this._assignmentService.getAssignmentsByProvider(provider._id.toString(), { page, limit, search, status });
            
            res.status(HttpStatusCode.OK).json({
                success: true,
                data: await Promise.all(assignments.map(mapAssignmentToResponseDTO)),
                total,
                page,
                limit,
                counts
            });
        } catch (error) {
            next(error);
        }
    };

    getAssignmentById = async (req: Request, res: Response, next: any): Promise<void> => {
        try {
            const userId = req.user?.userId;
            const assignmentId = req.params.id as string;
            const provider = await this._serviceProviderRepository.findByUserId(userId as string);
            const assignment = await this._assignmentService.getAssignmentById(assignmentId);

            const freelancerId = assignment?.freelancerId?._id ? assignment.freelancerId._id.toString() : assignment?.freelancerId?.toString();

            if (!assignment || !provider || freelancerId !== provider._id.toString()) {
                throw new AppError(ErrorMessages.ASSIGNMENT_NOT_FOUND, HttpStatusCode.UNAUTH0RIZED);
            }

            const jobId = assignment.jobId?._id ? assignment.jobId._id.toString() : assignment.jobId.toString();
            const coWorkers = await this._assignmentService.getAssignmentsByJobId(jobId);
            
            const mappedCoWorkers = coWorkers
                .filter(a => a._id.toString() !== assignmentId)
                .map((a: any) => ({
                    id: a._id.toString(),
                    userId: a.freelancerId?.userId?._id?.toString() || a.freelancerId?.userId?.toString() || '',
                    name: a.freelancerId?.userId?.name || 'Provider',
                    headline: a.freelancerId?.headline || '',
                    profileImage: a.freelancerId?.profileImage || '',
                    workStatus: a.workStatus
                }));

            const responseData = await mapAssignmentToResponseDTO(assignment);
            responseData.coWorkers = mappedCoWorkers;

            res.status(HttpStatusCode.OK).json({
                success: true,
                data: responseData
            });
        } catch (error) {
            next(error);
        }
    };

    updateStatus = async (req: Request, res: Response, next: any): Promise<void> => {
        try {
            const userId = req.user?.userId;
            const assignmentId = req.params.id as string;
            const { status } = req.body;

            const provider = await this._serviceProviderRepository.findByUserId(userId as string);
            const assignment = await this._assignmentService.getAssignmentById(assignmentId);

            const freelancerId = assignment?.freelancerId?._id ? assignment.freelancerId._id.toString() : assignment?.freelancerId?.toString();

            if (!assignment || !provider || freelancerId !== provider._id.toString()) {
                throw new AppError(ErrorMessages.ASSIGNMENT_NOT_FOUND, HttpStatusCode.NOT_FOUND);
            }

            const updated = await this._assignmentService.updateStatus(assignmentId, status);
            res.status(HttpStatusCode.OK).json({
                success: true,
                message: SuccessMessages.STATUS_UPDATED(status),
                data: updated ? await mapAssignmentToResponseDTO(updated) : null
            });
        } catch (error) {
            next(error);
        }
    };

    submitProof = async (req: Request, res: Response, next: any): Promise<void> => {
        try {
            const userId = req.user?.userId;
            const assignmentId = req.params.id as string;
            const { images, description } = req.body;

            const provider = await this._serviceProviderRepository.findByUserId(userId as string);
            const assignment = await this._assignmentService.getAssignmentById(assignmentId);

            const freelancerId = assignment?.freelancerId?._id ? assignment.freelancerId._id.toString() : assignment?.freelancerId?.toString();

            if (!assignment || !provider || freelancerId !== provider._id.toString()) {
                throw new AppError(ErrorMessages.ASSIGNMENT_NOT_FOUND, HttpStatusCode.NOT_FOUND);
            }

            const updated = await this._assignmentService.submitProof(assignmentId, { images, description });
            res.status(HttpStatusCode.OK).json({
                success: true,
                message: SuccessMessages.PROOF_SUBMITTED,
                data: updated ? await mapAssignmentToResponseDTO(updated) : null
            });
        } catch (error) {
            next(error);
        }
    };

    cancelByProvider = async (req: Request, res: Response, next: any): Promise<void> => {
        try {
            const userId = req.user?.userId;
            const id = req.params.id as string;
            const { notes } = req.body;

            const provider = await this._serviceProviderRepository.findByUserId(userId as string);
            if (!provider) {
                throw new AppError(ErrorMessages.PROVIDER_NOT_FOUND, HttpStatusCode.NOT_FOUND);
            }

            const updated = await this._assignmentService.cancelByProvider(id, provider._id.toString(), notes);

            res.status(HttpStatusCode.OK).json({
                success: true,
                message: 'Assignment cancelled successfully by provider',
                data: await mapAssignmentToResponseDTO(updated)
            });
        } catch (error: any) {
            next(error);
        }
    };

    cancelByClient = async (req: Request, res: Response, next: any): Promise<void> => {
        try {
            const userId = req.user?.userId;
            const id = req.params.id as string;
            const { notes } = req.body;

            const updated = await this._assignmentService.cancelByClient(id, userId as string, notes);

            res.status(HttpStatusCode.OK).json({
                success: true,
                message: 'Assignment cancelled successfully by client',
                data: await mapAssignmentToResponseDTO(updated)
            });
        } catch (error: any) {
            next(error);
        }
    };

    reportAbsence = async (req: Request, res: Response, next: any): Promise<void> => {
        try {
            const userId = req.user?.userId;
            const id = req.params.id as string;
            const { notes, evidence } = req.body;
            const updated = await this._assignmentService.reportAbsence(id, userId as string, notes, evidence);

            res.status(HttpStatusCode.OK).json({
                success: true,
                message: 'Absence reported successfully',
                data: await mapAssignmentToResponseDTO(updated)
            });
        } catch (error: any) {
            console.log('error absence', error);
            next(error);
        }
    };

    markAsPaidByCash = async (req: Request, res: Response, next: any): Promise<void> => {
        try {
            const userId = req.user?.userId;
            const id = req.params.id as string;
            const updated = await this._assignmentService.markAsPaidByCash(id, userId as string);
            res.status(HttpStatusCode.OK).json({
                success: true,
                message: 'Payment marked as paid by cash',
                data: await mapAssignmentToResponseDTO(updated)
            });
        } catch (error) {
            next(error);
        }
    };

    confirmPayment = async (req: Request, res: Response, next: any): Promise<void> => {
        try {
            const userId = req.user?.userId;
            const id = req.params.id as string;
            const provider = await this._serviceProviderRepository.findByUserId(userId as string);
            if (!provider) throw new AppError('Provider not found', HttpStatusCode.NOT_FOUND);

            const updated = await this._assignmentService.confirmPayment(id, provider._id.toString());
            res.status(HttpStatusCode.OK).json({
                success: true,
                message: 'Payment confirmed',
                data: await mapAssignmentToResponseDTO(updated)
            });
        } catch (error) {
            next(error);
        }
    };

    providerMarkAsPaid = async (req: Request, res: Response, next: any): Promise<void> => {
        try {
            const userId = req.user?.userId;
            const id = req.params.id as string;
            const provider = await this._serviceProviderRepository.findByUserId(userId as string);
            console.log('Provider found', provider);
            if (!provider) throw new AppError('Provider not found', HttpStatusCode.NOT_FOUND);

            const updated = await this._assignmentService.providerMarkAsPaid(id, provider._id.toString());
            res.status(HttpStatusCode.OK).json({
                success: true,
                message: 'Payment marked as received by hand',
                data: await mapAssignmentToResponseDTO(updated)
            });
        } catch (error) {
            next(error);
        }
    };

    rejectPayment = async (req: Request, res: Response, next: any): Promise<void> => {
        try {
            const userId = req.user?.userId;
            const id = req.params.id as string;
            const provider = await this._serviceProviderRepository.findByUserId(userId as string);
            if (!provider) throw new AppError('Provider not found', HttpStatusCode.NOT_FOUND);

            const updated = await this._assignmentService.rejectPayment(id, provider._id.toString());
            res.status(HttpStatusCode.OK).json({
                success: true,
                message: 'Payment confirmation rejected',
                data: await mapAssignmentToResponseDTO(updated)
            });
        } catch (error) {
            next(error);
        }
    };
}

