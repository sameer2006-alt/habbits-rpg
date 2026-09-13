import type { StatName } from "../types/game";

export type WeeklyObjectiveType =
  | "quests_completed"
  | "xp_earned"
  | "coins_earned"
  | "bosses_defeated"
  | "perfect_days"
  | "stat_training";

export interface WeeklyObjective {
  id: string;
  type: WeeklyObjectiveType;
  description: string;
  targetValue: number;
  currentValue: number;
  completed: boolean;
  targetStat?: StatName;
}

export interface WeeklyObjectiveTemplate {
  id: string;
  type: WeeklyObjectiveType;
  description: string;
  targetValue: number;
  targetStat?: StatName;
}

export interface WeeklyChallengeTemplate {
  id: string;
  title: string;
  description: string;
  objectives: WeeklyObjectiveTemplate[];
  rewardXP: number;
  rewardCoins: number;
  rewardItemId?: string;
}

export interface WeeklyChallenge {
  id: string; // `wc_${userId}_${weekStart}`
  userId: string;
  weekStart: string; // YYYY-MM-DD (Monday)
  weekEnd: string; // YYYY-MM-DD (Sunday)
  templateId: string;
  title: string;
  description: string;
  objectives: WeeklyObjective[];
  currentProgress: number; // 0 - 100 percentage
  completed: boolean;
  rewardClaimed: boolean;
  rewardXP: number;
  rewardCoins: number;
  rewardItemId?: string;
  createdAt: string;
  completedAt?: string;
}

export type WeeklyChallengeUIState =
  | "active"
  | "in_progress"
  | "completed"
  | "expired"
  | "loading"
  | "error";

/**
 * Authoritative pool of balanced Weekly Challenge templates.
 * Designed to complement Daily Directives, Perfect Days, and Boss raids across 7 days.
 */
export const WEEKLY_CHALLENGE_TEMPLATES: WeeklyChallengeTemplate[] = [
  {
    id: "challenge_weekly_hunter",
    title: "Weekly Hunter's Vigil",
    description: "Establish total momentum across the week through quest mastery and dedicated progress.",
    objectives: [
      {
        id: "obj_hunter_quests",
        type: "quests_completed",
        description: "Complete 22 Quests",
        targetValue: 22,
      },
      {
        id: "obj_hunter_xp",
        type: "xp_earned",
        description: "Earn 1,800 XP",
        targetValue: 1800,
      },
    ],
    rewardXP: 750,
    rewardCoins: 220,
    rewardItemId: "arm_hunter_tunic",
  },
  {
    id: "challenge_boss_breaker",
    title: "Nemesis Vanguard",
    description: "Shatter a weekly raid boss and crush quests to safeguard hunter territory.",
    objectives: [
      {
        id: "obj_boss_quests",
        type: "quests_completed",
        description: "Complete 20 Quests",
        targetValue: 20,
      },
      {
        id: "obj_boss_defeated",
        type: "bosses_defeated",
        description: "Defeat 1 Boss",
        targetValue: 1,
      },
    ],
    rewardXP: 850,
    rewardCoins: 250,
    rewardItemId: "wpn_iron_broadsword",
  },
  {
    id: "challenge_perfect_week",
    title: "Crown of Consistency",
    description: "Demonstrate unwavering discipline by achieving multiple Perfect Days.",
    objectives: [
      {
        id: "obj_perf_quests",
        type: "quests_completed",
        description: "Complete 20 Quests",
        targetValue: 20,
      },
      {
        id: "obj_perf_days",
        type: "perfect_days",
        description: "Achieve 4 Perfect Days",
        targetValue: 4,
      },
    ],
    rewardXP: 900,
    rewardCoins: 300,
  },
  {
    id: "challenge_coin_tycoon",
    title: "Merchant's Syndicate",
    description: "Amass wealth and reputation through diligent contract execution and economic discipline.",
    objectives: [
      {
        id: "obj_tycoon_quests",
        type: "quests_completed",
        description: "Complete 18 Quests",
        targetValue: 18,
      },
      {
        id: "obj_tycoon_coins",
        type: "coins_earned",
        description: "Earn 450 Soul Coins",
        targetValue: 450,
      },
      {
        id: "obj_tycoon_xp",
        type: "xp_earned",
        description: "Earn 1,500 XP",
        targetValue: 1500,
      },
    ],
    rewardXP: 700,
    rewardCoins: 350,
    rewardItemId: "acc_silver_ring",
  },
  {
    id: "challenge_disciplined_mind",
    title: "Trial of Iron Focus",
    description: "Forge disciplined habits by engaging in focused mental and physical attribute development.",
    objectives: [
      {
        id: "obj_disc_quests",
        type: "quests_completed",
        description: "Complete 18 Quests",
        targetValue: 18,
      },
      {
        id: "obj_disc_stat",
        type: "stat_training",
        description: "Gain 10 Discipline Points",
        targetValue: 10,
        targetStat: "discipline",
      },
      {
        id: "obj_disc_perf",
        type: "perfect_days",
        description: "Achieve 3 Perfect Days",
        targetValue: 3,
      },
    ],
    rewardXP: 800,
    rewardCoins: 240,
  },
  {
    id: "challenge_apex_slayer",
    title: "Apex Paragon",
    description: "The ultimate weekly trial. Complete extensive missions, topple a boss, and reach peak consistency.",
    objectives: [
      {
        id: "obj_apex_quests",
        type: "quests_completed",
        description: "Complete 25 Quests",
        targetValue: 25,
      },
      {
        id: "obj_apex_xp",
        type: "xp_earned",
        description: "Earn 2,200 XP",
        targetValue: 2200,
      },
      {
        id: "obj_apex_boss",
        type: "bosses_defeated",
        description: "Defeat 1 Boss",
        targetValue: 1,
      },
      {
        id: "obj_apex_perf",
        type: "perfect_days",
        description: "Achieve 3 Perfect Days",
        targetValue: 3,
      },
    ],
    rewardXP: 1000,
    rewardCoins: 350,
    rewardItemId: "acc_hunters_talisman",
  },
];
