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
}
