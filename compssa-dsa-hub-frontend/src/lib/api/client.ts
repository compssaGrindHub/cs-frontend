import axios from 'axios';

const NGROK_BASE = process.env.NEXT_PUBLIC_NGROK_BASE;
const FALLBACK_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => {
    if (typeof response.data === 'string' && response.data.trim().startsWith('<!DOCTYPE')) {
      const error = new Error('Received HTML response instead of JSON. This may be an ngrok warning page. Please visit the endpoint in your browser first.') as any;
      error.config = response.config;
      error.response = {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        headers: response.headers,
      };
      error.isAxiosError = true;
      return Promise.reject(error);
    }
    return response;
  },
  async (error) => {
    if (!error?.config) {
      return Promise.reject(error);
    }
    
    const originalRequest = error.config;

    if (error?.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const response = await axios.post(`${API_URL}/auth/refresh-token`, {
          refreshToken,
        });

        const apiResponse = response.data;
        let accessToken: string | null = null;
        if (apiResponse.success && apiResponse.data) {
          const { accessToken: newAccessToken, refreshToken: newRefreshToken } = apiResponse.data;
          accessToken = newAccessToken;
          localStorage.setItem('accessToken', newAccessToken);
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

    if (error?.response?.status === 403 && originalRequest && !originalRequest._retry) {
      const errorMessage = error?.response?.data?.error || '';
      if (errorMessage.includes('Admin or Instructor access required') || errorMessage.includes('Instructor access required')) {
        originalRequest._retry = true;

        try {
          const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
          if (!refreshToken) {
            throw new Error('No refresh token');
          }

          const response = await axios.post(`${API_URL}/auth/refresh-token`, {
            refreshToken,
          });

          const apiResponse = response.data;
          let accessToken: string | null = null;
          if (apiResponse.success && apiResponse.data) {
            const { accessToken: newAccessToken, refreshToken: newRefreshToken } = apiResponse.data;
            accessToken = newAccessToken;
            localStorage.setItem('accessToken', newAccessToken);
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
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
