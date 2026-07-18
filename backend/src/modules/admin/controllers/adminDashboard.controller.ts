import { Request, Response, NextFunction } from "express";
import { IAdminDashboardController, IAdminDashboardService } from "../interfaces/adminDashboard.interface";
import { HttpStatusCode } from "../../../constants/httpStatusCode";

export class AdminDashboardController implements IAdminDashboardController {
    private readonly _adminDashboardService: IAdminDashboardService;

    constructor(adminDashboardService: IAdminDashboardService) {
        this._adminDashboardService = adminDashboardService;
    }

    public getOverview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const result = await this._adminDashboardService.getOverview();
            res.status(HttpStatusCode.OK).json(result);
        } catch (error) {
            next(error);
        }
    };

    public getRecentActivity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const result = await this._adminDashboardService.getRecentActivity();
            res.status(HttpStatusCode.OK).json(result);
        } catch (error) {
            next(error);
        }
    };

    public getChartData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const result = await this._adminDashboardService.getChartData();
            res.status(HttpStatusCode.OK).json(result);
        } catch (error) {
            next(error);
        }
    };

    public getFinanceSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const result = await this._adminDashboardService.getFinanceSummary();
            res.status(HttpStatusCode.OK).json(result);
        } catch (error) {
            next(error);
        }
    };
}
