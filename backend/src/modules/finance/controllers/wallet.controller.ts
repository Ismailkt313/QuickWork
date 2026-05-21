import { Request, Response, NextFunction } from 'express';
import { IWalletController, IWalletService } from '../interfaces/finance.interface';
import { IServiceProviderService } from '../../serviceProvider/interfaces/serviceProvider.interface';
import { HttpStatusCode } from '../../../constants/httpStatusCode';
import { AppError } from '../../../utils/AppError';
import { ErrorMessages } from '../../../constants/messages/errorMessages';
import { SuccessMessages } from '../../../constants/messages/successMessages';
import { mapWalletToResponseDTO, mapWalletTransactionToResponseDTO } from '../dtos/financeResponse.dto';

export class WalletController implements IWalletController {
    private _walletService: IWalletService;
    private _serviceProviderService: IServiceProviderService;

    constructor(
        walletService: IWalletService,
        serviceProviderService: IServiceProviderService
    ) {
        this._walletService = walletService;
        this._serviceProviderService = serviceProviderService;
    }

    public getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.userId;
            if (!userId) throw new AppError(ErrorMessages.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);

            const role = req.user?.role;
            if (role !== 'provider') {
                res.status(HttpStatusCode.OK).json({ success: true, data: null });
                return;
            }

            const provider = await this._serviceProviderService.getProviderByUserId(userId);
            if (!provider) throw new AppError(ErrorMessages.PROVIDER_NOT_FOUND, HttpStatusCode.NOT_FOUND);

            const wallet = await this._walletService.getOrCreateWallet(provider._id.toString());
            res.status(HttpStatusCode.OK).json({ success: true, data: wallet ? mapWalletToResponseDTO(wallet) : null });
        } catch (error) {
            next(error);
        }
    };

    public getTransactions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.userId;
            if (!userId) throw new AppError(ErrorMessages.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);

            const { page = 1, limit = 10, search, type, source } = req.query;

            const role = req.user?.role;
            if (role !== 'provider') {
                res.status(HttpStatusCode.OK).json({
                    success: true,
                    data: [],
                    pagination: {
                        total: 0,
                        page: Number(page),
                        limit: Number(limit),
                        pages: 0
                    }
                });
                return;
            }

            const provider = await this._serviceProviderService.getProviderByUserId(userId);
            if (!provider) throw new AppError(ErrorMessages.PROVIDER_NOT_FOUND, HttpStatusCode.NOT_FOUND);

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
                data: transactions.map(mapWalletTransactionToResponseDTO),
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

    public getAdminFinanceOverview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const overview = await this._walletService.getAdminOverview();
            res.status(HttpStatusCode.OK).json({ success: true, data: overview });
        } catch (error) {
            next(error);
        }
    };

    public withdraw = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.userId;
            if (!userId) throw new AppError(ErrorMessages.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);

            const { amount } = req.body;
            if (!amount || isNaN(Number(amount))) {
                throw new AppError(ErrorMessages.VALID_AMOUNT_REQUIRED, HttpStatusCode.BAD_REQUEST);
            }

            const provider = await this._serviceProviderService.getProviderByUserId(userId);
            if (!provider) throw new AppError(ErrorMessages.PROVIDER_NOT_FOUND, HttpStatusCode.NOT_FOUND);

            try {
                const wallet = await this._walletService.requestWithdrawal(provider._id.toString(), Number(amount));

                res.status(HttpStatusCode.OK).json({
                    success: true,
                    message: SuccessMessages.WITHDRAWAL_SUCCESSFUL,
                    data: wallet ? mapWalletToResponseDTO(wallet) : null
                });
            } catch (error: unknown) {
                throw new AppError((error as Error).message, HttpStatusCode.BAD_REQUEST);
            }
        } catch (error) {
            next(error);
        }
    };
}


