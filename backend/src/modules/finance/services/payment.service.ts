import {
    IWorkHistory,
    IPaymentService,
    IWalletService,
    IRazorpayService,
    IWorkHistoryRepository,
    IPlatformTransactionRepository,
    IInvoiceService
} from '../interfaces/finance.interface';
import { AssignmentModel } from '../../assignment/models/assignment.model';
import { config } from '../../../config';

export class PaymentService implements IPaymentService {
    private _walletService: IWalletService;
    private _razorpayService: IRazorpayService;
    private _workHistoryRepo: IWorkHistoryRepository;
    private _platformTransactionRepo: IPlatformTransactionRepository;
    private _invoiceService: IInvoiceService;

    constructor(
        walletService: IWalletService,
        razorpayService: IRazorpayService,
        workHistoryRepo: IWorkHistoryRepository,
        platformTransactionRepo: IPlatformTransactionRepository,
        invoiceService: IInvoiceService
    ) {
        this._walletService = walletService;
        this._razorpayService = razorpayService;
        this._workHistoryRepo = workHistoryRepo;
        this._platformTransactionRepo = platformTransactionRepo;
        this._invoiceService = invoiceService;
    }

    private async _createPlatformTransaction(history: IWorkHistory, razorpayPaymentId?: string) {
        await this._platformTransactionRepo.create({
            jobId: history.jobId,
            workHistoryId: history._id,
            providerId: history.providerId,
            type: 'payment',
            paymentMethod: history.payment.method,
            totalAmount: history.payment.totalAmount,
            platformFee: history.payment.platformFee,
            providerAmount: history.payment.totalAmount - history.payment.platformFee,
            razorpay_payment_id: razorpayPaymentId,
            status: 'completed'
        });
    }

    async createRazorpayOrder(workHistoryId: string): Promise<Record<string, unknown>> {
        const history = await this._workHistoryRepo.findById(workHistoryId);

        if (!history) throw new Error('Work history not found');
        if (history.finalStatus !== 'COMPLETED') throw new Error('Payment only allowed for completed jobs');
        if (history.payment.status === 'completed') throw new Error('Payment already completed');

        const order = await this._razorpayService.createOrder(history.payment.totalAmount, workHistoryId);

        return {
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: config.RAZORPAY_KEY_ID
        };
    }

    async verifyRazorpayPayment(
        workHistoryId: string,
        razorpayOrderId: string,
        razorpayPaymentId: string,
        razorpaySignature: string
    ): Promise<{ success: boolean; message: string }> {

        const isValid = this._razorpayService.verifySignature(
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature,
            config.RAZORPAY_KEY_SECRET
        );

        if (!isValid) {
            throw new Error('Invalid payment signature');
        }

        const history = await this._workHistoryRepo.findById(workHistoryId);
        if (!history) throw new Error('Work history not found');
        if (history.payment.status === 'completed') throw new Error('Payment already processed');

        history.payment.status = 'completed';
        history.payment.confirmedAt = new Date();
        history.payment.method = 'ONLINE';
        await this._workHistoryRepo.save(history);

        await this._walletService.processOnlinePayment(
            history.providerId.toString(),
            history.payment.totalAmount,
            history.payment.platformFee
        );

        if (history.assignmentId) {
            await AssignmentModel.findByIdAndUpdate(history.assignmentId, {
                'payment.status': 'completed',
                'payment.method': 'ONLINE',
                'payment.paidAt': new Date(),
                'payment.transactionId': razorpayPaymentId
            });
        }

        await this._createPlatformTransaction(history, razorpayPaymentId);

        try {
            await this._invoiceService.generateInvoice(history._id.toString());
        } catch (error) {
            console.error('Failed to generate invoice:', error);

        }

        return { success: true, message: 'Payment verified and processed successfully' };
    }

    async markAsPaidCash(workHistoryId: string, clientId: string): Promise<{ success: boolean; message: string }> {
        const history = await this._workHistoryRepo.findById(workHistoryId);

        if (!history) return { success: false, message: 'Work history not found' };
        if (history.clientId.toString() !== clientId) return { success: false, message: 'Unauthorized' };
        if (history.finalStatus !== 'COMPLETED') return { success: false, message: 'Payment only allowed for completed jobs' };
        if (history.payment.status !== 'pending') return { success: false, message: 'Payment already initiated or completed' };

        history.payment.status = 'awaiting_confirmation';
        history.payment.method = 'CASH';
        await this._workHistoryRepo.save(history);

        return { success: true, message: 'Payment marked as paid, awaiting provider confirmation' };
    }

