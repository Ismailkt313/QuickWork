import { getIo } from '../../../chat/socket';
import { NotificationRepository } from '../repositories/notification.repository';

export class NotificationService {
    constructor(private notificationRepository: NotificationRepository) {}

    async getNotifications(userId: string, limit: number = 20) {
        return await this.notificationRepository.findByUserId(userId, limit);
    }

    async getUnreadCount(userId: string) {
        return await this.notificationRepository.countUnreadByUserId(userId);
    }

    async markAsRead(notificationId: string, userId: string) {
        return await this.notificationRepository.findOneAndMarkRead(notificationId, userId);
    }

    async markAllAsRead(userId: string) {
        return await this.notificationRepository.updateAllRead(userId);
    }

    async createNotification(data: {
        recipient: string;
        title: string;
        message: string;
        type: 'JOB_ASSIGNMENT' | 'JOB_STATUS' | 'PAYMENT' | 'SYSTEM' | 'REVIEW';
        link?: string;
    }) {
        const notification =  await this.notificationRepository.create(data);
        const io = getIo()
        if(io ){
            io.to(data.recipient).emit('newNotification', notification);
        }
        return notification;
    }

    async deleteNotification(notificationId: string, userId: string) {
        return await this.notificationRepository.deleteOne(notificationId, userId);
    }
}
