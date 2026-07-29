import { apiFetch, ApiResponse } from './api';
import { Task } from './taskService';

export interface AppNotification {
  id: number;
  user_id: number;
  task_id: number;
  type: 'new_task' | 'deadline_approaching' | string;
  title: string;
  message: string;
  read_at: string | null;
  created_at: string;
  updated_at?: string;
  task?: Task;
}

export const notificationService = {
  async getNotifications(): Promise<ApiResponse<AppNotification[]>> {
    return await apiFetch<AppNotification[]>('/notifications', {
      method: 'GET',
    });
  },

  async markAsRead(id: number): Promise<ApiResponse<AppNotification>> {
    return await apiFetch<AppNotification>(`/notifications/${id}/read`, {
      method: 'PATCH',
    });
  },

  async markAllAsRead(): Promise<ApiResponse> {
    return await apiFetch('/notifications/read-all', {
      method: 'POST',
    });
  },

  getUnreadCount(notifications: AppNotification[]): number {
    return notifications.filter((n) => !n.read_at).length;
  }
};
