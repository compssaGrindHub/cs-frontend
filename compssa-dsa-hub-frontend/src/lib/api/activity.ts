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
  try {
    await apiClient.post<ApiResponse<unknown>>('/activity/start', {}, {
      timeout: 15000, // give backend more headroom
    });
  } catch (error) {
    // Non-critical; swallow to avoid blocking layout
    if (process.env.NODE_ENV === 'development') {
      console.warn('startActivitySession skipped:', error);
    }
  }
};

/**
 * Ping activity (keep session alive)
 * POST /api/activity/ping
 */
export const pingActivity = async (): Promise<void> => {
  try {
    await apiClient.post<ApiResponse<unknown>>('/activity/ping', {}, {
      timeout: 15000,
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('pingActivity skipped:', error);
    }
  }
};

/**
 * End activity session
 * POST /api/activity/end
 */
export const endActivitySession = async (): Promise<void> => {
  try {
    await apiClient.post<ApiResponse<unknown>>('/activity/end', {}, {
      timeout: 8000,
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('endActivitySession skipped:', error);
    }
  }
};
