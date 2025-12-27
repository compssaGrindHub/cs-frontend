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
): Promise<ApiResponse<PaginatedNotificationsResponse>> => {
  const response = await apiClient.get<ApiResponse<PaginatedNotificationsResponse>>('/notifications', { params });
  return response.data;
};

/**
 * Get unread notifications count
 * GET /api/notifications/unread-count
 */
export const getUnreadCount = async (): Promise<ApiResponse<{ unreadCount: number }>> => {
  const response = await apiClient.get<ApiResponse<{ unreadCount: number }>>('/notifications/unread-count');
  return response.data;
};

/**
 * Mark notification as read
 * PUT /api/notifications/:id/read
 */
export const markNotificationAsRead = async (id: string): Promise<ApiResponse<void>> => {
  const response = await apiClient.put<ApiResponse<void>>(`/notifications/${id}/read`);
  return response.data;
};

/**
 * Mark all notifications as read
 * PUT /api/notifications/read-all
 */
export const markAllNotificationsAsRead = async (): Promise<ApiResponse<void>> => {
  const response = await apiClient.put<ApiResponse<void>>('/notifications/read-all');
  return response.data;
};

/**
 * Delete notification
 * DELETE /api/notifications/:id
 */
export const deleteNotification = async (id: string): Promise<ApiResponse<void>> => {
  const response = await apiClient.delete<ApiResponse<void>>(`/notifications/${id}`);
  return response.data;
};

