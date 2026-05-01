import { Request, Response, NextFunction } from 'express';

export interface INotificationController {
    getNotifications(req: Request, res: Response, next?: NextFunction): Promise<void>;
    markAsRead(req: Request, res: Response, next?: NextFunction): Promise<void>;
    markAllAsRead(req: Request, res: Response, next?: NextFunction): Promise<void>;
    deleteNotification(req: Request, res: Response, next?: NextFunction): Promise<void>;
}

export interface INotificationService {
    getNotifications(userId: string, limit?: number): Promise<any>;
    getUnreadCount(userId: string): Promise<number>;
    markAsRead(notificationId: string, userId: string): Promise<any>;
    markAllAsRead(userId: string): Promise<any>;
    createNotification(data: {
        recipient: string;
        title: string;
        message: string;
        type: 'JOB_ASSIGNMENT' | 'JOB_STATUS' | 'PAYMENT' | 'SYSTEM' | 'REVIEW';
        link?: string;
    }): Promise<any>;
    deleteNotification(notificationId: string, userId: string): Promise<any>;
}

export interface INotificationRepository {
    findByUserId(userId: string, limit: number): Promise<any>;
    countUnreadByUserId(userId: string): Promise<number>;
    findOneAndMarkRead(notificationId: string, userId: string): Promise<any>;
    updateAllRead(userId: string): Promise<any>;
    create(data: any): Promise<any>;
    deleteOne(notificationId: string, userId: string): Promise<any>;
}
