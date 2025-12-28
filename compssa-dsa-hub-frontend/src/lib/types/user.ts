export interface User {
  id: string;
  username: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'INSTRUCTOR';
  firstName?: string | null;
  lastName?: string | null;
  profilePicture?: string | null;
  codeforcesHandle?: string | null;
  leetcodeUsername?: string | null;
  githubUsername?: string | null;
  githubRepo?: string | null;
  totalRating: number;
  globalRank?: number | null;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  totalProblems: number;
  solvedProblems: number;
  contestsParticipated: number;
  averageRank: number | null;
  totalMinutesSpent: number;
  topicBreakdown: Array<{
    topic: string;
    count: number;
  }>;
  recentSubmissions: Array<{
    id: string;
    problemTitle: string;
    status: string;
    language: string;
    submissionTime: string;
  }>;
  ratingHistory: Array<{
    contestName: string;
    date: string;
    ratingChange: number;
    newRating: number;
  }>;
}

export interface UserProgress {
  topics: Array<{
    name: string;
    solved: number;
    total: number;
    percentage: number;
    difficulty: {
      easy: number;
      medium: number;
      hard: number;
    };
  }>;
}

export interface UserActivity {
  type: string;
  date: string;
  description: string;
  metadata?: any;
}
