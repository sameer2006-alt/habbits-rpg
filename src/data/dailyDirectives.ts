import type { StatName } from "../types/game";

export type DailyDirectiveRequirementType =
  | "any_quests"
  | "stat_quest"
  | "streak_quests";

export interface DailyDirectiveTemplate {
  id: string;
  title: string;
  description: string;
  requirementType: DailyDirectiveRequirementType;
  targetValue: number;
  targetStat?: StatName;
  rewardXP: number;
  rewardCoins: number;
  rewardStat?: StatName;
  rewardStatAmount?: number;
}

export interface DailyDirective {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  templateId: string;
  title: string;
  description: string;
  requirementType: DailyDirectiveRequirementType;
  targetValue: number;
  targetStat?: StatName;
  currentValue: number;
  completed: boolean;
  rewardClaimed: boolean;
  rewardXP: number;
  rewardCoins: number;
  rewardStat?: StatName;
  rewardStatAmount?: number;
  createdAt: string;
  completedAt?: string;
}

/**
 * Authoritative pool of Daily Directive templates.
 * Balanced economy rewards:
 * - XP: 60 - 100 XP (approximates 1 medium quest)
 * - Coins: 15 - 30 Coins
 * - Optional Stat: +1 to a core attribute
 */
export const DAILY_DIRECTIVE_TEMPLATES: DailyDirectiveTemplate[] = [
  {
    id: "directive_daily_3",
    title: "Trial of Momentum",
    description: "Complete 3 quests today to sustain your hunter rhythm.",
    requirementType: "any_quests",
    targetValue: 3,
    rewardXP: 75,
    rewardCoins: 20,
    rewardStat: "consistency",
    rewardStatAmount: 1,
  },
  {
    id: "directive_daily_5",
    title: "Apex Daily Routine",
    description: "Conquer 5 quests today to prove supreme dedication.",
    requirementType: "any_quests",
    targetValue: 5,
    rewardXP: 100,
    rewardCoins: 30,
    rewardStat: "discipline",
    rewardStatAmount: 1,
  },
  {
    id: "directive_focus",
    title: "Cognitive Calibration",
    description: "Complete at least 1 quest that develops your Focus.",
    requirementType: "stat_quest",
    targetValue: 1,
    targetStat: "focus",
    rewardXP: 60,
    rewardCoins: 15,
    rewardStat: "focus",
    rewardStatAmount: 1,
  },
  {
    id: "directive_discipline",
    title: "Iron Will Conditioning",
    description: "Complete at least 1 quest that trains your Discipline.",
    requirementType: "stat_quest",
    targetValue: 1,
    targetStat: "discipline",
    rewardXP: 60,
    rewardCoins: 15,
    rewardStat: "discipline",
    rewardStatAmount: 1,
  },
  {
    id: "directive_strength",
    title: "Physical Fortitude",
    description: "Complete at least 1 quest that builds your Strength.",
    requirementType: "stat_quest",
    targetValue: 1,
    targetStat: "strength",
    rewardXP: 60,
    rewardCoins: 15,
    rewardStat: "strength",
    rewardStatAmount: 1,
  },
  {
    id: "directive_intelligence",
    title: "Scholarly Inquest",
    description: "Complete at least 1 quest that expands your Intelligence.",
    requirementType: "stat_quest",
    targetValue: 1,
    targetStat: "intelligence",
    rewardXP: 60,
    rewardCoins: 15,
    rewardStat: "intelligence",
    rewardStatAmount: 1,
  },
  {
    id: "directive_vitality",
    title: "Vigor Renewal",
    description: "Complete at least 1 quest that fortifies your Vitality.",
    requirementType: "stat_quest",
    targetValue: 1,
    targetStat: "vitality",
    rewardXP: 60,
    rewardCoins: 15,
    rewardStat: "vitality",
    rewardStatAmount: 1,
  },
  {
    id: "directive_consistency",
    title: "Forge Your Consistency",
    description: "Complete 2 quests today while maintaining an active streak.",
    requirementType: "streak_quests",
    targetValue: 2,
    rewardXP: 80,
    rewardCoins: 25,
    rewardStat: "consistency",
    rewardStatAmount: 1,
  },
];