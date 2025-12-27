import apiClient from './client';
import { ApiResponse } from '@/lib/types/api';

// Request types
interface ConnectGitHubRequest {
  token: string; // GitHub Personal Access Token
  repo?: string; // Optional, default: cs-hub-solutions
}

interface ConnectGitHubResponse {
  repo: string; // Full repo name: owner/repo
  owner: string;
}

/**
 * Connect GitHub account
 * POST /api/github/connect
 */
export const connectGitHub = async (data: ConnectGitHubRequest): Promise<ApiResponse<ConnectGitHubResponse>> => {
  const response = await apiClient.post<ApiResponse<ConnectGitHubResponse>>('/github/connect', data);
  return response.data;
};

