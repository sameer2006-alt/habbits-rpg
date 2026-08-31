export type StatName =
  | "strength"
  | "intelligence"
  | "vitality"
  | "focus"
  | "discipline"
  | "consistency";


export interface PlayerProfile {
  id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}


export interface PlayerStats {
  strength: number;
  intelligence: number;
  vitality: number;
  focus: number;
  discipline: number;
  consistency: number;
}


export interface PlayerProgress {
  level: number;
  totalXP: number;
  coins: number;
  currentStreak: number;
  bestStreak: number;
  rank: string;
}


export interface Quest {
  id: string;

  title: string;
  description: string;
  category: string;

  xpReward: number;
  coinReward: number;

  statReward: {
    stat: StatName;
    amount: number;
  };

  completed: boolean;
}


export interface QuestCompletion {
  id: string;
  questId: string;
  completedAt: string;

  xpEarned: number;
  coinsEarned: number;
}


export interface Achievement {
  id: string;
  title: string;
  description: string;

  unlocked: boolean;
  unlockedAt?: string;
}


export interface Reward {
  id: string;
  title: string;
  description: string;

  cost: number;
  type: string;
}


export interface Player {
  profile: PlayerProfile;
  stats: PlayerStats;
  progress: PlayerProgress;
}