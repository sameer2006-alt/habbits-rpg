import type { PlayerStats } from "../types/game";

export interface PowerScoreCalculationParams {
  level: number;
  rankTierOrder: number;
  effectiveStats: PlayerStats;
  totalQuestsCompleted: number;
  bestStreak: number;
  bossesSlain: number;
  achievementsUnlocked: number;
}

/**
 * Authoritative, dynamic Power Score derivation.
 * Formula:
 * - Level: 100 pts per Level
 * - Rank: 500 pts per Rank Tier Order (0 to 9)
 * - Effective Stats: 10 pts per Stat point (including equipped gear bonuses)
 * - Quests: 15 pts per Completed Quest
 * - Best Streak: 25 pts per Best Streak Day
 * - Bosses Slain: 150 pts per Slayed Boss
 * - Achievements: 50 pts per Unlocked Achievement
 *
 * Guarantees:
 * - 100% deterministic (same state -> same score).
 * - Dynamically derived; never an arbitrary mutable column.
 */
export function calculatePowerScore(params: PowerScoreCalculationParams): number {
  const {
    level,
    rankTierOrder,
    effectiveStats,
    totalQuestsCompleted,
    bestStreak,
    bossesSlain,
    achievementsUnlocked,
  } = params;

  const statValues = [
    effectiveStats.strength || 0,
    effectiveStats.intelligence || 0,
    effectiveStats.vitality || 0,
    effectiveStats.focus || 0,
    effectiveStats.discipline || 0,
    effectiveStats.consistency || 0,
  ];
  const statsSum = statValues.reduce((sum, val) => sum + val, 0);

  const score =
    Math.max(1, level) * 100 +
    Math.max(0, rankTierOrder) * 500 +
    statsSum * 10 +
    Math.max(0, totalQuestsCompleted) * 15 +
    Math.max(0, bestStreak) * 25 +
    Math.max(0, bossesSlain) * 150 +
    Math.max(0, achievementsUnlocked) * 50;

  return Math.round(score);
}

