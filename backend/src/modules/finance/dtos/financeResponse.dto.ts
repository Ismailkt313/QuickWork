import { IWallet, IWalletTransaction, IInvoice, IWorkHistory } from '../interfaces/finance.interface';

export interface WalletResponseDTO {
    id: string;
    providerId: string;
    balance: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface WalletTransactionResponseDTO {
    id: string;
    providerId: string;
    type: string;
    source: string;
    amount: number;
    balanceAfter: number;
    transactionCode: string;
    createdAt: Date;
}

export const mapWalletToResponseDTO = (wallet: IWallet | Record<string, unknown>): WalletResponseDTO => {
    const w = wallet as unknown as Record<string, unknown>;
    return {
        id: w._id ? (w._id as { toString(): string }).toString() : ((w.id as string) || ""),
        providerId: w.providerId ? (w.providerId as { toString(): string }).toString() : "",
        balance: (w.balance as number) || 0,
        createdAt: (w.createdAt as Date) || new Date(),
        updatedAt: (w.updatedAt as Date) || new Date(),
    };
};

export const mapWalletTransactionToResponseDTO = (transaction: IWalletTransaction | Record<string, unknown>): WalletTransactionResponseDTO => {
    const t = transaction as unknown as Record<string, unknown>;
    return {
        id: t._id ? (t._id as { toString(): string }).toString() : ((t.id as string) || ""),
        providerId: t.providerId ? (t.providerId as { toString(): string }).toString() : "",
        type: (t.type as string) || "",
        source: (t.source as string) || "",
        amount: (t.amount as number) || 0,
        balanceAfter: (t.balanceAfter as number) || 0,
        transactionCode: (t.transactionCode as string) || "",
        createdAt: (t.createdAt as Date) || new Date(),
    };
};

export interface InvoiceResponseDTO {
    id: string;
    invoiceNumber: string;
    workHistoryId: string;
    jobId: string;
    assignmentId: string;
    client: {
        userId: string;
        name: string;
        email: string;
    };
    provider: {
        providerId: string;
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
    paymentMethod: string;
    paymentStatus: string;
    paidAt: Date;
    razorpayPaymentId?: string;
    issuedAt: Date;
    dueDate: Date;
    status: string;
    createdAt: Date;
}

export const mapInvoiceToResponseDTO = (invoice: IInvoice | Record<string, unknown>): InvoiceResponseDTO => {
    const i = invoice as unknown as Record<string, unknown>;
    const client = (i.client || {}) as Record<string, unknown>;
    const provider = (i.provider || {}) as Record<string, unknown>;

    return {
        id: i._id ? (i._id as { toString(): string }).toString() : ((i.id as string) || ""),
        invoiceNumber: (i.invoiceNumber as string) || "",
        workHistoryId: i.workHistoryId ? (i.workHistoryId as { toString(): string }).toString() : "",
        jobId: i.jobId ? (i.jobId as { toString(): string }).toString() : "",
        assignmentId: i.assignmentId ? (i.assignmentId as { toString(): string }).toString() : "",
        client: {
            userId: client.userId ? (client.userId as { toString(): string }).toString() : "",
            name: (client.name as string) || "",
            email: (client.email as string) || "",
        },
        provider: {
            providerId: provider.providerId ? (provider.providerId as { toString(): string }).toString() : "",
            name: (provider.name as string) || "",
            email: (provider.email as string) || "",
        },
        items: (i.items as any[]) || [],
        subtotal: (i.subtotal as number) || 0,
        platformFee: (i.platformFee as number) || 0,
        platformFeePercent: (i.platformFeePercent as number) || 0,
        total: (i.total as number) || 0,
        providerPayout: (i.providerPayout as number) || 0,
        paymentMethod: (i.paymentMethod as string) || "",
        paymentStatus: (i.paymentStatus as string) || "",
        paidAt: (i.paidAt as Date) || new Date(),
        razorpayPaymentId: (i.razorpayPaymentId as string) || undefined,
        issuedAt: (i.issuedAt as Date) || new Date(),
        dueDate: (i.dueDate as Date) || new Date(),
        status: (i.status as string) || "",
        createdAt: (i.createdAt as Date) || new Date(),
    };
};

export interface WorkHistoryResponseDTO {
    id: string;
    jobId: string;
    clientId: string;
    providerId: string;
    assignmentId: string;
    finalStatus: string;
    assignedAt: Date;
    startedAt?: Date;
    endedAt: Date;
    payment: {
        method: string;
        totalAmount: number;
        platformFee: number;
        providerAmount: number;
        status: string;
        confirmedAt?: Date;
    };
}

export const mapWorkHistoryToResponseDTO = (workHistory: IWorkHistory | Record<string, unknown>): WorkHistoryResponseDTO => {
    const wh = workHistory as unknown as Record<string, unknown>;
    const payment = (wh.payment || {}) as Record<string, unknown>;

    return {
        id: wh._id ? (wh._id as { toString(): string }).toString() : ((wh.id as string) || ""),
        jobId: wh.jobId ? (wh.jobId as { toString(): string }).toString() : "",
        clientId: wh.clientId ? (wh.clientId as { toString(): string }).toString() : "",
        providerId: wh.providerId ? (wh.providerId as { toString(): string }).toString() : "",
        assignmentId: wh.assignmentId ? (wh.assignmentId as { toString(): string }).toString() : "",
        finalStatus: (wh.finalStatus as string) || "",
        assignedAt: (wh.assignedAt as Date) || new Date(),
        startedAt: (wh.startedAt as Date) || undefined,
        endedAt: (wh.endedAt as Date) || new Date(),
        payment: {
            method: (payment.method as string) || "",
            totalAmount: (payment.totalAmount as number) || 0,
            platformFee: (payment.platformFee as number) || 0,
            providerAmount: (payment.providerAmount as number) || 0,
            status: (payment.status as string) || "",
            confirmedAt: (payment.confirmedAt as Date) || undefined,
        }
    };
};
