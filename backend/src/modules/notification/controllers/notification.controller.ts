import { Request, Response } from 'express';
import { INotificationController, INotificationService } from '../interfaces/notification.interface';

export class NotificationController implements INotificationController {
    private _notificationService: INotificationService;
    constructor(notificationService: INotificationService) {
        this._notificationService = notificationService;
    }

    getNotifications = async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user.userId;
            const notifications = await this._notificationService.getNotifications(userId);
            const unreadCount = await this._notificationService.getUnreadCount(userId);

            res.status(200).json({
                success: true,
                data: {
                    notifications,
                    unreadCount
                }
            });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    };

    markAsRead = async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user.userId;
            const { id } = req.params;
            await this._notificationService.markAsRead(id as string, userId);

            res.status(200).json({ success: true, message: 'Notification marked as read' });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    };

    markAllAsRead = async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user.userId;
            await this._notificationService.markAllAsRead(userId);

            res.status(200).json({ success: true, message: 'All notifications marked as read' });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    };

    

    deleteNotification = async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user.userId;
            const { id } = req.params;
            await this._notificationService.deleteNotification(id as string, userId);

            res.status(200).json({ success: true, message: 'Notification deleted' });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    };
}
