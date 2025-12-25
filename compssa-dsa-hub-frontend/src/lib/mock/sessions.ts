export type SessionType = 'LECTURE' | 'PRACTICE' | 'CONTEST' | 'WORKSHOP' | 'OTHER';

export type Session = {
  id: string;
  name: string;
  type: SessionType;
  date: string; // ISO date
  startTime: string; // ISO datetime
  endTime: string; // ISO datetime
  instructor?: string;
  description?: string;
  location?: string;
  capacity?: number;
};

export const mockSessions: Session[] = [
  {
    id: 'sess-1',
    name: 'Graph Theory Workshop',
    type: 'WORKSHOP',
    date: '2026-01-15',
    startTime: '2026-01-15T15:00:00Z',
    endTime: '2026-01-15T17:00:00Z',
    instructor: 'Dr. Ada Lovelace',
    description: 'Hands-on practice on shortest paths, MSTs, and graph modeling.',
    location: 'Room 2A',
    capacity: 60,
  },
  {
    id: 'sess-2',
    name: 'Dynamic Programming Marathon',
    type: 'PRACTICE',
    date: '2026-01-18',
    startTime: '2026-01-18T14:00:00Z',
    endTime: '2026-01-18T18:00:00Z',
    instructor: 'Grace Hopper',
    description: 'Four-hour practice session covering classic DP patterns.',
    location: 'Online',
    capacity: 120,
  },
  {
    id: 'sess-3',
    name: 'Weekly Contest #07',
    type: 'CONTEST',
    date: '2026-01-20',
    startTime: '2026-01-20T19:00:00Z',
    endTime: '2026-01-20T21:00:00Z',
    instructor: 'Contest Team',
    description: 'Rated weekly contest. Bring your A-game.',
    location: 'Online',
    capacity: 300,
  },
  {
    id: 'sess-4',
    name: 'Arrays & Hashing Lecture',
    type: 'LECTURE',
    date: '2026-01-10',
    startTime: '2026-01-10T16:00:00Z',
    endTime: '2026-01-10T17:30:00Z',
    instructor: 'Alan Turing',
    description: 'Foundation lecture on arrays, hashing, and time-space tradeoffs.',
    location: 'Room 1C',
    capacity: 80,
  },
  {
    id: 'sess-5',
    name: 'Editorial Review & Q&A',
    type: 'OTHER',
    date: '2026-01-23',
    startTime: '2026-01-23T18:00:00Z',
    endTime: '2026-01-23T19:30:00Z',
    instructor: 'Editorial Team',
    description: 'Deep dive into contest editorials with Q&A.',
    location: 'Room 3B',
    capacity: 50,
  },
];

export const getSessionById = (id: string) => mockSessions.find((s) => s.id === id);
