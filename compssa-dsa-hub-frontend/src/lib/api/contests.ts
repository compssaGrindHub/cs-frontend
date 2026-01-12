import apiClient from "./client";
import { ApiResponse } from "@/lib/types/api";
import { Contest, ContestDetail, Standing } from "@/lib/types/contest";

// Export types for use in components
export type { Contest, ContestDetail, Standing };

// Contest participation type returned by getUserContests
export interface ContestParticipation {
  id: string;
  createdAt: string;
  userId: string;
  contestId: string;
  rank: number;
  ratingChange: number;
  problemsSolved: number;
  totalPoints: number;
  contest: Contest;
}

// Request types
interface CreateContestRequest {
  name: string;
  platform: "LEETCODE" | "CODEFORCES" | "CUSTOM";
  externalId?: string;
  startTime: string;
  duration: number;
  isRated?: boolean;
  description?: string;
}

interface UpdateContestRequest {
  name?: string;
  platform?: "LEETCODE" | "CODEFORCES" | "CUSTOM";
  externalId?: string;
  startTime?: string;
  duration?: number;
  isRated?: boolean;
  description?: string;
}

interface GetContestsParams {
  page?: number;
  limit?: number;
  status?: "UPCOMING" | "LIVE" | "COMPLETED";
  platform?: "LEETCODE" | "CODEFORCES" | "CUSTOM";
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
export const getContests = async (
  params?: GetContestsParams
): Promise<PaginatedContestsResponse> => {
  const response = await apiClient.get<PaginatedContestsResponse>("/contests", {
    params,
  });
  return response.data;
};

/**
 * Get upcoming contests
 * GET /api/contests/upcoming
 */
export const getUpcomingContests = async (
  limit?: number
): Promise<Contest[]> => {
  const response = await apiClient.get<ApiResponse<Contest[]>>(
    "/contests/upcoming",
    {
      params: { limit },
    }
  );
  return response.data.data || [];
};

/**
 * Get user contests (participations)
 * GET /api/contests/user/:userId
 * Returns participation objects with nested contest and contestId
 */
export const getUserContests = async (
  userId: string
): Promise<ContestParticipation[]> => {
  const response = await apiClient.get<ApiResponse<ContestParticipation[]>>(
    `/contests/user/${userId}`
  );
  return response.data.data || [];
};

/**
 * Get contest by ID
 * GET /api/contests/:id
 */
export const getContestById = async (
  id: string
): Promise<ApiResponse<ContestDetail>> => {
  const response = await apiClient.get<ApiResponse<ContestDetail>>(
    `/contests/${id}`
  );
  return response.data;
};

/**
 * Get contest standings
 * GET /api/contests/:id/standings
 */
export const getContestStandings = async (
  id: string
): Promise<ApiResponse<Standing[]>> => {
  const response = await apiClient.get<ApiResponse<Standing[]>>(
    `/contests/${id}/standings`
  );
  return response.data;
};

export const evaluateContest = async (id: string): Promise<ApiResponse> => {
  const response = await apiClient.get<ApiResponse>(`/contests/${id}/evaluate`);
  return response.data;
};

/**
 * Register for contest
 * POST /api/contests/:id/register
 */
export const registerForContest = async (
  id: string
): Promise<{ message: string }> => {
  const response = await apiClient.post<ApiResponse<{ message: string }>>(
    `/contests/${id}/register`
  );
  return response.data.data || { message: "Registered successfully" };
};

/**
 * Create contest (admin only)
 * POST /api/contests
 */
export const createContest = async (
  contestData: CreateContestRequest
): Promise<ApiResponse<Contest>> => {
  const response = await apiClient.post<ApiResponse<Contest>>(
    "/contests",
    contestData
  );
  return response.data;
};

/**
 * Sync contest standings (admin only)
 * POST /api/contests/:id/sync
 */
export const syncContestStandings = async (
  id: string
): Promise<ApiResponse<{ synced: boolean }>> => {
  const response = await apiClient.post<ApiResponse<{ synced: boolean }>>(
    `/contests/${id}/sync`
  );
  return response.data;
};

/**
 * Update contest (admin only)
 * PUT /api/contests/:id
 */
export const updateContest = async (
  id: string,
  contestData: UpdateContestRequest
): Promise<ApiResponse<Contest>> => {
  const response = await apiClient.put<ApiResponse<Contest>>(
    `/contests/${id}`,
    contestData
  );
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
