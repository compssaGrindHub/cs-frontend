import apiClient from './client';
import { ApiResponse } from '@/lib/types/api';
import { Problem, ProblemDetail } from '@/lib/types/problem';

// Request types
interface CreateProblemRequest {
  title: string;
  slug: string;
  description: string;
  platform: 'LEETCODE' | 'CODEFORCES' | 'CUSTOM';
  problemLink: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  topics: string[];
  acceptanceRate?: number;
}

interface UpdateProblemRequest {
  title?: string;
  slug?: string;
  description?: string;
  platform?: 'LEETCODE' | 'CODEFORCES' | 'CUSTOM';
  problemLink?: string;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  topics?: string[];
  acceptanceRate?: number;
}

interface BulkImportRequest {
  problems: Array<{
    title: string;
    description: string;
    platform: 'LEETCODE' | 'CODEFORCES' | 'CUSTOM';
    problemLink: string;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    topics: string[];
  }>;
}

interface GetProblemsParams {
  page?: number;
  limit?: number;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  topics?: string;
  platform?: 'LEETCODE' | 'CODEFORCES' | 'CUSTOM';
  status?: 'solved' | 'attempted' | 'unsolved';
  search?: string;
  sortBy?: 'difficulty' | 'title' | 'acceptanceRate';
}

interface PaginatedProblemsResponse {
  data: Problem[];
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
 * Get all problems with filters
 * GET /api/problems
 */
export const getProblems = async (params?: GetProblemsParams): Promise<PaginatedProblemsResponse> => {
  const response = await apiClient.get<ApiResponse<PaginatedProblemsResponse>>('/problems', { params });
  return response.data as PaginatedProblemsResponse;
};

/**
 * Get daily question
 * GET /api/problems/daily/current
 */
export const getDailyQuestion = async (): Promise<ApiResponse<Problem | null>> => {
  const response = await apiClient.get<ApiResponse<Problem | null>>('/problems/daily/current');
  return response.data;
};

/**
 * Get problem by slug
 * GET /api/problems/slug/:slug
 */
export const getProblemBySlug = async (slug: string): Promise<ApiResponse<ProblemDetail>> => {
  const response = await apiClient.get<ApiResponse<ProblemDetail>>(`/problems/slug/${slug}`);
  return response.data;
};

/**
 * Get problem by ID
 * GET /api/problems/:id
 */
export const getProblemById = async (id: string): Promise<ApiResponse<ProblemDetail>> => {
  const response = await apiClient.get<ApiResponse<ProblemDetail>>(`/problems/${id}`);
  return response.data;
};

/**
 * Get problem submissions
 * GET /api/problems/:id/submissions
 */
export const getProblemSubmissions = async (id: string): Promise<ApiResponse<any[]>> => {
  const response = await apiClient.get<ApiResponse<any[]>>(`/problems/${id}/submissions`);
  return response.data;
};

/**
 * Get problem stats
 * GET /api/problems/:id/stats
 */
export const getProblemStats = async (id: string): Promise<ApiResponse<any>> => {
  const response = await apiClient.get<ApiResponse<any>>(`/problems/${id}/stats`);
  return response.data;
};

/**
 * Create problem (admin only)
 * POST /api/problems
 */
export const createProblem = async (problemData: CreateProblemRequest): Promise<ApiResponse<Problem>> => {
  const response = await apiClient.post<ApiResponse<Problem>>('/problems', problemData);
  return response.data;
};

/**
 * Bulk import problems (admin only)
 * POST /api/problems/bulk-import
 */
export const bulkImportProblems = async (data: BulkImportRequest): Promise<ApiResponse<any>> => {
  const response = await apiClient.post<ApiResponse<any>>('/problems/bulk-import', data);
  return response.data;
};

/**
 * Update problem (admin only)
 * PUT /api/problems/:id
 */
export const updateProblem = async (id: string, problemData: UpdateProblemRequest): Promise<ApiResponse<Problem>> => {
  const response = await apiClient.put<ApiResponse<Problem>>(`/problems/${id}`, problemData);
  return response.data;
};

/**
 * Delete problem (admin only)
 * DELETE /api/problems/:id
 */
export const deleteProblem = async (id: string): Promise<ApiResponse<void>> => {
  const response = await apiClient.delete<ApiResponse<void>>(`/problems/${id}`);
  return response.data;
};

