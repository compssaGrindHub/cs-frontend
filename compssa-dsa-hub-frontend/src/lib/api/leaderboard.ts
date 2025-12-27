import apiClient from './client';
import { ApiResponse } from '@/lib/types/api';

// Types
export type Timeframe = 'all-time' | 'monthly' | 'weekly';

export interface LeaderboardEntry {
  rank: number;
  user: {
    id: string;
    username: string;
    profilePicture?: string | null;
  };
  rating: number;
  contestsParticipated: number;
  problemsSolved: number;
  currentStreak: number;
  rankChange?: number;
}

export interface ContestLeaderboardEntry {
  id: string;
  rank: number;
  ratingChange: number;
  problemsSolved: number;
  totalPoints: number;
  user: {
    id: string;
    username: string;
    profilePicture?: string | null;
  };
}

export interface TopicLeaderboardEntry {
  rank: number;
  user: {
    id: string;
    username: string;
    profilePicture?: string | null;
  };
  problemsSolved: number;
  rating: number;
}

interface GetGlobalLeaderboardParams {
  page?: number;
  limit?: number;
  timeframe?: Timeframe;
  topic?: string;
}

interface GetContestLeaderboardParams {
  page?: number;
  limit?: number;
}

// The actual API response structure: { success: true, data: LeaderboardEntry[], meta: {...} }
// So meta is at the root level, not nested in data
interface LeaderboardMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  userRank?: number;
}

interface PaginatedLeaderboardResponse {
  data: LeaderboardEntry[];
  meta: LeaderboardMeta;
}

interface PaginatedContestLeaderboardResponse {
  data: ContestLeaderboardEntry[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// Extended ApiResponse that includes meta at root level
interface LeaderboardApiResponse {
  success: boolean;
  data: LeaderboardEntry[];
  meta: LeaderboardMeta;
  message?: string;
  error?: string;
}

/**
 * Get global leaderboard
 * GET /api/leaderboard
 * 
 * Note: The API returns { success: true, data: LeaderboardEntry[], meta: {...} }
 * where data is an array directly, not nested in another object
 */
export const getGlobalLeaderboard = async (
  params?: GetGlobalLeaderboardParams
): Promise<LeaderboardApiResponse> => {
  const response = await apiClient.get<LeaderboardApiResponse>('/leaderboard', { params });
  return response.data;
};

/**
 * Get contest leaderboard
 * GET /api/leaderboard/contest/:contestId
 */
export const getContestLeaderboard = async (
  contestId: string,
  params?: GetContestLeaderboardParams
): Promise<ApiResponse<PaginatedContestLeaderboardResponse>> => {
  const response = await apiClient.get<ApiResponse<PaginatedContestLeaderboardResponse>>(
    `/leaderboard/contest/${contestId}`,
    { params }
  );
  return response.data;
};

/**
 * Get topic leaderboard
 * GET /api/leaderboard/topic/:topic
 */
export const getTopicLeaderboard = async (topic: string, limit?: number): Promise<ApiResponse<TopicLeaderboardEntry[]>> => {
  const response = await apiClient.get<ApiResponse<TopicLeaderboardEntry[]>>(`/leaderboard/topic/${topic}`, {
    params: { limit },
  });
  return response.data;
};

/**
 * Get user rank
 * GET /api/leaderboard/user/:userId/rank
 */
export const getUserRank = async (userId: string): Promise<ApiResponse<{ rank: number }>> => {
  const response = await apiClient.get<ApiResponse<{ rank: number }>>(`/leaderboard/user/${userId}/rank`);
  return response.data;
};

