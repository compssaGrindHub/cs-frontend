import apiClient from './client';
import { ApiResponse } from '@/lib/types/api';

// Types
export interface SystemOverview {
  users: number;
  problems: number;
  submissions: number;
  contests: number;
  sessions: number;
  attendance: number;
  notifications: number;
  achievements: number;
  userAchievements: number;
}

export interface UserGrowthPoint {
  key: string; // Date key: YYYY-MM-DD or YYYY-MM
  count: number;
}

export interface UserGrowth {
  bucket: 'day' | 'month';
  points: UserGrowthPoint[];
}

export interface Engagement {
  activeUsers: number;
  bySource: {
    submissions: number;
    contests: number;
    attendance: number;
  };
  time: number;
}

export interface AttendanceAnalyticsItem {
  type: 'LECTURE' | 'PRACTICE' | 'CONTEST' | 'WORKSHOP' | 'OTHER';
  total: number;
  present: number;
  percentage: number;
}

export interface AttendanceAnalytics {
  items: AttendanceAnalyticsItem[];
}

export interface NotificationsUsage {
  total: number;
  read: number;
  unread: number;
  readRate: number;
}

export interface AchievementStats {
  achievementsTotal: number;
  unlockedTotal: number;
  byAchievement: Array<{
    achievementId: string;
    _count: {
      _all: number;
    };
  }>;
}

export interface ContestParticipation {
  total: number;
  avgRank: number;
}

export interface SubmissionsStats {
  total: number;
  uniqueUsers: number;
  daily: Array<{
    key: string; // YYYY-MM-DD
    count: number;
  }>;
}

export interface UsageTimeStats {
  overall: number; // total minutes
  average: number; // average minutes per user
  users: Array<{
    userId: string;
    minutes: number;
  }>;
}

// Request params
interface DateRangeParams {
  from?: string; // Date string
  to?: string; // Date string
}

interface UserGrowthParams extends DateRangeParams {
  bucket?: 'day' | 'month';
}

/**
 * Get system overview (admin only)
 * GET /api/admin/overview
 */
export const getSystemOverview = async (): Promise<SystemOverview> => {
  const response = await apiClient.get<ApiResponse<SystemOverview>>('/admin/overview');
  return response.data.data as SystemOverview;
};

export const getUserGrowth = async (params?: UserGrowthParams): Promise<UserGrowth> => {
  const response = await apiClient.get<ApiResponse<UserGrowth>>('/admin/users/growth', { params });
  return response.data.data as UserGrowth;
};

export const getEngagement = async (params?: DateRangeParams): Promise<Engagement> => {
  const response = await apiClient.get<ApiResponse<Engagement>>('/admin/engagement', { params });
  return response.data.data as Engagement;
};

export const getAttendanceAnalytics = async (params?: DateRangeParams): Promise<AttendanceAnalytics> => {
  const response = await apiClient.get<ApiResponse<AttendanceAnalytics>>('/admin/attendance/stats', { params });
  return response.data.data as AttendanceAnalytics;
};

export const getNotificationsUsage = async (params?: DateRangeParams): Promise<NotificationsUsage> => {
  const response = await apiClient.get<ApiResponse<NotificationsUsage>>('/admin/notifications/usage', { params });
  return response.data.data as NotificationsUsage;
};

export const getAchievementsStats = async (): Promise<AchievementStats> => {
  const response = await apiClient.get<ApiResponse<AchievementStats>>('/admin/achievements/stats');
  return response.data.data as AchievementStats;
};

export const getContestParticipation = async (contestId: string): Promise<ContestParticipation> => {
  const response = await apiClient.get<ApiResponse<ContestParticipation>>(`/admin/contests/${contestId}/participation`);
  return response.data.data as ContestParticipation;
};

export const getSubmissionsStats = async (params?: DateRangeParams): Promise<SubmissionsStats> => {
  const response = await apiClient.get<ApiResponse<SubmissionsStats>>('/admin/submissions/stats', { params });
  return response.data.data as SubmissionsStats;
};

export const getUsageTimeStats = async (params?: DateRangeParams): Promise<UsageTimeStats> => {
  const response = await apiClient.get<ApiResponse<UsageTimeStats>>('/admin/usage/time', { params });
  return response.data.data as UsageTimeStats;
};

