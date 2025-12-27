import apiClient from './client';
import { ApiResponse } from '@/lib/types/api';
import { Contest, ContestDetail, Standing } from '@/lib/types/contest';

// Request types
interface CreateContestRequest {
  name: string;
  platform: 'LEETCODE' | 'CODEFORCES' | 'CUSTOM';
  externalId?: string;
  startTime: string;
  duration: number;
  isRated?: boolean;
  description?: string;
}

interface UpdateContestRequest {
  name?: string;
  platform?: 'LEETCODE' | 'CODEFORCES' | 'CUSTOM';
  externalId?: string;
  startTime?: string;
  duration?: number;
  isRated?: boolean;
  description?: string;
}

interface GetContestsParams {
  page?: number;
  limit?: number;
  status?: 'UPCOMING' | 'LIVE' | 'COMPLETED';
  platform?: 'LEETCODE' | 'CODEFORCES' | 'CUSTOM';
}

interface PaginatedContestsResponse {
  data: Contest[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

/**
 * Get all contests with filters
 * GET /api/contests
 */
export const getContests = async (params?: GetContestsParams): Promise<ApiResponse<PaginatedContestsResponse>> => {
  const response = await apiClient.get<ApiResponse<PaginatedContestsResponse>>('/contests', { params });
  return response.data;
};

/**
 * Get upcoming contests
 * GET /api/contests/upcoming
 */
export const getUpcomingContests = async (limit?: number): Promise<ApiResponse<Contest[]>> => {
  const response = await apiClient.get<ApiResponse<Contest[]>>('/contests/upcoming', {
    params: { limit },
  });
  return response.data;
};

/**
 * Get user contests
 * GET /api/contests/user/:userId
 */
export const getUserContests = async (userId: string): Promise<ApiResponse<Contest[]>> => {
  const response = await apiClient.get<ApiResponse<Contest[]>>(`/contests/user/${userId}`);
  return response.data;
};

/**
 * Get contest by ID
 * GET /api/contests/:id
 */
export const getContestById = async (id: string): Promise<ApiResponse<ContestDetail>> => {
  const response = await apiClient.get<ApiResponse<ContestDetail>>(`/contests/${id}`);
  return response.data;
};

/**
 * Get contest standings
 * GET /api/contests/:id/standings
 */
export const getContestStandings = async (id: string): Promise<ApiResponse<Standing[]>> => {
  const response = await apiClient.get<ApiResponse<Standing[]>>(`/contests/${id}/standings`);
  return response.data;
};

/**
 * Register for contest
 * POST /api/contests/:id/register
 */
export const registerForContest = async (id: string): Promise<ApiResponse<any>> => {
  const response = await apiClient.post<ApiResponse<any>>(`/contests/${id}/register`);
  return response.data;
};

/**
 * Create contest (admin only)
 * POST /api/contests
 */
export const createContest = async (contestData: CreateContestRequest): Promise<ApiResponse<Contest>> => {
  const response = await apiClient.post<ApiResponse<Contest>>('/contests', contestData);
  return response.data;
};

/**
 * Sync contest standings (admin only)
 * POST /api/contests/:id/sync
 */
export const syncContestStandings = async (id: string): Promise<ApiResponse<any>> => {
  const response = await apiClient.post<ApiResponse<any>>(`/contests/${id}/sync`);
  return response.data;
};

/**
 * Update contest (admin only)
 * PUT /api/contests/:id
 */
export const updateContest = async (id: string, contestData: UpdateContestRequest): Promise<ApiResponse<Contest>> => {
  const response = await apiClient.put<ApiResponse<Contest>>(`/contests/${id}`, contestData);
  return response.data;
};

/**
 * Delete contest (admin only)
 * DELETE /api/contests/:id
 */
export const deleteContest = async (id: string): Promise<ApiResponse<void>> => {
  const response = await apiClient.delete<ApiResponse<void>>(`/contests/${id}`);
  return response.data;
};

