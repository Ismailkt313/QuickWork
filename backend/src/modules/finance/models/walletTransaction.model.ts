import mongoose, { Schema } from 'mongoose';
import { IWalletTransaction } from '../interfaces/finance.interface';

const WalletTransactionSchema = new Schema<IWalletTransaction>({
    providerId: { type: Schema.Types.ObjectId, ref: 'ServiceProvider', required: true },
    type: { type: String, enum: ['credit', 'debit'], required: true },
    source: { type: String, enum: ['cash_fee', 'online_payment', 'withdrawal'], required: true },
    amount: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }
});

WalletTransactionSchema.index({ providerId: 1 });

export const WalletTransactionModel = mongoose.model<IWalletTransaction>('WalletTransaction', WalletTransactionSchema);
