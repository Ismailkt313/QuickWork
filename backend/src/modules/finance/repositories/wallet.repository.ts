import { Types } from 'mongoose';
import { WalletModel } from '../models/wallet.model';
import { WalletTransactionModel } from '../models/walletTransaction.model';
import { IWallet, IWalletTransaction } from '../interfaces/finance.interface';
import { IWalletRepository } from '../interfaces/finance.interface';

export class WalletRepository implements IWalletRepository {
    async findByProviderId(providerId: string): Promise<IWallet | null> {
        return WalletModel.findOne({ providerId: new Types.ObjectId(providerId) });
    }

    async create(providerId: string, balance: number): Promise<IWallet> {
        return WalletModel.create({ providerId: new Types.ObjectId(providerId), balance });
    }

    async updateBalance(walletId: string, change: number): Promise<IWallet | null> {
        return WalletModel.findByIdAndUpdate(
            walletId,
            { $inc: { balance: change } },
            { new: true }
        );
    }

    async createTransaction(
        providerId: string,
        type: 'credit' | 'debit',
        source: 'cash_fee' | 'online_payment' | 'withdrawal',
        amount: number,
        balanceAfter: number
    ): Promise<IWalletTransaction> {
        return WalletTransactionModel.create({
            providerId: new Types.ObjectId(providerId),
            type,
            source,
            amount,
            balanceAfter
        });
    }

    async findAllWithProvider(): Promise<any[]> {
        return WalletModel.find().populate('providerId');
    }

    async getTransactionsWithCount(providerId: string, skip: number, limit: number): Promise<[IWalletTransaction[], number]> {
        return Promise.all([
            WalletTransactionModel.find({ providerId: new Types.ObjectId(providerId) })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            WalletTransactionModel.countDocuments({ providerId: new Types.ObjectId(providerId) })
        ]);
    }

    async getPendingDues(): Promise<number> {
        const result = await WalletModel.aggregate([
            { $match: { balance: { $lt: 0 } } },
            { $group: { _id: null, total: { $sum: { $abs: '$balance' } } } }
        ]);
        return result[0]?.total || 0;
    }
}
