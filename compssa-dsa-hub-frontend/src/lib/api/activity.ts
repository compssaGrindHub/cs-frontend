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
  await apiClient.post<ApiResponse<any>>('/activity/start', {}, {
    timeout: 5000, // 5 second timeout instead of default 30s
  });
};

/**
 * Ping activity (keep session alive)
 * POST /api/activity/ping
 */
export const pingActivity = async (): Promise<void> => {
  await apiClient.post<ApiResponse<any>>('/activity/ping', {}, {
    timeout: 5000, // 5 second timeout
  });
};

/**
 * End activity session
 * POST /api/activity/end
 */
export const endActivitySession = async (): Promise<void> => {
  await apiClient.post<ApiResponse<any>>('/activity/end', {}, {
    timeout: 3000, // 3 second timeout - fail fast for non-critical operation
  });
};
