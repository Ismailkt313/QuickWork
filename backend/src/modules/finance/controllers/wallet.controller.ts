import { Request, Response, NextFunction } from 'express';
import { IWalletController, IWalletService } from '../interfaces/finance.interface';
import { IServiceProviderRepository } from '../../serviceProvider/interfaces/serviceProvider.interface';
import { HttpStatusCode } from '../../../constants/httpStatusCode';
import { AppError } from '../../../utils/AppError';

export class WalletController implements IWalletController {
    private _walletService: IWalletService;
    private _serviceProviderRepo: IServiceProviderRepository;

    constructor(
        walletService: IWalletService,
        serviceProviderRepo: IServiceProviderRepository
    ) {
        this._walletService = walletService;
        this._serviceProviderRepo = serviceProviderRepo;
    }

    getMe = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.userId;
            if (!userId) throw new Error('Unauthorized');

            const provider = await this._serviceProviderRepo.findByUserId(userId);
            if (!provider) throw new Error('Provider not found');

            const wallet = await this._walletService.getOrCreateWallet(provider._id.toString());
            res.status(HttpStatusCode.OK).json({ success: true, data: wallet });
        } catch (error) {
            next(error);
        }
    };

    getTransactions = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.userId;
            if (!userId) throw new Error('Unauthorized');

            const { page = 1, limit = 10, search, type, source } = req.query;

            const provider = await this._serviceProviderRepo.findByUserId(userId);
            if (!provider) throw new Error('Provider not found');

            const { transactions, total } = await this._walletService.getTransactions(
                provider._id.toString(),
                Number(page),
                Number(limit),
                (search as string) || undefined,
                (type as string) || undefined,
                (source as string) || undefined
            );

            res.status(HttpStatusCode.OK).json({
                success: true,
                data: transactions,
                pagination: {
                    total,
                    page: Number(page),
                    limit: Number(limit),
                    pages: Math.ceil(total / Number(limit))
                }
            });
        } catch (error) {
            next(error);
        }
    };

    getAdminFinanceOverview = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const overview = await this._walletService.getAdminOverview();
            res.status(HttpStatusCode.OK).json({ success: true, data: overview });
        } catch (error) {
            next(error);
        }
    };

    withdraw = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.userId;
            if (!userId) throw new AppError('Unauthorized', HttpStatusCode.UNAUTH0RIZED);

            const { amount } = req.body;
            if (!amount || isNaN(Number(amount))) {
                throw new AppError('Valid amount is required', HttpStatusCode.BAD_REQUEST);
            }

            const provider = await this._serviceProviderRepo.findByUserId(userId);
            if (!provider) throw new AppError('Provider not found', HttpStatusCode.NOT_FOUND);

            try {
                const wallet = await this._walletService.requestWithdrawal(provider._id.toString(), Number(amount));

                res.status(HttpStatusCode.OK).json({
                    success: true,
                    message: 'Withdrawal successful',
                    data: wallet
                });
            } catch (error: any) {
                throw new AppError(error.message, HttpStatusCode.BAD_REQUEST);
            }
        } catch (error) {
            next(error);
        }
    };
}
