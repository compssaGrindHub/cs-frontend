import apiClient from './client';
import { ApiResponse } from '@/lib/types/api';
import { User, UserStats, UserProgress, UserActivity } from '@/lib/types/user';

// Request types
interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  codeforcesHandle?: string;
  leetcodeUsername?: string;
  githubUsername?: string;
  githubRepo?: string;
}

interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'rating' | 'rank' | 'streak' | 'createdAt';
  order?: 'asc' | 'desc';
}

interface PaginatedUsersResponse {
  data: User[];
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
 * Get all users with pagination and filters
 * GET /api/users
 */
export const getUsers = async (params?: GetUsersParams): Promise<PaginatedUsersResponse> => {
  const response = await apiClient.get<ApiResponse<PaginatedUsersResponse>>('/users', { params });
  return response.data as PaginatedUsersResponse;
};

/**
 * Get user by ID
 * GET /api/users/:id
 */
export const getUserById = async (id: string): Promise<ApiResponse<User>> => {
  const response = await apiClient.get<ApiResponse<User>>(`/users/${id}`);
  return response.data;
};

/**
 * Update user profile
 * PUT /api/users/:id
 */
export const updateUser = async (id: string, userData: UpdateUserRequest): Promise<ApiResponse<User>> => {
  const response = await apiClient.put<ApiResponse<User>>(`/users/${id}`, userData);
  return response.data;
};

/**
 * Delete user (admin only)
 * DELETE /api/users/:id
 */
export const deleteUser = async (id: string): Promise<void> => {
  await apiClient.delete<ApiResponse<void>>(`/users/${id}`);
};

/**
 * Get user statistics
 * GET /api/users/:id/stats
 */
export const getUserStats = async (id: string): Promise<UserStats> => {
  const response = await apiClient.get<ApiResponse<UserStats>>(`/users/${id}/stats`);
  return response.data.data;
};

/**
 * Get user progress
 * GET /api/users/:id/progress
 */
export const getUserProgress = async (id: string): Promise<UserProgress> => {
  const response = await apiClient.get<ApiResponse<UserProgress>>(`/users/${id}/progress`);
  return response.data.data;
};

/**
 * Get user activity
 * GET /api/users/:id/activity
 */
export const getUserActivity = async (id: string, limit?: number): Promise<UserActivity[]> => {
  const response = await apiClient.get<ApiResponse<UserActivity[]>>(`/users/${id}/activity`, {
    params: { limit },
  });
  return response.data.data;
};

