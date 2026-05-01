import mongoose, { Schema } from 'mongoose';
import { IWallet } from '../interfaces/finance.interface';

const WalletSchema = new Schema<IWallet>({
    providerId: { type: Schema.Types.ObjectId, ref: 'ServiceProvider', required: true, unique: true },
    balance: { type: Number, default: 0 }
}, { timestamps: true });

WalletSchema.index({ providerId: 1 });

export const WalletModel = mongoose.model<IWallet>('Wallet', WalletSchema);
