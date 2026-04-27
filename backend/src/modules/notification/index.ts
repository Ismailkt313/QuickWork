import { NotificationRepository } from './repositories/notification.repository';
import { NotificationService } from './services/notification.service';
import { NotificationController } from './controllers/notification.controller';
import { createNotificationRouter } from './routes/notification.routes';

const notificationRepository = new NotificationRepository();
const notificationService = new NotificationService(notificationRepository);
const notificationController = new NotificationController(notificationService);

const notificationRouter = createNotificationRouter(notificationController);

export {
    notificationRouter,
    notificationService
};
