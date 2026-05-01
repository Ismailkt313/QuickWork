import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { authMiddleware } from '../../../middleware/auth.middleware';

export const createPaymentRouter = (paymentController: PaymentController) => {
    const router = Router();

    router.post('/cash/:workHistoryId', authMiddleware, paymentController.markAsPaidCash);
    router.post('/confirm/:workHistoryId', authMiddleware, paymentController.confirmCashPayment);
    router.post('/reject/:workHistoryId', authMiddleware, paymentController.rejectCashPayment);
    router.get('/history/assignment/:assignmentId', authMiddleware, paymentController.getWorkHistoryByAssignment);
    router.get('/history/provider', authMiddleware, paymentController.getProviderWorkHistory);

    
    router.post('/create-order', authMiddleware, paymentController.createRazorpayOrder);
    router.post('/verify', authMiddleware, paymentController.verifyRazorpayPayment);

    
    router.post('/job/create-order', authMiddleware, paymentController.createJobRazorpayOrder);
    router.post('/job/verify', authMiddleware, paymentController.verifyJobRazorpayPayment);

    return router;
};
