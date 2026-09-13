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
  avatarId?: string;
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


export type AchievementTier = "BRONZE" | "SILVER" | "GOLD" | "PLATINUM" | "LEGENDARY";

export type AchievementIcon =
  | "sword" | "flame" | "shield" | "book" | "code" | "dumbbell"
  | "drop" | "sun" | "crown" | "skull" | "star" | "gem"
  | "coin" | "heart" | "target" | "lightning" | "scroll"
  | "mountain" | "moon" | "trophy" | "brain" | "chain";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: AchievementIcon;
  tier: AchievementTier;

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

export type RankTierId =
  | "F"
  | "E"
  | "D"
  | "C"
  | "B"
  | "A"
  | "S"
  | "SS"
  | "HEROIC"
  | "LEGENDARY";

export interface RankDefinition {
  id: RankTierId;
  name: string;
  tierOrder: number; // 0 to 9
  symbol: string;
  badgeLabel: string;
  color: string;
  glowColor: string;
  bgGradient: [string, string];
  titleTag: string;
  description: string;
  lore: string;
  // Multivariable criteria
  requiredXP: number;
  requiredTasks: number;
  requiredStreak: number;
  specialConditionText?: string;
  specialConditionKey?: "stat_20" | "stat_35" | "boss_1" | "boss_2" | "boss_3" | "all_stats_50";
  perks: string[];
}

export interface RankRequirementCheck {
  label: string;
  current: number;
  target: number;
  unit?: string;
  completed: boolean;
}

export interface RankProgressInfo {
  currentRank: RankDefinition;
  nextRank: RankDefinition | null;
  overallPercent: number;
  xpPercent: number;
  tasksPercent: number;
  streakPercent: number;
  specialPercent: number;
  requirements: RankRequirementCheck[];
  allRequirementsMet: boolean;
  tasksRemaining: number;
  xpRemaining: number;
  streakRemaining: number;
  specialRemainingText?: string;
}
