import { Request, Response, NextFunction } from 'express';
import { SuccessMessages } from "../../../constants/messages/successMessages";
import { IModerationController, IModerationService } from '../interfaces/report.interface';
import { HttpStatusCode } from '../../../constants/httpStatusCode';
import { AppError } from '../../../utils/AppError';
import { z } from 'zod';

import { ITokenPayload } from '../../auth/interfaces/auth.interface';

interface RequestWithUser extends Request {
    user?: ITokenPayload;
}

const TakeActionSchema = z.object({
    action: z.enum(['warn', 'block', 'reject']),
    reason: z.string().min(1, 'Reason is required')
});

export class ModerationController implements IModerationController {
    private _moderationService: IModerationService;

    constructor(moderationService: IModerationService) {
        this._moderationService = moderationService;
    }

    public getReports = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { status, search, page, limit } = req.query;
            const result = await this._moderationService.getReports({
                status: status as string,
                search: search as string,
                page: page ? parseInt(page as string) : 1,
                limit: limit ? parseInt(limit as string) : 10
            });

            res.status(HttpStatusCode.OK).json({
                success: true,
                data: result.reports,
                pagination: {
                    total: result.total,
                    page: result.page,
                    pages: result.pages
                }
            });
        } catch (error) {
            next(error);
        }
    };

    public getReportDetail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const result = await this._moderationService.getReportDetail(id as string);

            res.status(HttpStatusCode.OK).json({
                success: true,
                data: result
            });
        } catch (error) {
            next(error);
        }
    };

    public takeAction = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const validation = TakeActionSchema.safeParse(req.body);

            if (!validation.success) {
                const errorMessage = validation.error.issues.map(issue => issue.message).join(', ');
                throw new AppError(errorMessage, HttpStatusCode.BAD_REQUEST);
            }

            const adminId = ((req as RequestWithUser).user as { userId: string }).userId;
            const { action, reason } = validation.data;

            const result = await this._moderationService.takeAction(id as string, adminId, action, reason);

            res.status(HttpStatusCode.OK).json({
                success: true,
                message: SuccessMessages.MODERATION_ACTION_TAKEN(action),
                data: result
            });
        } catch (error) {
            next(error);
        }
    };
}

