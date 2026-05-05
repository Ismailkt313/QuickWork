import { 
    IWorkHistory, 
    IPaymentService, 
    IWalletService, 
    IRazorpayService, 
    IWorkHistoryRepository, 
    IPlatformTransactionRepository 
} from '../interfaces/finance.interface';
import { config } from '../../../config';

export class PaymentService implements IPaymentService {
    private _walletService: IWalletService;
    private _razorpayService: IRazorpayService;
    private _workHistoryRepo: IWorkHistoryRepository;
    private _platformTransactionRepo: IPlatformTransactionRepository;

    constructor(
        walletService: IWalletService,
        razorpayService: IRazorpayService,
        workHistoryRepo: IWorkHistoryRepository,
        platformTransactionRepo: IPlatformTransactionRepository
    ) {
        this._walletService = walletService;
        this._razorpayService = razorpayService;
        this._workHistoryRepo = workHistoryRepo;
        this._platformTransactionRepo = platformTransactionRepo;
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

    
    async createRazorpayOrder(workHistoryId: string): Promise<any> {
        const history = await this._workHistoryRepo.findById(workHistoryId);
        
        if (!history) throw new Error('Work history not found');
        if (history.finalStatus !== 'COMPLETED') throw new Error('Payment only allowed for completed jobs');
        if (history.payment.status === 'completed') throw new Error('Payment already completed');
        
        
        if (history.payment.method !== 'ONLINE') {
            if (history.payment.status === 'pending') {
                history.payment.method = 'ONLINE';
                await this._workHistoryRepo.save(history);
            } else {
                throw new Error('Invalid payment method for online order in current state');
            }
        }

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
        await this._workHistoryRepo.save(history);

        
        await this._walletService.processOnlinePayment(
            history.providerId.toString(), 
            history.payment.totalAmount,
            history.payment.platformFee
        );

        
        await this._createPlatformTransaction(history, razorpayPaymentId);

        return { success: true, message: 'Payment verified and processed successfully' };
    }

    
    async markAsPaidCash(workHistoryId: string, clientId: string): Promise<{ success: boolean; message: string }> {
        const history = await this._workHistoryRepo.findById(workHistoryId);
        
        if (!history) return { success: false, message: 'Work history not found' };
        if (history.clientId.toString() !== clientId) return { success: false, message: 'Unauthorized' };
        if (history.finalStatus !== 'COMPLETED') return { success: false, message: 'Payment only allowed for completed jobs' };
        if (history.payment.status !== 'pending') return { success: false, message: 'Payment already initiated or completed' };
        if (history.payment.method !== 'CASH') return { success: false, message: 'Invalid payment method' };

        history.payment.status = 'awaiting_confirmation';
        await this._workHistoryRepo.save(history);

        return { success: true, message: 'Payment marked as paid, awaiting provider confirmation' };
    }

    
    async confirmCashPayment(workHistoryId: string, providerId: string): Promise<{ success: boolean; message: string }> {
        const history = await this._workHistoryRepo.findById(workHistoryId);
        
        if (!history) return { success: false, message: 'Work history not found' };
        if (history.providerId.toString() !== providerId) return { success: false, message: 'Unauthorized' };
        if (history.payment.status === 'completed') return { success: false, message: 'Payment already completed' };

        history.payment.status = 'completed';
        history.payment.confirmedAt = new Date();
        await this._workHistoryRepo.save(history);

        
        await this._walletService.processCashPayment(providerId, history.payment.platformFee);

        
        await this._createPlatformTransaction(history);

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

    
    async createJobRazorpayOrder(jobId: string): Promise<any> {
        const eligibleHistories = await this._workHistoryRepo.findEligibleForJobPayment(jobId);

        if (eligibleHistories.length === 0) {
            throw new Error('No payable providers found for this job');
        }

        const totalAmount = eligibleHistories.reduce((sum, h) => sum + h.payment.totalAmount, 0);

        
        for (const history of eligibleHistories) {
            if (history.payment.method !== 'ONLINE' && history.payment.status === 'pending') {
                history.payment.method = 'ONLINE';
                await this._workHistoryRepo.save(history);
            }
        }

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

                
                await this._createPlatformTransaction(history, razorpayPaymentId);

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
