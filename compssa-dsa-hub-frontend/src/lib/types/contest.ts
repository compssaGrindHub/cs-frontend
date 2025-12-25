import { Platform } from './problem';

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
  problems?: any[];
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
