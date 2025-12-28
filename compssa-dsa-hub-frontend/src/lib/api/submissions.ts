import apiClient from './client';
import { ApiResponse } from '@/lib/types/api';

// Types
export type SubmissionStatus = 
  | 'ACCEPTED' 
  | 'WRONG_ANSWER' 
  | 'TIME_LIMIT_EXCEEDED' 
  | 'RUNTIME_ERROR' 
  | 'COMPILATION_ERROR';

export interface Submission {
  id: string;
  userId: string;
  problemId: string;
  status: SubmissionStatus;
  language: string;
  code: string;
  submissionTime: string;
  githubPushed: boolean;
  githubUrl?: string | null;
  createdAt: string;
  problem?: {
    id: string;
    title: string;
    slug: string;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    platform: 'LEETCODE' | 'CODEFORCES' | 'CUSTOM';
  };
  user?: {
    id: string;
    username: string;
    profilePicture?: string | null;
  };
}

// Request types
interface CreateSubmissionRequest {
  problemId: string;
  status: SubmissionStatus;
  language: string;
  code: string;
  submissionTime?: string;
}

interface CreateSubmissionFromExtensionRequest {
  problemTitle: string;
  problemLink: string;
  platform: 'LEETCODE' | 'CODEFORCES';
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  topics?: string[];
  status: SubmissionStatus;
  language: string;
  code: string;
  submissionTime: string;
}

interface UpdateSubmissionRequest {
  status?: SubmissionStatus;
  language?: string;
  code?: string;
}

interface GetUserSubmissionsParams {
  page?: number;
  limit?: number;
  status?: SubmissionStatus;
  problemId?: string;
}

interface PaginatedSubmissionsResponse {
  data: Submission[];
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
 * Create submission
 * POST /api/submissions
 */
export const createSubmission = async (submissionData: CreateSubmissionRequest): Promise<ApiResponse<Submission>> => {
  const response = await apiClient.post<ApiResponse<Submission>>('/submissions', submissionData);
  return response.data;
};

/**
 * Create submission from extension
 * POST /api/submissions/from-extension
 */
export const createSubmissionFromExtension = async (
  submissionData: CreateSubmissionFromExtensionRequest
): Promise<ApiResponse<any>> => {
  const response = await apiClient.post<ApiResponse<any>>('/submissions/from-extension', submissionData);
  return response.data;
};

/**
 * Get user submissions
 * GET /api/submissions/user/:userId
 */
export const getUserSubmissions = async (
  userId: string,
  params?: GetUserSubmissionsParams
): Promise<PaginatedSubmissionsResponse> => {
  const response = await apiClient.get(`/submissions/user/${userId}`, {
    params,
  });
  // Backend returns { success: true, data: [], meta: {} } directly (not wrapped in ApiResponse)
  // response.data is { success: true, data: [], meta: {} }
  return {
    data: (response.data as any).data || [],
    meta: (response.data as any).meta || {
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
      hasNextPage: false,
      hasPrevPage: false,
    },
  };
};

/**
 * Get problem submissions
 * GET /api/submissions/problem/:problemId
 */
export const getProblemSubmissions = async (problemId: string, limit?: number): Promise<ApiResponse<Submission[]>> => {
  const response = await apiClient.get<ApiResponse<Submission[]>>(`/submissions/problem/${problemId}`, {
    params: { limit },
  });
  return response.data;
};

/**
 * Get submission by ID
 * GET /api/submissions/:id
 */
export const getSubmissionById = async (id: string): Promise<ApiResponse<Submission>> => {
  const response = await apiClient.get<ApiResponse<Submission>>(`/submissions/${id}`);
  return response.data;
};

/**
 * Update submission
 * PUT /api/submissions/:id
 */
export const updateSubmission = async (
  id: string,
  submissionData: UpdateSubmissionRequest
): Promise<ApiResponse<Submission>> => {
  const response = await apiClient.put<ApiResponse<Submission>>(`/submissions/${id}`, submissionData);
  return response.data;
};

/**
 * Delete submission
 * DELETE /api/submissions/:id
 */
export const deleteSubmission = async (id: string): Promise<ApiResponse<void>> => {
  const response = await apiClient.delete<ApiResponse<void>>(`/submissions/${id}`);
  return response.data;
};

/**
 * Push submission to GitHub
 * POST /api/submissions/:id/push-github
 */
export const pushSubmissionToGitHub = async (id: string): Promise<ApiResponse<{ commitUrl: string }>> => {
  const response = await apiClient.post<ApiResponse<{ commitUrl: string }>>(`/submissions/${id}/push-github`);
  return response.data;
};

