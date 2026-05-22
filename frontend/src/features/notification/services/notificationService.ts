import { api } from "../../../services/api";
import { ENDPOINTS } from "../../../constants/endpoints";

export interface INotification {
  id: string;
  title: string;
  message: string;
  type: 'JOB_ASSIGNMENT' | 'JOB_STATUS' | 'PAYMENT' | 'SYSTEM' | 'REVIEW';
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export const notificationService = {
  getNotifications: async () => {
    const response = await api.get<{ success: boolean; data: { notifications: INotification[]; unreadCount: number } }>(ENDPOINTS.NOTIFICATION.LIST);
    return response.data.data;
  },

  markAsRead: async (id: string) => {
    await api.patch(ENDPOINTS.NOTIFICATION.READ_ONE(id));
  },

  markAllAsRead: async () => {
    await api.patch(ENDPOINTS.NOTIFICATION.READ_ALL);
  },

  deleteNotification: async (id: string) => {
    await api.delete(ENDPOINTS.NOTIFICATION.DELETE(id));
  }
};
