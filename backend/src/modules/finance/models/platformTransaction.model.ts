import mongoose, { Schema, Document } from 'mongoose';

export interface IPlatformTransaction extends Document {
    jobId: mongoose.Types.ObjectId;
    workHistoryId: mongoose.Types.ObjectId;
    providerId: mongoose.Types.ObjectId;
    type: 'platform_fee' | 'payment' | 'adjustment';
    paymentMethod: 'CASH' | 'ONLINE';
    totalAmount: number;
    platformFee: number;
    providerAmount: number;
    razorpay_payment_id?: string;
    status: 'completed';
    createdAt: Date;
}

const PlatformTransactionSchema: Schema = new Schema({
    jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
    workHistoryId: { type: Schema.Types.ObjectId, ref: 'WorkHistory', required: true },
    providerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
        type: String,
        enum: ['platform_fee', 'payment', 'adjustment'],
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ['CASH', 'ONLINE'],
        required: true
    },
    totalAmount: { type: Number, required: true },
    platformFee: { type: Number, required: true },
    providerAmount: { type: Number, required: true },
    razorpay_payment_id: { type: String },
    status: { type: String, enum: ['completed'], default: 'completed', required: true },
    createdAt: { type: Date, default: Date.now }
});

PlatformTransactionSchema.index({ jobId: 1 });
PlatformTransactionSchema.index({ providerId: 1 });
PlatformTransactionSchema.index({ paymentMethod: 1 });
PlatformTransactionSchema.index({ createdAt: -1 });

export const PlatformTransactionModel = mongoose.model<IPlatformTransaction>('PlatformTransaction', PlatformTransactionSchema);
