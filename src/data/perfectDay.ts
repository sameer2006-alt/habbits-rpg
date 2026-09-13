export interface PerfectDayRecord {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  earned: boolean;
  rewardClaimed: boolean;
  rewardXP: number;
  rewardCoins: number;
  createdAt: string;
  earnedAt?: string;
}

export type PerfectDayUIState =
  | "not_started"
  | "in_progress"
  | "achieved"
  | "missed";

export interface PerfectDayEvaluation {
  eligible: boolean;
  reason: string;
  missingRequirements: string[];
}

/**
 * Authoritative Perfect Day Reward Economy:
 * - 150 XP (bonus milestone exceeding ordinary daily directive)
 * - 30 Coins (valuable bonus without inflating shop economy)
 */
export const PERFECT_DAY_REWARDS = {
  xp: 150,
  coins: 30,
} as const;

