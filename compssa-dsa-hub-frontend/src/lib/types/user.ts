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

export interface Submission {
  id: string;
  problemId: string;
  problemTitle: string;
  status: string;
  language: string;
  createdAt: string;
}
