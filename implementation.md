# CompSSA DSA Hub - Frontend Setup & Implementation Guide

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: TailwindCSS + shadcn/ui
- **State Management**: Zustand (lightweight, better than Redux for this)
- **API Client**: Axios + React Query (TanStack Query)
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **HTTP Client**: Axios

---

## Project Structure

```
compssa-dsa-hub-frontend/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Auth layout group
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   ├── forgot-password/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/              # Main app layout group
│   │   │   ├── layout.tsx            # Sidebar + header layout
│   │   │   ├── page.tsx              # Dashboard home
│   │   │   ├── problems/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── contests/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── leaderboard/
│   │   │   │   └── page.tsx
│   │   │   ├── profile/
│   │   │   │   ├── page.tsx          # Own profile
│   │   │   │   └── [userId]/
│   │   │   │       └── page.tsx      # Other user profiles
│   │   │   └── settings/
│   │   │       └── page.tsx
│   │   ├── admin/                    # Admin pages
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/
│   │   │   ├── problems/
│   │   │   ├── contests/
│   │   │   ├── users/
│   │   │   └── analytics/
│   │   ├── layout.tsx                # Root layout
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                       # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown.tsx
│   │   │   ├── input.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   └── ... (other shadcn components)
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── MobileMenu.tsx
│   │   │   └── Footer.tsx
│   │   ├── dashboard/
│   │   │   ├── HeroStatsCard.tsx
│   │   │   ├── DailyChallenge.tsx
│   │   │   ├── UpcomingContests.tsx
│   │   │   ├── RecentActivity.tsx
│   │   │   ├── QuickStats.tsx
│   │   │   └── TopicProgress.tsx
│   │   ├── problems/
│   │   │   ├── ProblemCard.tsx
│   │   │   ├── ProblemList.tsx
│   │   │   ├── ProblemFilters.tsx
│   │   │   ├── DifficultyBadge.tsx
│   │   │   └── TopicTag.tsx
│   │   ├── contests/
│   │   │   ├── ContestCard.tsx
│   │   │   ├── ContestStandings.tsx
│   │   │   └── ContestTimer.tsx
│   │   ├── leaderboard/
│   │   │   ├── LeaderboardTable.tsx
│   │   │   └── RankBadge.tsx
│   │   ├── profile/
│   │   │   ├── ProfileHeader.tsx
│   │   │   ├── AchievementGrid.tsx
│   │   │   ├── ContributionGraph.tsx
│   │   │   ├── ContestHistory.tsx
│   │   │   ├── TopicBreakdown.tsx
│   │   │   └── RecentSubmissions.tsx
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── notifications/
│   │   │   ├── NotificationBell.tsx
│   │   │   └── NotificationItem.tsx
│   │   └── common/
│   │       ├── Loading.tsx
│   │       ├── ErrorBoundary.tsx
│   │       ├── EmptyState.tsx
│   │       └── Pagination.tsx
│   ├── lib/
│   │   ├── api/                      # API client setup
│   │   │   ├── client.ts             # Axios instance
│   │   │   ├── auth.ts               # Auth endpoints
│   │   │   ├── users.ts              # User endpoints
│   │   │   ├── problems.ts           # Problem endpoints
│   │   │   ├── contests.ts           # Contest endpoints
│   │   │   ├── submissions.ts        # Submission endpoints
│   │   │   ├── leaderboard.ts        # Leaderboard endpoints
│   │   │   ├── achievements.ts       # Achievement endpoints
│   │   │   └── notifications.ts      # Notification endpoints
│   │   ├── hooks/                    # Custom React hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useUser.ts
│   │   │   ├── useProblems.ts
│   │   │   ├── useContests.ts
│   │   │   ├── useLeaderboard.ts
│   │   │   └── useNotifications.ts
│   │   ├── stores/                   # Zustand stores
│   │   │   ├── authStore.ts
│   │   │   ├── userStore.ts
│   │   │   └── notificationStore.ts
│   │   ├── utils/
│   │   │   ├── cn.ts                 # Tailwind class merger
│   │   │   ├── formatters.ts         # Date, number formatters
│   │   │   ├── validators.ts         # Zod schemas
│   │   │   └── constants.ts          # App constants
│   │   └── types/
│   │       ├── auth.ts
│   │       ├── user.ts
│   │       ├── problem.ts
│   │       ├── contest.ts
│   │       ├── submission.ts
│   │       └── api.ts
│   └── middleware.ts                 # Next.js middleware for auth
├── public/
│   ├── images/
│   ├── icons/
│   └── logos/
├── .env.local
├── .env.example
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## Initial Setup Commands

Run these commands step by step:

```bash
# 1. Create Next.js project with TypeScript
npx create-next-app@latest compssa-dsa-hub-frontend

# During setup, select:
# ✅ TypeScript: Yes
# ✅ ESLint: Yes
# ✅ Tailwind CSS: Yes
# ✅ src/ directory: Yes
# ✅ App Router: Yes
# ✅ Import alias (@/*): Yes

cd compssa-dsa-hub-frontend

# 2. Install core dependencies
npm install axios @tanstack/react-query zustand
npm install react-hook-form @hookform/resolvers zod
npm install date-fns clsx tailwind-merge
npm install lucide-react recharts

# 3. Install shadcn/ui (follow prompts)
npx shadcn-ui@latest init

# During shadcn setup:
# Style: Default
# Base color: Slate
# CSS variables: Yes

# 4. Add shadcn components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add select
npx shadcn-ui@latest add table
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add skeleton
npx shadcn-ui@latest add progress
npx shadcn-ui@latest add checkbox
npx shadcn-ui@latest add radio-group
npx shadcn-ui@latest add switch
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add tooltip

