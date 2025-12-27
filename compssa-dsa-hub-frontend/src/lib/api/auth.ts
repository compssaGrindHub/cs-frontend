import apiClient from './client';
import { ApiResponse } from '@/lib/types/api';
import { User } from '@/lib/types/user';

// Response types for auth endpoints
interface LoginResponse {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

interface RegisterResponse {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

// Request types
interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

interface ForgotPasswordRequest {
  email: string;
}

interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

/**
 * Login user with email and password
 * POST /api/auth/login
 */
export const login = async (credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
  const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', credentials);
  return response.data;
};

/**
 * Register a new user
 * POST /api/auth/register
 */
export const register = async (userData: RegisterRequest): Promise<ApiResponse<RegisterResponse>> => {
  const response = await apiClient.post<ApiResponse<RegisterResponse>>('/auth/register', userData);
  return response.data;
};

/**
 * Get current authenticated user
 * GET /api/auth/me
 */
export const getCurrentUser = async (): Promise<ApiResponse<User>> => {
  const response = await apiClient.get<ApiResponse<User>>('/auth/me');
  return response.data;
};

/**
 * Refresh access token using refresh token
 * POST /api/auth/refresh-token
 */
export const refreshToken = async (refreshToken: string): Promise<ApiResponse<RefreshTokenResponse>> => {
  const response = await apiClient.post<ApiResponse<RefreshTokenResponse>>('/auth/refresh-token', {
    refreshToken,
  });
  return response.data;
};

/**
 * Logout user (invalidates tokens on server)
 * POST /api/auth/logout
 */
export const logout = async (): Promise<ApiResponse<void>> => {
  const response = await apiClient.post<ApiResponse<void>>('/auth/logout');
  return response.data;
};

/**
 * Change user password
 * POST /api/auth/change-password
 */
export const changePassword = async (passwords: ChangePasswordRequest): Promise<ApiResponse<void>> => {
  const response = await apiClient.post<ApiResponse<void>>('/auth/change-password', passwords);
  return response.data;
};

/**
 * Request password reset email
 * POST /api/auth/forgot-password
 */
export const forgotPassword = async (email: string): Promise<ApiResponse<void>> => {
  const response = await apiClient.post<ApiResponse<void>>('/auth/forgot-password', { email });
  return response.data;
};

/**
 * Reset password with token from email
 * POST /api/auth/reset-password
 */
export const resetPassword = async (resetData: ResetPasswordRequest): Promise<ApiResponse<void>> => {
  const response = await apiClient.post<ApiResponse<void>>('/auth/reset-password', resetData);
  return response.data;
};

