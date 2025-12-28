import apiClient from './client';
import { ApiResponse } from '@/lib/types/api';

// Types
export type SessionType = 'LECTURE' | 'PRACTICE' | 'CONTEST' | 'WORKSHOP' | 'OTHER';

export interface Session {
  id: string;
  name: string;
  type: SessionType;
  date: string;
  startTime: string;
  endTime: string;
  instructor?: string | null;
  description?: string | null;
  location?: string | null;
  capacity?: number | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  attendances?: Array<{
    userId: string;
    present: boolean;
  }>;
}

export interface SessionDetail extends Session {
  attendances: Array<{
    id: string;
    userId: string;
    sessionId: string;
    present: boolean;
    createdAt: string;
    user: {
      id: string;
      username: string;
      profilePicture?: string | null;
    };
  }>;
}

// Request types
interface CreateSessionRequest {
  name: string;
  type: SessionType;
  date: string;
  startTime: string;
  endTime: string;
  instructor?: string;
  description?: string;
  location?: string;
  capacity?: number;
}

interface UpdateSessionRequest {
  name?: string;
  type?: SessionType;
  date?: string;
  startTime?: string;
  endTime?: string;
  instructor?: string;
  description?: string;
  location?: string;
  capacity?: number;
}

interface GetSessionsParams {
  page?: number;
  limit?: number;
  type?: SessionType;
  date?: string; // YYYY-MM-DD
  upcoming?: boolean;
}

interface PaginatedSessionsResponse {
  data: Session[];
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
 * Get all sessions with filters
 * GET /api/sessions
 */
export const getSessions = async (params?: GetSessionsParams): Promise<PaginatedSessionsResponse> => {
  const response = await apiClient.get<ApiResponse<PaginatedSessionsResponse>>('/sessions', { params });
  return response.data as PaginatedSessionsResponse;
};

/**
 * Get session by ID
 * GET /api/sessions/:id
 */
export const getSessionById = async (id: string): Promise<SessionDetail> => {
  const response = await apiClient.get<ApiResponse<SessionDetail>>(`/sessions/${id}`);
  return response.data.data;
};

/**
 * Get session stats
 * GET /api/sessions/:id/stats
 */
export const getSessionStats = async (id: string): Promise<ApiResponse<any>> => {
  const response = await apiClient.get<ApiResponse<any>>(`/sessions/${id}/stats`);
  return response.data;
};

/**
 * Create session (admin only)
 * POST /api/sessions
 */
export const createSession = async (sessionData: CreateSessionRequest): Promise<ApiResponse<Session>> => {
  const response = await apiClient.post<ApiResponse<Session>>('/sessions', sessionData);
  return response.data;
};

/**
 * Update session (admin only)
 * PUT /api/sessions/:id
 */
export const updateSession = async (id: string, sessionData: UpdateSessionRequest): Promise<ApiResponse<Session>> => {
  const response = await apiClient.put<ApiResponse<Session>>(`/sessions/${id}`, sessionData);
  return response.data;
};

/**
 * Delete session (admin only)
 * DELETE /api/sessions/:id
 */
export const deleteSession = async (id: string): Promise<ApiResponse<void>> => {
  const response = await apiClient.delete<ApiResponse<void>>(`/sessions/${id}`);
  return response.data;
};

