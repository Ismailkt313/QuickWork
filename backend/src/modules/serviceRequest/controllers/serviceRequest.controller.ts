import { Request, Response } from 'express';
import { CreateServiceRequestDTO } from '../dtos/createServiceRequest.dto';
import { RejectServiceRequestDTO } from '../dtos/rejectServiceRequest.dto';
import { AppError } from '../../../utils/AppError';
import { IServiceRequestController, IServiceRequestService } from '../interfaces/serviceRequest.interface';
import {HttpStatusCode} from "../../../constants/httpStatusCode"


export class ServiceRequestController implements IServiceRequestController {
    private serviceRequestService: IServiceRequestService;

    constructor(serviceRequestService: IServiceRequestService) {
        this.serviceRequestService = serviceRequestService;
    }

    createRequest = async (req: Request, res: Response, next: any): Promise<void> => {
        try {
            console.log('Creating service request with body:', req.body);
            const userId = req.user?.userId;
            if (!userId) {
                throw new AppError('Unauthorized access', HttpStatusCode.UNAUTH0RIZED);
            }

            const dto = CreateServiceRequestDTO.create(req.body);

            const result = await this.serviceRequestService.createRequest(userId, dto);

            if (!result.success) {
                throw new AppError(result.message, HttpStatusCode.CONFLICT);
            }

            res.status(HttpStatusCode.CREATED).json(result);
        } catch (error) {
            next(error);
        }
    };

    getUserRequests = async (req: Request, res: Response, next: any): Promise<void> => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new AppError('Unauthorized access', HttpStatusCode.UNAUTH0RIZED);
            }

            const result = await this.serviceRequestService.getUserRequests(userId);
            res.status(HttpStatusCode.OK).json(result);
        } catch (error) {
            next(error);
        }
    };

    getPendingRequests = async (req: Request, res: Response, next: any): Promise<void> => {
        try {
            const result = await this.serviceRequestService.getPendingRequests();
            res.status(HttpStatusCode.OK).json(result);
        } catch (error) {
            next(error);
        }
    };

    approveRequest = async (req: Request, res: Response, next: any): Promise<void> => {
        try {
            const adminId = req.user?.userId;
            if (!adminId) {
                throw new AppError('Unauthorized access', HttpStatusCode.UNAUTH0RIZED);
            }

            const id = req.params.id as string;
            if (!id) {
                throw new AppError('Service request ID is required', HttpStatusCode.BAD_REQUEST);
            }

            const result = await this.serviceRequestService.approveRequest(adminId, id);

            if (!result.success) {
                throw new AppError(result.message, HttpStatusCode.BAD_REQUEST);
            }

            res.status(HttpStatusCode.OK).json(result);
        } catch (error) {
            next(error);
        }
    };

    rejectRequest = async (req: Request, res: Response, next: any): Promise<void> => {
        try {
            const adminId = req.user?.userId;
            if (!adminId) {
                throw new AppError('Unauthorized access', HttpStatusCode.UNAUTH0RIZED);
            }

            const id = req.params.id as string;
            if (!id) {
                throw new AppError('Service request ID is required', HttpStatusCode.BAD_REQUEST);
            }

            const dto = RejectServiceRequestDTO.create(req.body);
            const result = await this.serviceRequestService.rejectRequest(adminId, id, dto);

            if (!result.success) {
                throw new AppError(result.message, HttpStatusCode.BAD_REQUEST);
            }

            res.status(HttpStatusCode.OK).json(result);
        } catch (error) {
            next(error);
        }
    };
}
