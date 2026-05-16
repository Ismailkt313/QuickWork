import { Request, Response, NextFunction } from 'express';
import { INotificationController, INotificationService } from '../interfaces/notification.interface';
import { HttpStatusCode } from '../../../constants/httpStatusCode';
import { SuccessMessages } from '../../../constants/messages/successMessages';

import { ITokenPayload } from '../../auth/interfaces/auth.interface';
import { mapNotificationToResponseDTO } from '../dtos/notificationResponse.dto';

interface RequestWithUser extends Request {
    user?: ITokenPayload;
}

export class NotificationController implements INotificationController {
    private _notificationService: INotificationService;
    constructor(notificationService: INotificationService) {
        this._notificationService = notificationService;
    }

    public getNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = ((req as RequestWithUser).user as { userId: string }).userId;
            const notifications = await this._notificationService.getNotifications(userId);
            const unreadCount = await this._notificationService.getUnreadCount(userId);

            res.status(HttpStatusCode.OK).json({
                success: true,
                data: {
                    notifications: notifications.map(mapNotificationToResponseDTO),
                    unreadCount
                }
            });
        } catch (error) {
            next(error);
        }
    };

    public markAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = ((req as RequestWithUser).user as { userId: string }).userId;
            const { id } = req.params;
            await this._notificationService.markAsRead(id as string, userId);

            res.status(HttpStatusCode.OK).json({ success: true, message: SuccessMessages.NOTIFICATION_MARKED_READ });
        } catch (error) {
            next(error);
        }
    };

    public markAllAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = ((req as RequestWithUser).user as { userId: string }).userId;
            await this._notificationService.markAllAsRead(userId);

            res.status(HttpStatusCode.OK).json({ success: true, message: SuccessMessages.ALL_NOTIFICATIONS_MARKED_READ });
        } catch (error) {
            next(error);
        }
    };

    public deleteNotification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = ((req as RequestWithUser).user as { userId: string }).userId;
            const { id } = req.params;
            await this._notificationService.deleteNotification(id as string, userId);

            res.status(HttpStatusCode.OK).json({ success: true, message: SuccessMessages.NOTIFICATION_DELETED });
        } catch (error) {
            next(error);
        }
    };
}



