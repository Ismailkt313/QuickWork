import { Request, Response, NextFunction } from 'express';
import { IPaymentController, IPaymentService, IWorkHistoryService } from '../interfaces/finance.interface';
import { IServiceProviderService } from '../../serviceProvider/interfaces/serviceProvider.interface';
import { serviceProviderService } from '../../serviceProvider';
import { HttpStatusCode } from '../../../constants/httpStatusCode';
import { AppError } from '../../../utils/AppError';
import { ErrorMessages } from '../../../constants/messages/errorMessages';
import { mapWorkHistoryToResponseDTO } from '../dtos/financeResponse.dto';

export class PaymentController implements IPaymentController {
    private _paymentService: IPaymentService;
    private _serviceProviderService: IServiceProviderService;
    private _workHistoryService: IWorkHistoryService;

    constructor(
        paymentService: IPaymentService,
        serviceProviderService: IServiceProviderService,
        workHistoryService: IWorkHistoryService
    ) {
        this._paymentService = paymentService;
        this._serviceProviderService = serviceProviderService;
        this._workHistoryService = workHistoryService;
    }

    private get serviceProviderService(): IServiceProviderService {
        return this._serviceProviderService || serviceProviderService;
    }

    public markAsPaidCash = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { workHistoryId } = req.params as { workHistoryId: string };
            const clientId = req.user?.userId;
            if (!clientId) throw new AppError(ErrorMessages.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);

            const result = await this._paymentService.markAsPaidCash(workHistoryId, clientId);
            res.status(result.success ? HttpStatusCode.OK : HttpStatusCode.BAD_REQUEST).json(result);
        } catch (error) {
            next(error);
        }
    };

    public confirmCashPayment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { workHistoryId } = req.params as { workHistoryId: string };
            const userId = req.user?.userId;
            if (!userId) throw new AppError(ErrorMessages.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);

            const provider = await this.serviceProviderService.getProviderByUserId(userId);
            if (!provider) throw new AppError(ErrorMessages.PROVIDER_NOT_FOUND, HttpStatusCode.NOT_FOUND);

            const result = await this._paymentService.confirmCashPayment(workHistoryId, provider._id.toString());
            res.status(result.success ? HttpStatusCode.OK : HttpStatusCode.BAD_REQUEST).json(result);
        } catch (error) {
            next(error);
        }
    };

    public rejectCashPayment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { workHistoryId } = req.params as { workHistoryId: string };
            const userId = req.user?.userId;
            if (!userId) throw new AppError(ErrorMessages.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);

            const provider = await this.serviceProviderService.getProviderByUserId(userId);
            if (!provider) throw new AppError(ErrorMessages.PROVIDER_NOT_FOUND, HttpStatusCode.NOT_FOUND);

            const result = await this._paymentService.rejectCashPayment(workHistoryId, provider._id.toString());
            res.status(result.success ? HttpStatusCode.OK : HttpStatusCode.BAD_REQUEST).json(result);
        } catch (error) {
            next(error);
        }
    };

    public getPlatformOverview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const earnings = await this._paymentService.getPlatformEarnings();
            res.status(HttpStatusCode.OK).json({ success: true, totalEarnings: earnings });
        } catch (error) {
            next(error);
        }
    };

    public getWorkHistoryByAssignment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { assignmentId } = req.params as { assignmentId: string };
            const history = await this._workHistoryService.getByAssignmentId(assignmentId);
            res.status(HttpStatusCode.OK).json({ success: true, data: history ? mapWorkHistoryToResponseDTO(history) : null });
        } catch (error) {
            next(error);
        }
    };

    public getProviderWorkHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.userId;
            if (!userId) throw new AppError(ErrorMessages.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);

            const { page = 1, limit = 10, status } = req.query;

            const provider = await this.serviceProviderService.getProviderByUserId(userId);
            if (!provider) throw new AppError(ErrorMessages.PROVIDER_NOT_FOUND, HttpStatusCode.NOT_FOUND);

            const { history, total } = await this._workHistoryService.getProviderHistory(
                provider._id.toString(),
                (Array.isArray(status) ? status[0] : status) as string | undefined,
                Number(page),
                Number(limit)
            );

            res.status(HttpStatusCode.OK).json({
                success: true,
                data: history.map(mapWorkHistoryToResponseDTO),
                pagination: {
                    total,
                    page: Number(page),
                    limit: Number(limit),
                    pages: Math.ceil(total / Number(limit))
                }
            });
        } catch (error) {
            next(error);
        }
    };

    public createRazorpayOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { workHistoryId } = req.body;
            if (!workHistoryId) throw new AppError(ErrorMessages.WORK_HISTORY_ID_REQUIRED, HttpStatusCode.BAD_REQUEST);

            const orderDetails = await this._paymentService.createRazorpayOrder(workHistoryId);
            res.status(HttpStatusCode.OK).json({ success: true, data: orderDetails });
        } catch (error) {
            next(error);
        }
    };

    public verifyRazorpayPayment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const {
                workHistoryId,
                razorpay_order_id: razorpayOrderId,
                razorpay_payment_id: razorpayPaymentId,
                razorpay_signature: razorpaySignature
            } = req.body;

            if (!workHistoryId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
                throw new AppError(ErrorMessages.RAZORPAY_DETAILS_REQUIRED, HttpStatusCode.BAD_REQUEST);
            }

            const result = await this._paymentService.verifyRazorpayPayment(
                workHistoryId,
                razorpayOrderId,
                razorpayPaymentId,
                razorpaySignature
            );

            res.status(HttpStatusCode.OK).json(result);
        } catch (error) {
            next(error);
        }
    };

    public createJobRazorpayOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { jobId } = req.body;
            if (!jobId) throw new AppError(ErrorMessages.JOB_ID_REQUIRED, HttpStatusCode.BAD_REQUEST);

            const orderDetails = await this._paymentService.createJobRazorpayOrder(jobId);
            res.status(HttpStatusCode.OK).json({ success: true, data: orderDetails });
        } catch (error) {
            next(error);
        }
    };

    public verifyJobRazorpayPayment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const {
                jobId,
                razorpay_order_id: razorpayOrderId,
                razorpay_payment_id: razorpayPaymentId,
                razorpay_signature: razorpaySignature
            } = req.body;

            if (!jobId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
                throw new AppError(ErrorMessages.RAZORPAY_DETAILS_REQUIRED, HttpStatusCode.BAD_REQUEST);
            }

            const result = await this._paymentService.verifyJobRazorpayPayment(
                jobId,
                razorpayOrderId,
                razorpayPaymentId,
                razorpaySignature
            );

            res.status(HttpStatusCode.OK).json(result);
        } catch (error) {
            next(error);
        }
    };
}


