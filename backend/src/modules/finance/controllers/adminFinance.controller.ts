import { Request, Response, NextFunction } from 'express';
import { IAdminFinanceController, IAdminFinanceService } from '../interfaces/finance.interface';
import { HttpStatusCode } from '../../../constants/httpStatusCode';

export class AdminFinanceController implements IAdminFinanceController {
    private _adminFinanceService: IAdminFinanceService;

    constructor(adminFinanceService: IAdminFinanceService) {
        this._adminFinanceService = adminFinanceService;
    }

    public getOverview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const overview = await this._adminFinanceService.getFinanceOverview();
            res.status(HttpStatusCode.OK).json({
                success: true,
                data: overview
            });
        } catch (error) {
            next(error);
        }
    };

    public getTransactions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { page, limit, paymentMethod, startDate, endDate, search } = req.query;
            const data = await this._adminFinanceService.getTransactions({
                page: page ? parseInt(page as string) : 1,
                limit: limit ? parseInt(limit as string) : 10,
                paymentMethod: paymentMethod as string,
                startDate: startDate as string,
                endDate: endDate as string,
                search: search as string
            });

            res.status(HttpStatusCode.OK).json({
                success: true,
                data: data.transactions,
                pagination: data.pagination
            });
        } catch (error) {
            next(error);
        }
    };
}


