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

    async getTransactionsWithCount(providerId: string, skip: number, limit: number, search?: string, type?: string, source?: string): Promise<[IWalletTransaction[], number]> {
        const baseMatch: any = { providerId: new Types.ObjectId(providerId) };

        if (type) baseMatch.type = type;
        if (source) baseMatch.source = source;

        const pipeline: any[] = [{ $match: baseMatch }];

        if (search) {
            const trimmed = search.trim();
            const searchRegex = new RegExp(trimmed, 'i');

            pipeline.push(
                {
                    $addFields: {
                        idString: { $toString: '$_id' }
                    }
                },
                {
                    $match: {
                        $or: [
                            { idString: { $regex: trimmed, $options: 'i' } },
                            { transactionCode: { $regex: searchRegex } },
                            { source: searchRegex },
                            { type: searchRegex }
                        ]
                    }
                }
            );
        }

        const countPipeline = [...pipeline, { $count: 'total' }];
        const dataPipeline = [
            ...pipeline,
            { $sort: { createdAt: -1 as const } },
            { $skip: skip },
            { $limit: limit }
        ];

        const [data, countResult] = await Promise.all([
            WalletTransactionModel.aggregate(dataPipeline),
            WalletTransactionModel.aggregate(countPipeline)
        ]);

        return [data as IWalletTransaction[], countResult[0]?.total || 0];
    }

    async getPendingDues(): Promise<number> {
        const result = await WalletModel.aggregate([
            { $match: { balance: { $lt: 0 } } },
            { $group: { _id: null, total: { $sum: { $abs: '$balance' } } } }
        ]);
        return result[0]?.total || 0;
    }
}
