import { Request, Response } from 'express';
import { INotificationController, INotificationService } from '../interfaces/notification.interface';

export class NotificationController implements INotificationController {
    constructor(private notificationService: INotificationService) {}

    getNotifications = async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user.userId;
            const notifications = await this.notificationService.getNotifications(userId);
            const unreadCount = await this.notificationService.getUnreadCount(userId);

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
            await this.notificationService.markAsRead(id as string, userId);

            res.status(200).json({ success: true, message: 'Notification marked as read' });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    };

    markAllAsRead = async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user.userId;
            await this.notificationService.markAllAsRead(userId);

            res.status(200).json({ success: true, message: 'All notifications marked as read' });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    };

    

    deleteNotification = async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user.userId;
            const { id } = req.params;
            await this.notificationService.deleteNotification(id as string, userId);

            res.status(200).json({ success: true, message: 'Notification deleted' });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    };
}
