import mongoose, { Schema } from 'mongoose';
import { IInvoice } from '../interfaces/finance.interface';

const InvoiceSchema = new Schema<IInvoice>({
    invoiceNumber: { type: String, required: true, unique: true },
    workHistoryId: { type: Schema.Types.ObjectId, ref: 'WorkHistory', required: true },
    jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
    assignmentId: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true },
    client: {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        name: { type: String, required: true },
        email: { type: String, required: true }
    },
    provider: {
        providerId: { type: Schema.Types.ObjectId, ref: 'ServiceProvider', required: true },
        name: { type: String, required: true },
        email: { type: String, required: true }
    },
    items: [{
        description: { type: String, required: true },
        quantity: { type: Number, required: true },
        rate: { type: Number, required: true },
        amount: { type: Number, required: true }
    }],
    subtotal: { type: Number, required: true },
    platformFee: { type: Number, required: true },
    platformFeePercent: { type: Number, required: true },
    total: { type: Number, required: true },
    providerPayout: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['CASH', 'ONLINE'], required: true },
    paymentStatus: { type: String, enum: ['paid'], default: 'paid', required: true },
    paidAt: { type: Date, required: true },
    razorpayPaymentId: { type: String },
    issuedAt: { type: Date, default: Date.now, required: true },
    dueDate: { type: Date, default: Date.now, required: true },
    status: { type: String, enum: ['issued'], default: 'issued', required: true }
}, { timestamps: true });

InvoiceSchema.index({ 'client.userId': 1 });
InvoiceSchema.index({ 'provider.providerId': 1 });
InvoiceSchema.index({ workHistoryId: 1 });

export const InvoiceModel = mongoose.model<IInvoice>('Invoice', InvoiceSchema);
