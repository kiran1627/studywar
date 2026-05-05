export interface DayBlockProgress {
  learning: boolean;
  practice: boolean;
  build: boolean;
}

export interface InstituteProgress {
  currentDay: number;
  xp: number;
  unlockedModules: string[];
  completedDays: Record<string, number[]>;
  dayProgress: Record<string, DayBlockProgress>;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  picture?: string;
  score: number;
  streak: number;
  lastActiveDate: string | null;
  xp: number;
  level: number;
  role: 'user' | 'admin';
  createdAt: string;
}
