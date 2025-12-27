import apiClient from './client';
import { ApiResponse } from '@/lib/types/api';

// Types
export type AchievementType =
  | 'CONTEST_FIRST'
  | 'CONTEST_SECOND'
  | 'CONTEST_THIRD'
  | 'STREAK_7'
  | 'STREAK_30'
  | 'STREAK_100'
  | 'TOPIC_MASTER'
  | 'EARLY_BIRD'
  | 'NIGHT_OWL'
  | 'PERFECT_WEEK';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: AchievementType;
  requirement: Record<string, any>;
  createdAt: string;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  earnedAt: string;
  metadata?: Record<string, any> | null;
  achievement: Achievement;
}

export interface AchievementProgress {
  achievement: Achievement;
  earned: boolean;
  currentProgress: number;
  totalRequired: number;
  percentage: number;
}

// Request types
interface CreateAchievementRequest {
  name: string;
  description: string;
  icon: string;
  type: AchievementType;
  requirement: Record<string, any>;
}

/**
 * Get all achievements
 * GET /api/achievements
 */
export const getAchievements = async (): Promise<ApiResponse<Achievement[]>> => {
  const response = await apiClient.get<ApiResponse<Achievement[]>>('/achievements');
  return response.data;
};

/**
 * Get user achievements
 * GET /api/achievements/user/:userId
 */
export const getUserAchievements = async (userId: string): Promise<ApiResponse<UserAchievement[]>> => {
  const response = await apiClient.get<ApiResponse<UserAchievement[]>>(`/achievements/user/${userId}`);
  return response.data;
};

/**
 * Get achievement progress for current user
 * GET /api/achievements/progress
 */
export const getAchievementProgress = async (): Promise<ApiResponse<AchievementProgress[]>> => {
  const response = await apiClient.get<ApiResponse<AchievementProgress[]>>('/achievements/progress');
  return response.data;
};

/**
 * Create achievement (admin only)
 * POST /api/achievements
 */
export const createAchievement = async (
  achievementData: CreateAchievementRequest
): Promise<ApiResponse<Achievement>> => {
  const response = await apiClient.post<ApiResponse<Achievement>>('/achievements', achievementData);
  return response.data;
};

