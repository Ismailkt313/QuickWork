import { Request, Response, NextFunction } from 'express';
import { INotification } from '../models/notification.model';
import { IBaseRepository } from '../../../shared/interfaces/base.repository.interface';
export { INotification };

export interface INotificationController {
    getNotifications(req: Request, res: Response, next?: NextFunction): Promise<void>;
    markAsRead(req: Request, res: Response, next?: NextFunction): Promise<void>;
    markAllAsRead(req: Request, res: Response, next?: NextFunction): Promise<void>;
    deleteNotification(req: Request, res: Response, next?: NextFunction): Promise<void>;
}

export interface INotificationService {
    getNotifications(userId: string, limit?: number): Promise<INotification[]>;
    getUnreadCount(userId: string): Promise<number>;
    markAsRead(notificationId: string, userId: string): Promise<INotification | null>;
    markAllAsRead(userId: string): Promise<unknown>;
    createNotification(data: {
        recipient: string;
        title: string;
        message: string;
        type: 'JOB_ASSIGNMENT' | 'JOB_STATUS' | 'PAYMENT' | 'SYSTEM' | 'REVIEW';
        link?: string;
    }): Promise<INotification>;
    deleteNotification(notificationId: string, userId: string): Promise<INotification | null>;
}

export interface INotificationRepository extends IBaseRepository<INotification> {
    findByUserId(userId: string, limit: number): Promise<INotification[]>;
    countUnreadByUserId(userId: string): Promise<number>;
    findOneAndMarkRead(notificationId: string, userId: string): Promise<INotification | null>;
    updateAllRead(userId: string): Promise<unknown>;

    deleteOne(notificationId: string, userId: string): Promise<INotification | null>;
}
