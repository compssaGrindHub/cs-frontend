import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/lib/types/user';
import { logout as logoutApi } from '@/lib/api/auth';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  logout: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  syncAuthState: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null,
      refreshToken: typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null,
      isAuthenticated: false,
      isLoading: false,
      setAuth: (user, accessToken, refreshToken) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
        }
        set({ user, accessToken, refreshToken, isAuthenticated: true, isLoading: false });
      },
      setUser: (user) => set({ user }),
      setLoading: (loading) => set({ isLoading: loading }),
      syncAuthState: () => {
        // Sync authentication state with localStorage tokens
        if (typeof window !== 'undefined') {
          const accessToken = localStorage.getItem('accessToken');
          const refreshToken = localStorage.getItem('refreshToken');
          const state = get();
          
          // If we have tokens and user, ensure isAuthenticated is true
          if (accessToken && refreshToken && state.user) {
            set({ 
              accessToken, 
              refreshToken, 
              isAuthenticated: true 
            });
          } else if (!accessToken || !refreshToken) {
            // If tokens are missing, clear auth state
            set({ 
              user: null, 
              isAuthenticated: false, 
              accessToken: null, 
              refreshToken: null 
            });
          }
        }
      },
      logout: async () => {
        try {
          // Call logout API to invalidate tokens on server
          // Only if we have a token (user was actually logged in via API)
          const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
          if (token) {
            await logoutApi();
          }
        } catch (error) {
          // Even if logout API fails, clear local state
          console.error('Logout API call failed:', error);
        } finally {
          // Always clear local storage and state
          if (typeof window !== 'undefined') {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
          }
          set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false, isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated,
        // Note: tokens are stored separately in localStorage for security
        // We don't persist them through Zustand persist to avoid duplication
      }),
    }
  )
);
