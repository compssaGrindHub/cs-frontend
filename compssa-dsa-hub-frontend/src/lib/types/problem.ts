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
