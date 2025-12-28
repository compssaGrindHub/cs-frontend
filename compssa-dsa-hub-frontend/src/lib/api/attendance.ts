import apiClient from './client';
import { ApiResponse } from '@/lib/types/api';

// Types
export interface Attendance {
  id: string;
  userId: string;
  sessionId: string;
  present: boolean;
  createdAt: string;
  session?: {
    id: string;
    name: string;
    type: string;
    date: string;
    startTime: string;
    endTime: string;
  };
  user?: {
    id: string;
    username: string;
    email: string;
  };
}

export interface AttendanceStats {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  percentage: number;
  recentStreak: number;
}

// Request types
interface MarkAttendanceRequest {
  userId: string;
  sessionId: string;
  present: boolean;
}

interface MarkBulkAttendanceRequest {
  userIds: string[];
  sessionId: string;
  present: boolean;
}

interface GetUserAttendanceParams {
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
}

interface BulkAttendanceResponse {
  count: number;
  message: string;
}

/**
 * Mark attendance (admin only)
 * POST /api/attendance
 */
export const markAttendance = async (attendanceData: MarkAttendanceRequest): Promise<ApiResponse<Attendance>> => {
  const response = await apiClient.post<ApiResponse<Attendance>>('/attendance', attendanceData);
  return response.data;
};

/**
 * Mark bulk attendance (admin only)
 * POST /api/attendance/bulk
 */
export const markBulkAttendance = async (
  attendanceData: MarkBulkAttendanceRequest
): Promise<ApiResponse<BulkAttendanceResponse>> => {
  const response = await apiClient.post<ApiResponse<BulkAttendanceResponse>>(
    '/attendance/bulk',
    attendanceData
  );
  return response.data;
};

/**
 * Get user attendance
 * GET /api/attendance/user/:userId
 */
export const getUserAttendance = async (
  userId: string,
  params?: GetUserAttendanceParams
): Promise<ApiResponse<Attendance[]>> => {
  const response = await apiClient.get<ApiResponse<Attendance[]>>(`/attendance/user/${userId}`, { params });
  return response.data;
};

/**
 * Get attendance stats
 * GET /api/attendance/stats/:userId
 */
export const getAttendanceStats = async (userId: string): Promise<ApiResponse<AttendanceStats>> => {
  const response = await apiClient.get<ApiResponse<AttendanceStats>>(`/attendance/stats/${userId}`);
  return response.data;
};

export interface SessionAttendanceResponse {
  sessionId: string;
  sessionName: string;
  sessionType: string;
  total: number;
  present: number;
  absent: number;
  users: Array<{
    userId: string;
    username: string;
    present: boolean;
  }>;
}

/**
 * Get session attendance (admin only)
 * GET /api/attendance/session/:sessionId
 */
export const getSessionAttendance = async (sessionId: string): Promise<SessionAttendanceResponse> => {
  const response = await apiClient.get<ApiResponse<SessionAttendanceResponse>>(`/attendance/session/${sessionId}`);
  return response.data.data as SessionAttendanceResponse;
};

