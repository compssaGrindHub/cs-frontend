export const APP_NAME = 'CompSSA DSA Hub';
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const DIFFICULTY_COLORS = {
  EASY: 'text-green-500',
  MEDIUM: 'text-yellow-500',
  HARD: 'text-red-500',
} as const;

export const PLATFORM_NAMES = {
  LEETCODE: 'LeetCode',
  CODEFORCES: 'Codeforces',
  CUSTOM: 'Custom',
} as const;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  PROBLEMS: '/problems',
  CONTESTS: '/contests',
  LEADERBOARD: '/leaderboard',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  ADMIN: '/admin',
} as const;
