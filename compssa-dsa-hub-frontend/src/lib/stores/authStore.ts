import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/lib/types/user';

// Dev mode mock user for testing
const devMockUser: User = {
  id: 'dev-admin-001',
  username: 'admin',
  email: 'admin@compssa.com',
  role: 'ADMIN',
  firstName: 'Admin',
  lastName: 'User',
  profilePicture: '',
  totalRating: 2450,
  globalRank: 1,
  currentStreak: 15,
  longestStreak: 42,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: process.env.NEXT_PUBLIC_DEV_MODE === 'true' ? devMockUser : null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: process.env.NEXT_PUBLIC_DEV_MODE === 'true',
      setAuth: (user, accessToken, refreshToken) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
        }
        set({ user, accessToken, refreshToken, isAuthenticated: true });
      },
      setUser: (user) => set({ user }),
      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