    async confirmCashPayment(workHistoryId: string, providerId: string): Promise<{ success: boolean; message: string }> {
        const history = await this._workHistoryRepo.findById(workHistoryId);

        if (!history) return { success: false, message: 'Work history not found' };
        if (history.providerId.toString() !== providerId) return { success: false, message: 'Unauthorized' };
        if (history.payment.status === 'completed') return { success: false, message: 'Payment already completed' };
        if (history.payment.status !== 'awaiting_confirmation' && history.payment.status !== 'pending') {
            return { success: false, message: 'No payment awaiting confirmation or pending' };
        }

        history.payment.status = 'completed';
        history.payment.confirmedAt = new Date();
        history.payment.method = 'CASH';
        await this._workHistoryRepo.save(history);

        await this._walletService.processCashPayment(providerId, history.payment.platformFee);

        if (history.assignmentId) {
            await AssignmentModel.findByIdAndUpdate(history.assignmentId, {
                'payment.status': 'completed',
                'payment.method': 'CASH',
                'payment.paidAt': new Date()
            });
        }

        await this._createPlatformTransaction(history);

        try {
            await this._invoiceService.generateInvoice(history._id.toString());
        } catch (error) {
            console.error('Failed to generate invoice:', error);
        }

        return { success: true, message: 'Payment confirmed and wallet updated' };
    }

    async rejectCashPayment(workHistoryId: string, providerId: string): Promise<{ success: boolean; message: string }> {
        const history = await this._workHistoryRepo.findById(workHistoryId);

        if (!history) return { success: false, message: 'Work history not found' };
        if (history.providerId.toString() !== providerId) return { success: false, message: 'Unauthorized' };
        if (history.payment.status === 'completed') return { success: false, message: 'Cannot reject a completed payment' };
        if (history.payment.status !== 'awaiting_confirmation') return { success: false, message: 'No payment confirmation to reject' };

        history.payment.status = 'pending';
        await this._workHistoryRepo.save(history);

        return { success: true, message: 'Payment rejected and status reverted to pending' };
    }

    async createJobRazorpayOrder(jobId: string): Promise<Record<string, unknown>> {
        const eligibleHistories = await this._workHistoryRepo.findEligibleForJobPayment(jobId);

        if (eligibleHistories.length === 0) {
            throw new Error('No payable providers found for this job');
        }

        const totalAmount = eligibleHistories.reduce((sum, h) => sum + h.payment.totalAmount, 0);

        const order = await this._razorpayService.createOrder(totalAmount, jobId);

        return {
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: config.RAZORPAY_KEY_ID,
            providerCount: eligibleHistories.length
        };
    }

    async verifyJobRazorpayPayment(
        jobId: string,
        razorpayOrderId: string,
        razorpayPaymentId: string,
        razorpaySignature: string
    ): Promise<{
        success: boolean;
        paidProviders: number;
        skippedProviders: number;
        totalProcessedAmount: number
    }> {

        const isValid = this._razorpayService.verifySignature(
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature,
            config.RAZORPAY_KEY_SECRET
        );

        if (!isValid) {
            throw new Error('Invalid payment signature');
        }

        const eligibleHistories = await this._workHistoryRepo.findEligibleForJobPayment(jobId);

        let paidProviders = 0;
        let skippedProviders = 0;
        let totalProcessedAmount = 0;

        for (const history of eligibleHistories) {
            try {

                if (history.payment.status === 'completed') {
                    skippedProviders++;
                    continue;
                }

                history.payment.status = 'completed';
                history.payment.confirmedAt = new Date();
                history.payment.method = 'ONLINE';
                await this._workHistoryRepo.save(history);

                await this._walletService.processOnlinePayment(
                    history.providerId.toString(),
                    history.payment.totalAmount,
                    history.payment.platformFee
                );

                if (history.assignmentId) {
                    await AssignmentModel.findByIdAndUpdate(history.assignmentId, {
                        'payment.status': 'completed',
                        'payment.method': 'ONLINE',
                        'payment.paidAt': new Date(),
                        'payment.transactionId': razorpayPaymentId
                    });
                }

                await this._createPlatformTransaction(history, razorpayPaymentId);

                try {
                    await this._invoiceService.generateInvoice(history._id.toString());
                } catch (error) {
                    console.error('Failed to generate invoice for history ' + history._id, error);
                }

                paidProviders++;
                totalProcessedAmount += history.payment.totalAmount;
            } catch (error) {
                console.error(`Failed to process payment for history ${history._id}:`, error);

            }
        }

        return {
            success: true,
            paidProviders,
            skippedProviders,
            totalProcessedAmount
        };
    }

    async getPlatformEarnings(): Promise<number> {
        return this._workHistoryRepo.getPlatformEarnings();
    }
}
