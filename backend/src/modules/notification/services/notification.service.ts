import { getIo } from '../../../chat/socket';
import { NotificationRepository } from '../repositories/notification.repository';
import { INotificationService, INotification } from '../interfaces/notification.interface';

export class NotificationService implements INotificationService {
    private _notificationRepository: NotificationRepository;
    constructor(notificationRepository: NotificationRepository) {
        this._notificationRepository = notificationRepository;
    }

    async getNotifications(userId: string, limit: number = 20) {
        return await this._notificationRepository.findByUserId(userId, limit);
    }

    async getUnreadCount(userId: string) {
        return await this._notificationRepository.countUnreadByUserId(userId);
    }

    async markAsRead(notificationId: string, userId: string) {
        return await this._notificationRepository.findOneAndMarkRead(notificationId, userId);
    }

    async markAllAsRead(userId: string) {
        return await this._notificationRepository.updateAllRead(userId);
    }

    async createNotification(data: {
        recipient: string;
        title: string;
        message: string;
        type: 'JOB_ASSIGNMENT' | 'JOB_STATUS' | 'PAYMENT' | 'SYSTEM' | 'REVIEW';
        link?: string;
    }) {
        const notification =  await this._notificationRepository.create(data as unknown as Partial<INotification>);
        const io = getIo()
        if(io ){
            io.to(data.recipient).emit('newNotification', notification);
        }
        return notification;
    }

    async deleteNotification(notificationId: string, userId: string) {
        return await this._notificationRepository.deleteOne(notificationId, userId);
    }
}