# 5. Install dev dependencies
npm install -D @types/node @types/react @types/react-dom
npm install -D prettier eslint-config-prettier

# 6. Start development server
npm run dev
```

---

## Environment Variables

Create `.env.local`:

```env
# API
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_API_TIMEOUT=30000

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=CompSSA DSA Hub

# Features
NEXT_PUBLIC_ENABLE_GITHUB_INTEGRATION=true
NEXT_PUBLIC_ENABLE_CODEFORCES_INTEGRATION=true
```

---

## TypeScript Configuration

Update `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/app/*": ["./src/app/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

## Tailwind Configuration

Update `tailwind.config.ts`:

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
```

---

## Global Styles

Update `src/app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 48%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  @apply bg-muted;
}

::-webkit-scrollbar-thumb {
  @apply bg-muted-foreground/30 rounded;
}

::-webkit-scrollbar-thumb:hover {
  @apply bg-muted-foreground/50;
}
```

---

## API Client Setup

### Base Axios Instance

Create `src/lib/api/client.ts`:

```typescript
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retried, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const response = await axios.post(`${API_URL}/auth/refresh-token`, {
          refreshToken,
        });

        const { accessToken } = response.data;
        localStorage.setItem('accessToken', accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
```

---

## Type Definitions

Create `src/lib/types/user.ts`:

```typescript
export interface User {
  id: string;
  username: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'INSTRUCTOR';
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  codeforcesHandle?: string;
  leetcodeUsername?: string;
  githubUsername?: string;
  totalRating: number;
  globalRank?: number;
  currentStreak: number;
  longestStreak: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  totalProblems: number;
  solvedProblems: number;
  contestsParticipated: number;
  averageRank: number;
  topicBreakdown: TopicStats[];
  recentSubmissions: Submission[];
  ratingHistory: RatingPoint[];
}

export interface TopicStats {
  topic: string;
  solved: number;
  total: number;
  percentage: number;
  difficulty: {
    easy: number;
    medium: number;
    hard: number;
  };
}

export interface RatingPoint {
  date: string;
  rating: number;
  contest: string;
}
```

Create `src/lib/types/problem.ts`:

```typescript
export type Platform = 'LEETCODE' | 'CODEFORCES' | 'CUSTOM';
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface Problem {
  id: string;
  title: string;
  slug: string;
  description: string;
  platform: Platform;
  problemLink: string;
  difficulty: Difficulty;
  topics: string[];
  isDailyQuestion: boolean;
  dailyDate?: string;
  acceptanceRate?: number;
  totalSubmissions: number;
  createdAt: string;
  updatedAt: string;
  userStatus?: 'solved' | 'attempted' | 'unsolved';
}

export interface ProblemDetail extends Problem {
  examples?: Example[];
  constraints?: string[];
  hints?: string[];
}

export interface Example {
  input: string;
  output: string;
  explanation?: string;
}
```

Create `src/lib/types/contest.ts`:

```typescript
export type ContestStatus = 'UPCOMING' | 'LIVE' | 'COMPLETED';

export interface Contest {
  id: string;
  name: string;
  platform: Platform;
  externalId?: string;
  startTime: string;
  duration: number;
  isRated: boolean;
  status: ContestStatus;
  participantCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ContestDetail extends Contest {
  problems?: Problem[];
  userParticipation?: ContestParticipation;
}

export interface ContestParticipation {
  id: string;
  userId: string;
  contestId: string;
  rank: number;
  ratingChange: number;
  problemsSolved: number;
  totalPoints: number;
  createdAt: string;
}

export interface Standing {
  rank: number;
  user: {
    id: string;
    username: string;
    profilePicture?: string;
  };
  problemsSolved: number;
  totalPoints: number;
  ratingChange: number;
}
```

---

## Authentication Store

Create `src/lib/stores/authStore.ts`:

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/lib/types/user';

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
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      setAuth: (user, accessToken, refreshToken) => {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        set({ user, accessToken, refreshToken, isAuthenticated: true });
      },
      setUser: (user) => set({ user }),
      logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
```

---

## React Query Setup

Create `src/lib/providers/QueryProvider.tsx`:

```typescript
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

---

## Root Layout

Update `src/app/layout.tsx`:

```typescript
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/lib/providers/QueryProvider';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CompSSA DSA Hub',
  description: 'Data Structures & Algorithms learning platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <QueryProvider>
          {children}
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  );
}
```

---

## Utility Functions

Create `src/lib/utils/cn.ts`:

```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

Create `src/lib/utils/formatters.ts`:

```typescript
import { format, formatDistanceToNow } from 'date-fns';

export function formatDate(date: string | Date): string {
  return format(new Date(date), 'MMM dd, yyyy');
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), 'MMM dd, yyyy HH:mm');
}

export function formatRelativeTime(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat().format(num);
}

export function formatPercentage(value: number, total: number): string {
  if (total === 0) return '0%';
  return `${Math.round((value / total) * 100)}%`;
}
```

---

## Next Steps

Once you have the basic setup, you'll provide design screenshots and we'll implement:

1. **Authentication Pages** (Login, Register, Forgot Password)
2. **Dashboard Layout** (Sidebar + Header)
3. **Dashboard Home** (Hero stats, daily question, contests, activity)
4. **Problems Page** (List, filters, cards)
5. **Contests Page** (List, standings)
6. **Leaderboard Page** (Rankings table)
7. **Profile Page** (Stats, achievements, contribution graph)
8. **Settings Page** (Profile edit, GitHub connect)
9. **Admin Dashboard** (Stats, management)

For each page, provide the design screenshot and I'll help Cursor generate the exact components matching the design.

---

## Ready for Implementation?

Run the setup commands above, and once everything is installed and running, start providing design screenshots. We'll build each page component by component, matching your designs exactly.