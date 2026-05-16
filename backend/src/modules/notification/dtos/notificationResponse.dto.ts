import { INotification } from '../models/notification.model';

export interface NotificationResponseDTO {
    id: string;
    recipientId: string;
    title: string;
    message: string;
    type: string;
    link?: string;
    isRead: boolean;
    createdAt: Date;
}

export const mapNotificationToResponseDTO = (notification: INotification | Record<string, unknown>): NotificationResponseDTO => {
    const n = notification as unknown as Record<string, unknown>;
    
    return {
        id: n._id ? (n._id as { toString(): string }).toString() : ((n.id as string) || ""),
        recipientId: n.recipient ? (n.recipient as { toString(): string }).toString() : "",
        title: (n.title as string) || "",
        message: (n.message as string) || "",
        type: (n.type as string) || "SYSTEM",
        link: (n.link as string) || undefined,
        isRead: (n.isRead as boolean) || false,
        createdAt: (n.createdAt as Date) || new Date()
    };
};
