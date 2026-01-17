export const APP_NAME = "CompSSA DSA Hub";

// Use NGROK_BASE from env.local, fallback to NEXT_PUBLIC_API_URL or localhost
// NGROK_BASE should include the full URL, we append /api
const NGROK_BASE = process.env.NEXT_PUBLIC_NGROK_BASE;
const FALLBACK_API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Construct API URL: if NGROK_BASE exists, append /api, otherwise use fallback
export const API_URL = NGROK_BASE ? `${NGROK_BASE}/api` : FALLBACK_API_URL;

export const DIFFICULTY_COLORS = {
  EASY: "text-green-500",
  MEDIUM: "text-yellow-500",
  HARD: "text-red-500",
} as const;

export const PLATFORM_NAMES = {
  LEETCODE: "LeetCode",
  CODEFORCES: "Codeforces",
  CUSTOM: "Custom",
} as const;

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  PROBLEMS: "/problems",
  CONTESTS: "/contests",
  LEADERBOARD: "/leaderboard",
  PROFILE: "/profile",
  SETTINGS: "/settings",
  ADMIN: "/admin",
} as const;
