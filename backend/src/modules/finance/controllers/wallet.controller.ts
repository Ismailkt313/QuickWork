import { Request, Response, NextFunction } from 'express';
import { IWalletController, IWalletService } from '../interfaces/finance.interface';
import { IServiceProviderRepository } from '../../serviceProvider/interfaces/serviceProvider.interface';
import { HttpStatusCode } from '../../../constants/httpStatusCode';

export class WalletController implements IWalletController {
    private walletService: IWalletService;
    private serviceProviderRepo: IServiceProviderRepository;

    constructor(
        walletService: IWalletService,
        serviceProviderRepo: IServiceProviderRepository
    ) {
        this.walletService = walletService;
        this.serviceProviderRepo = serviceProviderRepo;
    }

    getMe = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.userId;
            if (!userId) throw new Error('Unauthorized');

            const provider = await this.serviceProviderRepo.findByUserId(userId);
            if (!provider) throw new Error('Provider not found');

            const wallet = await this.walletService.getOrCreateWallet(provider._id.toString());
            res.status(HttpStatusCode.OK).json({ success: true, data: wallet });
        } catch (error) {
            next(error);
        }
    };

    getTransactions = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.userId;
            if (!userId) throw new Error('Unauthorized');

            const { page = 1, limit = 10 } = req.query;

            const provider = await this.serviceProviderRepo.findByUserId(userId);
            if (!provider) throw new Error('Provider not found');

            const { transactions, total } = await this.walletService.getTransactions(
                provider._id.toString(),
                Number(page),
                Number(limit)
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
            const overview = await this.walletService.getAdminOverview();
            res.status(HttpStatusCode.OK).json({ success: true, data: overview });
        } catch (error) {
            next(error);
        }
    };
}
