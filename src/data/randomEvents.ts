import type { StatName } from "../types/game";

export type RandomEventType = "focus_trial" | "discipline_trial" | "bounty_surge" | "vigor_renewal" | "intellect_surge";

export interface RandomEventTemplate {
  id: string;
  type: RandomEventType;
  title: string;
  description: string;
  requirementType: "any_quests" | "stat_quest";
  targetValue: number;
  targetStat?: StatName;
  durationHours: number;
  rewardXP: number;
  rewardCoins: number;
  rewardStat?: StatName;
  rewardStatAmount?: number;
}

export interface RandomEventInstance {
  id: string;
  userId: string;
  templateId: string;
  eventType: RandomEventType;
  title: string;
  description: string;
  requirementType: "any_quests" | "stat_quest";
  targetValue: number;
  targetStat?: StatName;
  currentValue: number;
  rewardXP: number;
  rewardCoins: number;
  rewardStat?: StatName;
  rewardStatAmount?: number;
  startTime: string;
  expiryTime: string;
  completed: boolean;
  rewardClaimed: boolean;
  createdAt: string;
  completedAt?: string;
}

export type PlayerRandomEvent = RandomEventInstance;

/**
 * Authoritative pool of controlled Random Events.
 * Balanced economy rewards:
 * - XP: 50 - 75 XP
 * - Coins: 15 - 40 Coins
 * - Optional Stat: +1
 */
export const RANDOM_EVENT_TEMPLATES: RandomEventTemplate[] = [
  {
    id: "event_hyperfocus",
    type: "focus_trial",
    title: "Cognitive Surge",
    description: "Conquer 1 Focus quest within the next 4 hours to calibrate deep concentration.",
    requirementType: "stat_quest",
    targetValue: 1,
    targetStat: "focus",
    durationHours: 4,
    rewardXP: 50,
    rewardCoins: 15,
    rewardStat: "focus",
    rewardStatAmount: 1,
  },
  {
    id: "event_iron_will",
    type: "discipline_trial",
    title: "Iron Will Conditioning",
    description: "Complete 1 Discipline quest within the next 4 hours to strengthen resolve.",
    requirementType: "stat_quest",
    targetValue: 1,
    targetStat: "discipline",
    durationHours: 4,
    rewardXP: 50,
    rewardCoins: 15,
    rewardStat: "discipline",
    rewardStatAmount: 1,
  },
  {
    id: "event_bounty_surge",
    type: "bounty_surge",
    title: "Guild Bounty Rush",
    description: "Complete 3 quests of any category within 6 hours for a bonus coin windfall.",
    requirementType: "any_quests",
    targetValue: 3,
    durationHours: 6,
    rewardXP: 75,
    rewardCoins: 40,
  },
  {
    id: "event_vigor_renewal",
    type: "vigor_renewal",
    title: "Vigor Renewal",
    description: "Complete 1 Vitality quest within 4 hours to restore physical energy.",
    requirementType: "stat_quest",
    targetValue: 1,
    targetStat: "vitality",
    durationHours: 4,
    rewardXP: 50,
    rewardCoins: 15,
    rewardStat: "vitality",
    rewardStatAmount: 1,
  },
  {
    id: "event_intellect_surge",
    type: "intellect_surge",
    title: "Arcane Inquest",
    description: "Complete 1 Intelligence quest within 4 hours to sharpen intellectual prowess.",
    requirementType: "stat_quest",
    targetValue: 1,
    targetStat: "intelligence",
    durationHours: 4,
    rewardXP: 50,
    rewardCoins: 15,
    rewardStat: "intelligence",
    rewardStatAmount: 1,
  },
];
