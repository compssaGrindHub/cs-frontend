import axios from 'axios';

// Use NGROK_BASE from env.local, fallback to NEXT_PUBLIC_API_URL or localhost
// NGROK_BASE should include the full URL with /api prefix
const NGROK_BASE = process.env.NEXT_PUBLIC_NGROK_BASE;
const FALLBACK_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Construct API URL: if NGROK_BASE exists, append /api, otherwise use fallback
const API_URL = NGROK_BASE 
  ? `${NGROK_BASE}/api` 
  : FALLBACK_API_URL;

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Log request for debugging (remove in production)
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
        hasToken: !!token,
        baseURL: config.baseURL,
      });
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => {
    // Log successful response for debugging (remove in production)
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        success: response.data?.success,
      });
    }
    return response;
  },
  async (error) => {
    // Log error for debugging (only in development, and only if error response exists)
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development' && error.response) {
      const method = error.config?.method?.toUpperCase() || 'UNKNOWN';
      const url = error.config?.url || '';
      const status = error.response?.status;
      const errorMessage = error.response?.data?.error || error.message;
      
      if (status && url) {
        console.error(`[API Error] ${method} ${url} - ${status}: ${errorMessage || 'Unknown error'}`);
      }
    }
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        // Use direct axios call to avoid interceptor loop
        const response = await axios.post(`${API_URL}/auth/refresh-token`, {
          refreshToken,
        });

        // Handle response structure: { success: true, data: { accessToken, refreshToken } }
        const apiResponse = response.data;
        let accessToken: string | null = null;
        if (apiResponse.success && apiResponse.data) {
          const { accessToken: newAccessToken, refreshToken: newRefreshToken } = apiResponse.data;
          accessToken = newAccessToken;
          localStorage.setItem('accessToken', newAccessToken);
          // Update refresh token if provided
          if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken);
          }
        } else {
          throw new Error('Invalid refresh token response');
        }

        if (accessToken) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
