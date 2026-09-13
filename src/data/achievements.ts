import type { AchievementTier, AchievementIcon } from "../types/game";

export type RequirementType =
  | "quests_completed"
  | "streak"
  | "level"
  | "coins"
  | "stat_strength"
  | "stat_intelligence"
  | "stat_vitality"
  | "stat_focus"
  | "stat_discipline"
  | "stat_consistency"
  | "perfect_day";

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  icon: AchievementIcon;
  tier: AchievementTier;
  requirementType: RequirementType;
  requirementValue: number;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  // ── Quest Milestones ──
  { id: "FIRST_QUEST", title: "First Quest", description: "Complete your first quest.", icon: "sword", tier: "BRONZE", requirementType: "quests_completed", requirementValue: 1 },
  { id: "QUEST_10", title: "Adventurer", description: "Complete 10 quests.", icon: "sword", tier: "BRONZE", requirementType: "quests_completed", requirementValue: 10 },
  { id: "QUEST_25", title: "Quest Hunter", description: "Complete 25 quests.", icon: "sword", tier: "SILVER", requirementType: "quests_completed", requirementValue: 25 },
  { id: "QUEST_50", title: "Veteran", description: "Complete 50 quests.", icon: "shield", tier: "SILVER", requirementType: "quests_completed", requirementValue: 50 },
  { id: "DISCIPLINED", title: "Disciplined", description: "Complete 100 quests.", icon: "shield", tier: "GOLD", requirementType: "quests_completed", requirementValue: 100 },
  { id: "QUEST_250", title: "Relentless", description: "Complete 250 quests.", icon: "star", tier: "GOLD", requirementType: "quests_completed", requirementValue: 250 },
  { id: "FLAWLESS", title: "Flawless", description: "Complete 500 quests.", icon: "gem", tier: "PLATINUM", requirementType: "quests_completed", requirementValue: 500 },
  { id: "QUEST_1000", title: "Transcendent", description: "Complete 1,000 quests.", icon: "crown", tier: "LEGENDARY", requirementType: "quests_completed", requirementValue: 1000 },

  // ── Streak Milestones ──
  { id: "STREAK_3", title: "Getting Started", description: "Maintain a 3-day streak.", icon: "flame", tier: "BRONZE", requirementType: "streak", requirementValue: 3 },
  { id: "WEEK_WARRIOR", title: "Week Warrior", description: "Maintain a 7-day streak.", icon: "flame", tier: "SILVER", requirementType: "streak", requirementValue: 7 },
  { id: "STREAK_14", title: "Fortnight Force", description: "Maintain a 14-day streak.", icon: "flame", tier: "SILVER", requirementType: "streak", requirementValue: 14 },
  { id: "MONTH_WARRIOR", title: "Month Warrior", description: "Maintain a 30-day streak.", icon: "flame", tier: "GOLD", requirementType: "streak", requirementValue: 30 },
  { id: "STREAK_60", title: "Iron Will", description: "Maintain a 60-day streak.", icon: "flame", tier: "GOLD", requirementType: "streak", requirementValue: 60 },
  { id: "STREAK_90", title: "Unbreakable", description: "Maintain a 90-day streak.", icon: "flame", tier: "PLATINUM", requirementType: "streak", requirementValue: 90 },
  { id: "CENTURION", title: "Centurion", description: "Reach a 100-day streak.", icon: "flame", tier: "PLATINUM", requirementType: "streak", requirementValue: 100 },
  { id: "STREAK_365", title: "Year of Fire", description: "Maintain a 365-day streak.", icon: "flame", tier: "LEGENDARY", requirementType: "streak", requirementValue: 365 },

  // ── Level Milestones ──
  { id: "LEVEL_5", title: "Ascension", description: "Reach Level 5.", icon: "star", tier: "BRONZE", requirementType: "level", requirementValue: 5 },
  { id: "LEVEL_10", title: "Double Digits", description: "Reach Level 10.", icon: "star", tier: "BRONZE", requirementType: "level", requirementValue: 10 },
  { id: "LEVEL_25", title: "Rising Star", description: "Reach Level 25.", icon: "star", tier: "SILVER", requirementType: "level", requirementValue: 25 },
  { id: "LEVEL_50", title: "Half Century", description: "Reach Level 50.", icon: "trophy", tier: "GOLD", requirementType: "level", requirementValue: 50 },
  { id: "LEGEND", title: "Legend", description: "Reach Level 100.", icon: "crown", tier: "LEGENDARY", requirementType: "level", requirementValue: 100 },

  // ── Coin Milestones ──
  { id: "COINS_50", title: "Pocket Change", description: "Accumulate 50 Soul Coins.", icon: "coin", tier: "BRONZE", requirementType: "coins", requirementValue: 50 },
  { id: "COINS_100", title: "Coin Collector", description: "Accumulate 100 Soul Coins.", icon: "coin", tier: "BRONZE", requirementType: "coins", requirementValue: 100 },
  { id: "COINS_500", title: "Wealthy", description: "Accumulate 500 Soul Coins.", icon: "coin", tier: "SILVER", requirementType: "coins", requirementValue: 500 },
  { id: "SOUL_RICH", title: "Soul Rich", description: "Accumulate 1,000 Soul Coins.", icon: "coin", tier: "GOLD", requirementType: "coins", requirementValue: 1000 },
  { id: "COINS_5000", title: "Dragon's Hoard", description: "Accumulate 5,000 Soul Coins.", icon: "gem", tier: "PLATINUM", requirementType: "coins", requirementValue: 5000 },

  // ── Category-Specific (Stat-Based) ──
  { id: "STUDY_MACHINE", title: "Study Machine", description: "Reach 50 Intelligence.", icon: "book", tier: "GOLD", requirementType: "stat_intelligence", requirementValue: 50 },
  { id: "CODER", title: "Coder", description: "Reach 30 Intelligence.", icon: "code", tier: "GOLD", requirementType: "stat_intelligence", requirementValue: 30 },
  { id: "IRON_BODY", title: "Iron Body", description: "Reach 50 Strength.", icon: "dumbbell", tier: "SILVER", requirementType: "stat_strength", requirementValue: 50 },
  { id: "HYDRATION_MASTER", title: "Hydration Master", description: "Reach 30 Vitality.", icon: "drop", tier: "SILVER", requirementType: "stat_vitality", requirementValue: 30 },
  { id: "EARLY_RISER", title: "Early Riser", description: "Reach 30 Discipline.", icon: "sun", tier: "GOLD", requirementType: "stat_discipline", requirementValue: 30 },
  { id: "FOCUSED_MIND", title: "Focused Mind", description: "Reach 50 Focus.", icon: "target", tier: "GOLD", requirementType: "stat_focus", requirementValue: 50 },
  { id: "CHAIN_BREAKER", title: "Chain Breaker", description: "Reach 50 Consistency.", icon: "chain", tier: "GOLD", requirementType: "stat_consistency", requirementValue: 50 },
  { id: "HEART_OF_STEEL", title: "Heart of Steel", description: "Reach 50 Vitality.", icon: "heart", tier: "GOLD", requirementType: "stat_vitality", requirementValue: 50 },
  { id: "BRAINIAC", title: "Brainiac", description: "Reach 100 Intelligence.", icon: "brain", tier: "PLATINUM", requirementType: "stat_intelligence", requirementValue: 100 },
  { id: "TITAN", title: "Titan", description: "Reach 100 Strength.", icon: "mountain", tier: "PLATINUM", requirementType: "stat_strength", requirementValue: 100 },

  // ── Special / Rare ──
  { id: "PERFECT_DAY", title: "Perfect Day", description: "Complete all daily missions.", icon: "star", tier: "SILVER", requirementType: "perfect_day", requirementValue: 1 },
  { id: "NIGHT_OWL", title: "Night Owl", description: "Complete 15 Discipline quests.", icon: "moon", tier: "BRONZE", requirementType: "stat_discipline", requirementValue: 15 },
  { id: "BOSS_SLAYER", title: "Boss Slayer", description: "Defeat a weekly boss challenge.", icon: "skull", tier: "PLATINUM", requirementType: "level", requirementValue: 40 },
  { id: "LIGHTNING", title: "Speed Runner", description: "Complete 20 Focus quests.", icon: "lightning", tier: "SILVER", requirementType: "stat_focus", requirementValue: 20 },
  { id: "SCHOLAR", title: "Scholar", description: "Reach 20 Intelligence.", icon: "scroll", tier: "SILVER", requirementType: "stat_intelligence", requirementValue: 20 },
  { id: "MAXED_STAT", title: "Maxed Out", description: "Reach 100 Consistency.", icon: "gem", tier: "LEGENDARY", requirementType: "stat_consistency", requirementValue: 100 },
];