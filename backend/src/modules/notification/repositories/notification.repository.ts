import { NotificationModel, INotification } from '../models/notification.model';

export class NotificationRepository {
    async findByUserId(userId: string, limit: number) {
        return await NotificationModel.find({ recipient: userId })
            .sort({ createdAt: -1 })
            .limit(limit);
    }

    async countUnreadByUserId(userId: string) {
        return await NotificationModel.countDocuments({ recipient: userId, isRead: false });
    }

    async findOneAndMarkRead(notificationId: string, userId: string) {
        return await NotificationModel.findOneAndUpdate(
            { _id: notificationId, recipient: userId },
            { isRead: true },
            { new: true }
        );
    }

    async updateAllRead(userId: string) {
        return await NotificationModel.updateMany(
            { recipient: userId, isRead: false },
            { isRead: true }
        );
    }

    async create(data: any) {
        return await NotificationModel.create(data);
    }

    async deleteOne(notificationId: string, userId: string) {
        return await NotificationModel.findOneAndDelete({ _id: notificationId, recipient: userId });
    }
}
