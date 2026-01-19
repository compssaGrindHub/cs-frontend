import apiClient from "./client";
import { ApiResponse } from "@/lib/types/api";

// Types
export type NotificationType =
  | "CONTEST_REMINDER"
  | "DAILY_QUESTION"
  | "ACHIEVEMENT_UNLOCKED"
  | "RANK_CHANGE"
  | "STREAK_WARNING"
  | "SYSTEM_ANNOUNCEMENT";

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
  const response = await apiClient.get("/notifications", { params });
  const raw = response.data as unknown;

  const defaultMeta = {
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  };

  // If wrapped in ApiResponse
  if (raw && typeof raw === "object" && "success" in raw) {
    const inner = (raw as ApiResponse<{ data: Notification[]; meta: unknown }>)
      .data;
    return {
      data: inner?.data || [],
      meta: (inner?.meta as any) || defaultMeta,
    };
  }

  // Direct response: { data: Notification[]; meta: {...} }
  const direct = raw as { data?: Notification[]; meta?: unknown } | undefined;
  return {
    data: direct?.data || [],
    meta: (direct?.meta as any) || defaultMeta,
  };
};

/**
 * Get unread notifications count
 * GET /api/notifications/unread-count
 */
export const getUnreadCount = async (): Promise<number> => {
  const response = await apiClient.get<ApiResponse<{ unreadCount: number }>>(
    "/notifications/unread-count"
  );
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
  await apiClient.put<ApiResponse<void>>("/notifications/read-all");
};

/**
 * Delete notification
 * DELETE /api/notifications/:id
 */
export const deleteNotification = async (id: string): Promise<void> => {
  await apiClient.delete<ApiResponse<void>>(`/notifications/${id}`);
};
