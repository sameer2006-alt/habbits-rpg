export type MonthlyObjectiveType =
  | "quests_completed"
  | "xp_earned"
  | "bosses_defeated"
  | "perfect_days"
  | "weekly_challenges_completed"
  | "stat_training"
  | "random_events_completed";

export interface MonthlyObjective {
  id: string;
  description: string;
  type: MonthlyObjectiveType;
  targetValue: number;
  currentValue: number;
  completed: boolean;
  targetStat?: string;
}

export interface MonthlyChallengeTemplate {
  id: string;
  title: string;
  description: string;
  objectives: Omit<MonthlyObjective, "currentValue" | "completed">[];
  rewardXP: number;
  rewardCoins: number;
  rewardItemId?: string;
}

export interface MonthlyChallenge {
  id: string;
  userId: string;
  monthStart: string;
  monthEnd: string;
  templateId: string;
  title: string;
  description: string;
  objectives: MonthlyObjective[];
  completed: boolean;
  rewardClaimed: boolean;
  rewardXP: number;
  rewardCoins: number;
  rewardItemId?: string | null;
  createdAt: string;
  completedAt?: string | null;
}

export type MonthlyChallengeUIState = "loading" | "active" | "in_progress" | "completed" | "expired";

export const MONTHLY_CHALLENGE_TEMPLATES: MonthlyChallengeTemplate[] = [
  {
    id: "challenge_monthly_titan",
    title: "Titan Protocol",
    description: "Sustained high-cadence protocol operations across the entire monthly sector.",
    objectives: [
      { id: "obj_m_quests", description: "Complete 80 Quests", type: "quests_completed", targetValue: 80 },
      { id: "obj_m_xp", description: "Earn 3,500 XP", type: "xp_earned", targetValue: 3500 },
      { id: "obj_m_perfect", description: "Attain 6 Perfect Days", type: "perfect_days", targetValue: 6 },
    ],
    rewardXP: 2000,
    rewardCoins: 400,
    rewardItemId: "weapon_plasma_katana",
  },
  {
    id: "challenge_apex_conqueror",
    title: "Apex Conqueror Operation",
    description: "Neutralize high-tier boss entities and conquer multi-cadence weekly trials.",
    objectives: [
      { id: "obj_m_quests", description: "Complete 70 Quests", type: "quests_completed", targetValue: 70 },
      { id: "obj_m_bosses", description: "Defeat 3 Boss Entities", type: "bosses_defeated", targetValue: 3 },
      { id: "obj_m_weeklies", description: "Complete 2 Weekly Challenges", type: "weekly_challenges_completed", targetValue: 2 },
    ],
    rewardXP: 2500,
    rewardCoins: 500,
    rewardItemId: "armor_cyber_aegis",
  },
  {
    id: "challenge_discipline_month",
    title: "Mind Mastery Crucible",
    description: "Deep neurological conditioning focused on willpower, concentration, and consistency.",
    objectives: [
      { id: "obj_m_quests", description: "Complete 65 Quests", type: "quests_completed", targetValue: 65 },
      { id: "obj_m_training", description: "Complete 15 Focus/Discipline Quests", type: "stat_training", targetValue: 15 },
      { id: "obj_m_perfect", description: "Attain 5 Perfect Days", type: "perfect_days", targetValue: 5 },
    ],
    rewardXP: 2200,
    rewardCoins: 450,
    rewardItemId: "accessory_quantum_core",
  },
  {
    id: "challenge_chaos_dominator",
    title: "Anomaly Neutralizer",
    description: "Resolve sudden environmental random events and execute boss suppression orders.",
    objectives: [
      { id: "obj_m_quests", description: "Complete 60 Quests", type: "quests_completed", targetValue: 60 },
      { id: "obj_m_bosses", description: "Defeat 2 Boss Entities", type: "bosses_defeated", targetValue: 2 },
      { id: "obj_m_events", description: "Overcome 3 Random Events", type: "random_events_completed", targetValue: 3 },
    ],
    rewardXP: 2000,
    rewardCoins: 400,
    rewardItemId: "weapon_plasma_katana",
  },
  {
    id: "challenge_iron_will_month",
    title: "Iron Will Campaign",
    description: "The premier monthly endurance campaign demanding uncompromising excellence.",
    objectives: [
      { id: "obj_m_quests", description: "Complete 90 Quests", type: "quests_completed", targetValue: 90 },
      { id: "obj_m_xp", description: "Earn 4,500 XP", type: "xp_earned", targetValue: 4500 },
      { id: "obj_m_perfect", description: "Attain 8 Perfect Days", type: "perfect_days", targetValue: 8 },
    ],
    rewardXP: 3000,
    rewardCoins: 600,
    rewardItemId: "armor_cyber_aegis",
  },
];
