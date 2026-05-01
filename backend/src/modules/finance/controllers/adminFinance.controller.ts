import { Request, Response } from 'express';
import { IAdminFinanceController, IAdminFinanceService } from '../interfaces/finance.interface';

export class AdminFinanceController implements IAdminFinanceController {
    private adminFinanceService: IAdminFinanceService;

    constructor(adminFinanceService: IAdminFinanceService) {
        this.adminFinanceService = adminFinanceService;
    }

    
    getOverview = async (req: Request, res: Response) => {
        try {
            const overview = await this.adminFinanceService.getFinanceOverview();
            return res.status(200).json({
                success: true,
                data: overview
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: error.message || 'Internal Server Error'
            });
        }
    };

    
    getTransactions = async (req: Request, res: Response) => {
        try {
            const { page, limit, paymentMethod, startDate, endDate } = req.query;
            const data = await this.adminFinanceService.getTransactions({
                page: page ? parseInt(page as string) : 1,
                limit: limit ? parseInt(limit as string) : 10,
                paymentMethod: paymentMethod as string,
                startDate: startDate as string,
                endDate: endDate as string
            });

            return res.status(200).json({
                success: true,
                data: data.transactions,
                pagination: data.pagination
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: error.message || 'Internal Server Error'
            });
        }
    };
}
