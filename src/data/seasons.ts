export interface SeasonMilestone {
  level: number;
  rewardXP: number;
  rewardCoins: number;
  rewardItemId?: string;
  rewardTitleId?: string;
  rewardLabel: string;
}

export interface SeasonDefinition {
  id: string;
  seasonNumber: number;
  name: string;
  theme: string;
  startDate: string;
  endDate: string;
  daysRemaining: number;
  milestones: SeasonMilestone[];
}

export interface PlayerSeason {
  id: string;
  userId: string;
  seasonId: string;
  seasonXP: number;
  seasonLevel: number;
  milestonesClaimed: number[];
  completed: boolean;
  rewardClaimed: boolean;
  createdAt: string;
  updatedAt: string;
}

export const SEASON_LEVEL_THRESHOLDS: number[] = [
  0,     // Level 1
  300,   // Level 2
  750,   // Level 3
  1350,  // Level 4
  2100,  // Level 5
  3000,  // Level 6
  4050,  // Level 7
  5250,  // Level 8
  6600,  // Level 9
  8100,  // Level 10 (MAX)
];

export const SEASON_MILESTONES: SeasonMilestone[] = [
  { level: 2, rewardXP: 150, rewardCoins: 50, rewardLabel: "+150 XP, +50 Coins" },
  { level: 4, rewardXP: 250, rewardCoins: 100, rewardLabel: "+250 XP, +100 Coins" },
  { level: 6, rewardXP: 400, rewardCoins: 150, rewardItemId: "weapon_plasma_katana", rewardLabel: "+400 XP, +150 Coins, Plasma Katana" },
  { level: 8, rewardXP: 600, rewardCoins: 200, rewardItemId: "armor_cyber_aegis", rewardLabel: "+600 XP, +200 Coins, Cyber Aegis" },
  { level: 10, rewardXP: 1000, rewardCoins: 350, rewardTitleId: "title_season_champion", rewardItemId: "accessory_quantum_core", rewardLabel: "+1,000 XP, +350 Coins, Season Champion Title & Quantum Core" },
];
