import apiClient from './client';
import { ApiResponse } from '@/lib/types/api';

// Types
export interface ActivitySession {
  id: string;
  userId: string;
  startedAt: string;
  endedAt: string | null;
  lastPingAt: string;
  totalMinutes: number;
  createdAt: string;
}

// Request types
interface StartActivityRequest {
  userId: string;
}

interface PingActivityRequest {
  userId: string;
}

interface GetUserTimeLogsParams {
  from?: string; // Date string
  to?: string; // Date string
}

/**
 * Start activity session
 * POST /api/activity/start
 */
export const startActivitySession = async (data: StartActivityRequest): Promise<ApiResponse<ActivitySession>> => {
  const response = await apiClient.post<ApiResponse<ActivitySession>>('/activity/start', data);
  return response.data;
};

/**
 * Ping activity session (keep alive)
 * POST /api/activity/ping
 */
export const pingActivitySession = async (data: PingActivityRequest): Promise<ApiResponse<ActivitySession>> => {
  const response = await apiClient.post<ApiResponse<ActivitySession>>('/activity/ping', data);
  return response.data;
};

/**
 * End activity session
 * POST /api/activity/end
 */
export const endActivitySession = async (data: PingActivityRequest): Promise<ApiResponse<ActivitySession>> => {
  const response = await apiClient.post<ApiResponse<ActivitySession>>('/activity/end', data);
  return response.data;
};

/**
 * Get user time logs (admin only)
 * GET /api/activity/minutes/:userId
 */
export const getUserTimeLogs = async (
  userId: string,
  params?: GetUserTimeLogsParams
): Promise<ApiResponse<{ minutes: number }>> => {
  const response = await apiClient.get<ApiResponse<{ minutes: number }>>(`/activity/minutes/${userId}`, { params });
  return response.data;
};

