import { Request, Response, NextFunction } from 'express';
import { IProviderDashboardController, IProviderDashboardService } from '../interfaces/providerDashboard.interface';
import { HttpStatusCode } from '../../../constants/httpStatusCode';

import { ITokenPayload } from '../../auth/interfaces/auth.interface';

interface RequestWithUser extends Request {
    user?: ITokenPayload;
}

export class ProviderDashboardController implements IProviderDashboardController {
    private _providerDashboardService: IProviderDashboardService;

    constructor(providerDashboardService: IProviderDashboardService) {
        this._providerDashboardService = providerDashboardService;
    }

    public getOverview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = ((req as RequestWithUser).user as { userId: string }).userId;
            const data = await this._providerDashboardService.getOverview(userId);
            res.status(HttpStatusCode.OK).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    }

    public getActivity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = ((req as RequestWithUser).user as { userId: string }).userId;
            const data = await this._providerDashboardService.getActivity(userId);
            res.status(HttpStatusCode.OK).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    }

    public getCharts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = ((req as RequestWithUser).user as { userId: string }).userId;
            const data = await this._providerDashboardService.getCharts(userId);
            res.status(HttpStatusCode.OK).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    }

    public getPerformance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = ((req as RequestWithUser).user as { userId: string }).userId;
            const data = await this._providerDashboardService.getPerformance(userId);
            res.status(HttpStatusCode.OK).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    }

    public getAvailabilitySummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = ((req as RequestWithUser).user as { userId: string }).userId;
            const data = await this._providerDashboardService.getAvailabilitySummary(userId);
            res.status(HttpStatusCode.OK).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    }
}

