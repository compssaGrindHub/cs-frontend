import apiClient from './client';
import { ApiResponse } from '@/lib/types/api';

/**
 * Get current user's total time spent (in minutes)
 * GET /api/activity/my-time
 */
export const getMyTimeSpent = async (params?: { from?: string; to?: string }): Promise<number> => {
  const response = await apiClient.get<ApiResponse<{ minutes: number }>>('/activity/my-time', { params });
  return response.data.data?.minutes || 0;
};

/**
 * Start activity session
 * POST /api/activity/start
 */
export const startActivitySession = async (): Promise<void> => {
  await apiClient.post<ApiResponse<any>>('/activity/start', { userId: null }); // userId comes from auth
};

/**
 * Ping activity (keep session alive)
 * POST /api/activity/ping
 */
export const pingActivity = async (): Promise<void> => {
  await apiClient.post<ApiResponse<any>>('/activity/ping', { userId: null }); // userId comes from auth
};

/**
 * End activity session
 * POST /api/activity/end
 */
export const endActivitySession = async (): Promise<void> => {
  await apiClient.post<ApiResponse<any>>('/activity/end', { userId: null }); // userId comes from auth
};
