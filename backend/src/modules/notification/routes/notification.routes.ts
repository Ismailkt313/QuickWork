import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { authMiddleware } from '../../../middleware/auth.middleware';

export const createNotificationRouter = (notificationController: NotificationController) => {
    const router = Router();

    router.use(authMiddleware);

    router.get('/', notificationController.getNotifications);
    router.patch('/:id/read', notificationController.markAsRead);
    router.patch('/read-all', notificationController.markAllAsRead);
    router.delete('/:id', notificationController.deleteNotification);

    return router;
};
