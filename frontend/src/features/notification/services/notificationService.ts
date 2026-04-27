import { api } from "../../../services/api";

export interface INotification {
  _id: string;
  title: string;
  message: string;
  type: 'JOB_ASSIGNMENT' | 'JOB_STATUS' | 'PAYMENT' | 'SYSTEM' | 'REVIEW';
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export const notificationService = {
  getNotifications: async () => {
    const response = await api.get<{ success: boolean; data: { notifications: INotification[]; unreadCount: number } }>('/notifications');
    return response.data.data;
  },

  markAsRead: async (id: string) => {
    await api.patch(`/notifications/${id}/read`);
  },

  markAllAsRead: async () => {
    await api.patch('/notifications/read-all');
  },

  deleteNotification: async (id: string) => {
    await api.delete(`/notifications/${id}`);
  }
};
