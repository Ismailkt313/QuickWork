import { NotificationRepository } from './repositories/notification.repository';
import { NotificationService } from './services/notification.service';
import { NotificationController } from './controllers/notification.controller';
import { createNotificationRouter } from './routes/notification.routes';

export const notificationRepository = new NotificationRepository();
export const notificationService = new NotificationService(notificationRepository);
const notificationController = new NotificationController(notificationService);

export const notificationRouter = createNotificationRouter(notificationController);
