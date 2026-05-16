import { Request, Response } from 'express';
import { INotificationController, INotificationService } from '../interfaces/notification.interface';

import { ITokenPayload } from '../../auth/interfaces/auth.interface';

interface RequestWithUser extends Request {
    user?: ITokenPayload;
}

export class NotificationController implements INotificationController {
    private _notificationService: INotificationService;
    constructor(notificationService: INotificationService) {
        this._notificationService = notificationService;
    }

    getNotifications = async (req: Request, res: Response) => {
        try {
            const userId = ((req as RequestWithUser).user as { userId: string }).userId;
            const notifications = await this._notificationService.getNotifications(userId);
            const unreadCount = await this._notificationService.getUnreadCount(userId);

            res.status(200).json({
                success: true,
                data: {
                    notifications,
                    unreadCount
                }
            });
        } catch (error: unknown) {
            res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
        }
    };

    markAsRead = async (req: Request, res: Response) => {
        try {
            const userId = ((req as RequestWithUser).user as { userId: string }).userId;
            const { id } = req.params;
            await this._notificationService.markAsRead(id as string, userId);

            res.status(200).json({ success: true, message: 'Notification marked as read' });
        } catch (error: unknown) {
            res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
        }
    };

    markAllAsRead = async (req: Request, res: Response) => {
        try {
            const userId = ((req as RequestWithUser).user as { userId: string }).userId;
            await this._notificationService.markAllAsRead(userId);

            res.status(200).json({ success: true, message: 'All notifications marked as read' });
        } catch (error: unknown) {
            res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
        }
    };

    deleteNotification = async (req: Request, res: Response) => {
        try {
            const userId = ((req as RequestWithUser).user as { userId: string }).userId;
            const { id } = req.params;
            await this._notificationService.deleteNotification(id as string, userId);

            res.status(200).json({ success: true, message: 'Notification deleted' });
        } catch (error: unknown) {
            res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
        }
    };
}
