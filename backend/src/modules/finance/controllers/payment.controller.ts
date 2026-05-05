import { Request, Response, NextFunction } from 'express';
import { IPaymentController, IPaymentService, IWorkHistoryRepository } from '../interfaces/finance.interface';
import { IServiceProviderRepository } from '../../serviceProvider/interfaces/serviceProvider.interface';
import { HttpStatusCode } from '../../../constants/httpStatusCode';

export class PaymentController implements IPaymentController {
    private _paymentService: IPaymentService;
    private _serviceProviderRepo: IServiceProviderRepository;
    private _workHistoryRepo: IWorkHistoryRepository;

    constructor(
        paymentService: IPaymentService,
        serviceProviderRepo: IServiceProviderRepository,
        workHistoryRepo: IWorkHistoryRepository
    ) {
        this._paymentService = paymentService;
        this._serviceProviderRepo = serviceProviderRepo;
        this._workHistoryRepo = workHistoryRepo;
    }

    markAsPaidCash = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { workHistoryId } = req.params as { workHistoryId: string };
            const clientId = req.user?.userId;
            if (!clientId) throw new Error('Unauthorized');

            const result = await this._paymentService.markAsPaidCash(workHistoryId, clientId);
            res.status(result.success ? HttpStatusCode.OK : HttpStatusCode.BAD_REQUEST).json(result);
        } catch (error) {
            next(error);
        }
    };

    confirmCashPayment = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { workHistoryId } = req.params as { workHistoryId: string };
            const userId = req.user?.userId;
            if (!userId) throw new Error('Unauthorized');

            const provider = await this._serviceProviderRepo.findByUserId(userId);
            if (!provider) throw new Error('Provider not found');

            const result = await this._paymentService.confirmCashPayment(workHistoryId, provider._id.toString());
            res.status(result.success ? HttpStatusCode.OK : HttpStatusCode.BAD_REQUEST).json(result);
        } catch (error) {
            next(error);
        }
    };

    rejectCashPayment = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { workHistoryId } = req.params as { workHistoryId: string };
            const userId = req.user?.userId;
            if (!userId) throw new Error('Unauthorized');

            const provider = await this._serviceProviderRepo.findByUserId(userId);
            if (!provider) throw new Error('Provider not found');

            const result = await this._paymentService.rejectCashPayment(workHistoryId, provider._id.toString());
            res.status(result.success ? HttpStatusCode.OK : HttpStatusCode.BAD_REQUEST).json(result);
        } catch (error) {
            next(error);
        }
    };

    getPlatformOverview = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const earnings = await this._paymentService.getPlatformEarnings();
            res.status(HttpStatusCode.OK).json({ success: true, totalEarnings: earnings });
        } catch (error) {
            next(error);
        }
    };

    getWorkHistoryByAssignment = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { assignmentId } = req.params as { assignmentId: string };
            const history = await this._workHistoryRepo.findByAssignmentId(assignmentId);
            res.status(HttpStatusCode.OK).json({ success: true, data: history });
        } catch (error) {
            next(error);
        }
    };

    getProviderWorkHistory = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.userId;
            if (!userId) throw new Error('Unauthorized');

            const { page = 1, limit = 10, status } = req.query;
            const skip = (Number(page) - 1) * Number(limit);

            const provider = await this._serviceProviderRepo.findByUserId(userId);
            if (!provider) throw new Error('Provider not found');

            const [history, total] = await this._workHistoryRepo.findProviderHistory(
                provider._id.toString(), 
                (Array.isArray(status) ? status[0] : status) as string | undefined, 
                skip, 
                Number(limit)
            );
                
            res.status(HttpStatusCode.OK).json({ 
                success: true, 
                data: history,
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

    createRazorpayOrder = async (req: Request, res: Response, _next: NextFunction) => {
        try {
            const { workHistoryId } = req.body;
            if (!workHistoryId) throw new Error('WorkHistory ID is required');

            const orderDetails = await this._paymentService.createRazorpayOrder(workHistoryId);
            res.status(HttpStatusCode.OK).json({ success: true, data: orderDetails });
        } catch (error: any) {
            res.status(HttpStatusCode.BAD_REQUEST).json({ success: false, message: error.message });
        }
    };

    verifyRazorpayPayment = async (req: Request, res: Response, _next: NextFunction) => {
        try {
            const { 
                workHistoryId, 
                razorpay_order_id, 
                razorpay_payment_id, 
                razorpay_signature 
            } = req.body;

            if (!workHistoryId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
                throw new Error('All Razorpay details and workHistoryId are required');
            }

            const result = await this._paymentService.verifyRazorpayPayment(
                workHistoryId,
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature
            );

            res.status(HttpStatusCode.OK).json(result);
        } catch (error: any) {
            res.status(HttpStatusCode.BAD_REQUEST).json({ success: false, message: error.message });
        }
    };

    createJobRazorpayOrder = async (req: Request, res: Response, _next: NextFunction) => {
        try {
            const { jobId } = req.body;
            if (!jobId) throw new Error('Job ID is required');

            const orderDetails = await this._paymentService.createJobRazorpayOrder(jobId);
            res.status(HttpStatusCode.OK).json({ success: true, data: orderDetails });
        } catch (error: any) {
            res.status(HttpStatusCode.BAD_REQUEST).json({ success: false, message: error.message });
        }
    };

    verifyJobRazorpayPayment = async (req: Request, res: Response, _next: NextFunction) => {
        try {
            const { 
                jobId, 
                razorpay_order_id, 
                razorpay_payment_id, 
                razorpay_signature 
            } = req.body;

            if (!jobId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
                throw new Error('All Razorpay details and jobId are required');
            }

            const result = await this._paymentService.verifyJobRazorpayPayment(
                jobId,
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature
            );

            res.status(HttpStatusCode.OK).json(result);
        } catch (error: any) {
            res.status(HttpStatusCode.BAD_REQUEST).json({ success: false, message: error.message });
        }
    };
}
