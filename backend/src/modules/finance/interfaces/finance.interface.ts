import { Document, Types } from 'mongoose';

export interface IWorkHistory extends Document {
    jobId: Types.ObjectId;
    clientId: Types.ObjectId;
    providerId: Types.ObjectId;
    assignmentId: Types.ObjectId;
    finalStatus: 'COMPLETED' | 'CANCELLED' | 'ABSENT';
    assignedAt: Date;
    startedAt?: Date;
    endedAt: Date;
    payment: {
        method: 'CASH' | 'ONLINE';
        totalAmount: number;
        platformFee: number;
        providerAmount: number;
        status: 'pending' | 'awaiting_confirmation' | 'completed';
        confirmedAt?: Date;
    };
}

export interface IWallet extends Document {
    providerId: Types.ObjectId;
    balance: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface IWalletTransaction extends Document {
    providerId: Types.ObjectId;
    type: 'credit' | 'debit';
    source: 'cash_fee' | 'online_payment' | 'withdrawal';
    amount: number;
    balanceAfter: number;
    createdAt: Date;
    transactionCode: string;
}

export interface IInvoice extends Document {
    invoiceNumber: string;
    workHistoryId: Types.ObjectId;
    jobId: Types.ObjectId;
    assignmentId: Types.ObjectId;
    client: {
        userId: Types.ObjectId;
        name: string;
        email: string;
    };
    provider: {
        providerId: Types.ObjectId;
        name: string;
        email: string;
    };
    items: {
        description: string;
        quantity: number;
        rate: number;
        amount: number;
    }[];
    subtotal: number;
    platformFee: number;
    platformFeePercent: number;
    total: number;
    providerPayout: number;
    paymentMethod: 'CASH' | 'ONLINE';
    paymentStatus: 'paid';
    paidAt: Date;
    razorpayPaymentId?: string;
    issuedAt: Date;
    dueDate: Date;
    status: 'issued';
    createdAt: Date;
    updatedAt: Date;
}

import { Request, Response, NextFunction } from 'express';

export interface IWalletController {
    getMe(req: Request, res: Response, next: NextFunction): Promise<void>;
    getTransactions(req: Request, res: Response, next: NextFunction): Promise<void>;
    getAdminFinanceOverview(req: Request, res: Response, next: NextFunction): Promise<void>;
    withdraw(req: Request, res: Response, next: NextFunction): Promise<void>;
}

export interface IPaymentController {
    markAsPaidCash(req: Request, res: Response, next: NextFunction): Promise<void>;
    confirmCashPayment(req: Request, res: Response, next: NextFunction): Promise<void>;
    rejectCashPayment(req: Request, res: Response, next: NextFunction): Promise<void>;
    getPlatformOverview(req: Request, res: Response, next: NextFunction): Promise<void>;
    getWorkHistoryByAssignment(req: Request, res: Response, next: NextFunction): Promise<void>;
    getProviderWorkHistory(req: Request, res: Response, next: NextFunction): Promise<void>;
    createRazorpayOrder(req: Request, res: Response, next: NextFunction): Promise<void>;
    verifyRazorpayPayment(req: Request, res: Response, next: NextFunction): Promise<void>;
    createJobRazorpayOrder(req: Request, res: Response, next: NextFunction): Promise<void>;
    verifyJobRazorpayPayment(req: Request, res: Response, next: NextFunction): Promise<void>;
}

export interface IAdminFinanceController {
    getOverview(req: Request, res: Response, next?: NextFunction): Promise<any>;
    getTransactions(req: Request, res: Response, next?: NextFunction): Promise<any>;
}

export interface IInvoiceController {
    getMyInvoices(req: Request, res: Response, next: NextFunction): Promise<void>;
    getInvoiceById(req: Request, res: Response, next: NextFunction): Promise<void>;
    downloadInvoicePdf(req: Request, res: Response, next: NextFunction): Promise<void>;
}

export interface IWalletService {
    getOrCreateWallet(providerId: string): Promise<IWallet>;
    processCashPayment(providerId: string, platformFee: number): Promise<void>;
    processOnlinePayment(providerId: string, totalAmount: number, platformFee: number): Promise<void>;
    getAdminOverview(): Promise<any>;
    isBlocked(providerId: string): Promise<boolean>;
    getTransactions(providerId: string, page?: number, limit?: number, search?: string, type?: string, source?: string): Promise<{ transactions: IWalletTransaction[], total: number }>;
    requestWithdrawal(providerId: string, amount: number): Promise<IWallet>;
}

export interface IRazorpayService {
    createOrder(amount: number, receiptId: string): Promise<any>;
    verifySignature(orderId: string, paymentId: string, signature: string, secret: string): boolean;
}

export interface IWorkHistoryService {
    createFromAssignment(assignment: any): Promise<IWorkHistory>;
    getByProvider(providerId: string): Promise<IWorkHistory[]>;
    getById(id: string): Promise<IWorkHistory | null>;
    getByAssignmentId(assignmentId: string): Promise<IWorkHistory | null>;
}

export interface IPaymentService {
    createRazorpayOrder(workHistoryId: string): Promise<any>;
    verifyRazorpayPayment(workHistoryId: string, razorpayOrderId: string, razorpayPaymentId: string, razorpaySignature: string): Promise<{ success: boolean; message: string }>;
    markAsPaidCash(workHistoryId: string, clientId: string): Promise<{ success: boolean; message: string }>;
    confirmCashPayment(workHistoryId: string, providerId: string): Promise<{ success: boolean; message: string }>;
    rejectCashPayment(workHistoryId: string, providerId: string): Promise<{ success: boolean; message: string }>;
    createJobRazorpayOrder(jobId: string): Promise<any>;
    verifyJobRazorpayPayment(jobId: string, razorpayOrderId: string, razorpayPaymentId: string, razorpaySignature: string): Promise<any>;
    getPlatformEarnings(): Promise<number>;
}

export interface IAdminFinanceService {
    getFinanceOverview(): Promise<any>;
    getTransactions(query: any): Promise<any>;
}

export interface IInvoiceService {
    generateInvoice(workHistoryId: string): Promise<IInvoice>;
    getInvoiceById(id: string): Promise<IInvoice | null>;
    getClientInvoices(clientId: string, page: number, limit: number): Promise<{ invoices: IInvoice[], total: number }>;
    getProviderInvoices(providerId: string, page: number, limit: number): Promise<{ invoices: IInvoice[], total: number }>;
    generateInvoicePdf(id: string): Promise<Buffer>;
}

export interface IWalletRepository {
    findByProviderId(providerId: string): Promise<IWallet | null>;
    create(providerId: string, balance: number): Promise<IWallet>;
    updateBalance(walletId: string, change: number): Promise<IWallet | null>;
    createTransaction(providerId: string, type: 'credit' | 'debit', source: 'cash_fee' | 'online_payment' | 'withdrawal', amount: number, balanceAfter: number): Promise<IWalletTransaction>;
    findAllWithProvider(): Promise<any[]>;
    getTransactionsWithCount(providerId: string, skip: number, limit: number, search?: string, type?: string, source?: string): Promise<[IWalletTransaction[], number]>;
    getPendingDues(): Promise<number>;
}

export interface IPlatformTransactionRepository {
    create(data: any): Promise<any>;
    findWithPagination(query: any, skip: number, limit: number): Promise<[any[], number]>;
    getAdminFinanceOverview(): Promise<any>;
    getTransactionsWithCount(filter: any, skip: number, limit: number): Promise<[any[], number]>;
    countTotalTransactions(): Promise<number>;
    getEarningsStats(): Promise<any>;
    getRecentTransactions(limit: number): Promise<any[]>;
    getMonthlyRevenue(): Promise<any[]>;
    getFinanceSummary(): Promise<any>;
}

export interface IWorkHistoryRepository {
    findById(id: string): Promise<IWorkHistory | null>;
    findByAssignmentId(assignmentId: string): Promise<IWorkHistory | null>;
    findByJobAndStatus(jobId: string, finalStatus: string): Promise<IWorkHistory[]>;
    findEligibleForJobPayment(jobId: string): Promise<IWorkHistory[]>;
    findProviderHistory(providerId: string, status: string | undefined, skip: number, limit: number): Promise<[IWorkHistory[], number]>;
    getPlatformEarnings(): Promise<number>;
    save(workHistory: IWorkHistory): Promise<IWorkHistory>;
    create(data: any): Promise<IWorkHistory>;
    getByProvider(providerId: string): Promise<IWorkHistory[]>;
    findByJob(jobId: string): Promise<IWorkHistory[]>;
}

export interface IInvoiceRepository {
    create(data: Partial<IInvoice>): Promise<IInvoice>;
    findById(id: string): Promise<IInvoice | null>;
    findByInvoiceNumber(number: string): Promise<IInvoice | null>;
    findByClient(clientId: string, skip: number, limit: number): Promise<[IInvoice[], number]>;
    findByProvider(providerId: string, skip: number, limit: number): Promise<[IInvoice[], number]>;
    getNextInvoiceNumber(): Promise<string>;
}

