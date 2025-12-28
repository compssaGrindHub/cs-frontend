import apiClient from './client';
import { ApiResponse } from '@/lib/types/api';

// Types
export type NotificationType =
  | 'CONTEST_REMINDER'
  | 'DAILY_QUESTION'
  | 'ACHIEVEMENT_UNLOCKED'
  | 'RANK_CHANGE'
  | 'STREAK_WARNING'
  | 'SYSTEM_ANNOUNCEMENT';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, any> | null;
  read: boolean;
  createdAt: string;
}

interface GetNotificationsParams {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}

interface PaginatedNotificationsResponse {
  data: Notification[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Get notifications
 * GET /api/notifications
 */
export const getNotifications = async (
  params?: GetNotificationsParams
): Promise<PaginatedNotificationsResponse> => {
  const response = await apiClient.get<ApiResponse<{ data: Notification[]; meta: any }>>('/notifications', { params });
  // Backend returns { success: true, data: [], meta: {} } directly
  return {
    data: response.data.data || [],
    meta: response.data.meta || {
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    },
  };
};

/**
 * Get unread notifications count
 * GET /api/notifications/unread-count
 */
export const getUnreadCount = async (): Promise<number> => {
  const response = await apiClient.get<ApiResponse<{ unreadCount: number }>>('/notifications/unread-count');
  return response.data.data?.unreadCount || 0;
};

/**
 * Mark notification as read
 * PUT /api/notifications/:id/read
 */
export const markNotificationAsRead = async (id: string): Promise<void> => {
  await apiClient.put<ApiResponse<void>>(`/notifications/${id}/read`);
};

/**
 * Mark all notifications as read
 * PUT /api/notifications/read-all
 */
export const markAllNotificationsAsRead = async (): Promise<void> => {
  await apiClient.put<ApiResponse<void>>('/notifications/read-all');
};

/**
 * Delete notification
 * DELETE /api/notifications/:id
 */
export const deleteNotification = async (id: string): Promise<void> => {
  await apiClient.delete<ApiResponse<void>>(`/notifications/${id}`);
};

