import { Request, Response, NextFunction } from 'express';
import { CreateServiceRequestDTO } from '../dtos/createServiceRequest.dto';
import { RejectServiceRequestDTO } from '../dtos/rejectServiceRequest.dto';
import { AppError } from '../../../utils/AppError';
import { IServiceRequestController, IServiceRequestService } from '../interfaces/serviceRequest.interface';
import {HttpStatusCode} from "../../../constants/httpStatusCode"
import { ErrorMessages } from '../../../constants/messages/errorMessages';

export class ServiceRequestController implements IServiceRequestController {
    private _serviceRequestService: IServiceRequestService;

    constructor(serviceRequestService: IServiceRequestService) {
        this._serviceRequestService = serviceRequestService;
    }

    createRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new AppError(ErrorMessages.UNAUTHORIZED, HttpStatusCode.UNAUTH0RIZED);
            }

            const dto = CreateServiceRequestDTO.create(req.body);

            const result = await this._serviceRequestService.createRequest(userId, dto);

            if (!result.success) {
                throw new AppError(result.message, HttpStatusCode.CONFLICT);
            }

            res.status(HttpStatusCode.CREATED).json(result);
        } catch (error) {
            next(error);
        }
    };

    getUserRequests = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new AppError(ErrorMessages.UNAUTHORIZED, HttpStatusCode.UNAUTH0RIZED);
            }

            const result = await this._serviceRequestService.getUserRequests(userId);
            res.status(HttpStatusCode.OK).json(result);
        } catch (error) {
            next(error);
        }
    };

    getPendingRequests = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const page = Math.max(1, parseInt(req.query.page as string) || 1);
            const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
            const result = await this._serviceRequestService.getPendingRequests(page, limit);
            res.status(HttpStatusCode.OK).json(result);
        } catch (error) {
            next(error);
        }
    };

    approveRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const adminId = req.user?.userId;
            if (!adminId) {
                throw new AppError(ErrorMessages.UNAUTHORIZED, HttpStatusCode.UNAUTH0RIZED);
            }

            const id = req.params.id as string;
            if (!id) {
                throw new AppError(ErrorMessages.SERVICE_REQUEST_ID_REQUIRED, HttpStatusCode.BAD_REQUEST);
            }

            const result = await this._serviceRequestService.approveRequest(adminId, id);

            if (!result.success) {
                throw new AppError(result.message, HttpStatusCode.BAD_REQUEST);
            }

            res.status(HttpStatusCode.OK).json(result);
        } catch (error) {
            next(error);
        }
    };

    rejectRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const adminId = req.user?.userId;
            if (!adminId) {
                throw new AppError(ErrorMessages.UNAUTHORIZED, HttpStatusCode.UNAUTH0RIZED);
            }

            const id = req.params.id as string;
            if (!id) {
                throw new AppError(ErrorMessages.SERVICE_REQUEST_ID_REQUIRED, HttpStatusCode.BAD_REQUEST);
            }

            const dto = RejectServiceRequestDTO.create(req.body);
            const result = await this._serviceRequestService.rejectRequest(adminId, id, dto);

            if (!result.success) {
                throw new AppError(result.message, HttpStatusCode.BAD_REQUEST);
            }

            res.status(HttpStatusCode.OK).json(result);
        } catch (error) {
            next(error);
        }
    };
}
