import { Request, Response, NextFunction } from 'express';
import { IProviderDashboardController, IProviderDashboardService } from '../interfaces/providerDashboard.interface';
import { HttpStatusCode } from '../../../constants/httpStatusCode';

import { ITokenPayload } from '../../auth/interfaces/auth.interface';

interface RequestWithUser extends Request {
    user?: ITokenPayload;
}

export class ProviderDashboardController implements IProviderDashboardController {
    private _service: IProviderDashboardService;

    constructor(service: IProviderDashboardService) {
        this._service = service;
    }

    getOverview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = ((req as RequestWithUser).user as { userId: string }).userId;
            const data = await this._service.getOverview(userId);
            res.status(HttpStatusCode.OK).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    }

    getActivity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = ((req as RequestWithUser).user as { userId: string }).userId;
            const data = await this._service.getActivity(userId);
            res.status(HttpStatusCode.OK).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    }

    getCharts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = ((req as RequestWithUser).user as { userId: string }).userId;
            const data = await this._service.getCharts(userId);
            res.status(HttpStatusCode.OK).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    }

    getPerformance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = ((req as RequestWithUser).user as { userId: string }).userId;
            const data = await this._service.getPerformance(userId);
            res.status(HttpStatusCode.OK).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    }

    getAvailabilitySummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = ((req as RequestWithUser).user as { userId: string }).userId;
            const data = await this._service.getAvailabilitySummary(userId);
            res.status(HttpStatusCode.OK).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    }
}
