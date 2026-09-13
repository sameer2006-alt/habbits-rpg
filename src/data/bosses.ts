export type BossCadence = "WEEKLY" | "MONTHLY";

export interface BossReward {
  xp: number;
  coins: number;
  statBonus?: {
    stat: "strength" | "intelligence" | "vitality" | "focus" | "discipline" | "consistency";
    amount: number;
  };
  title?: string;
}

export interface BossDef {
  id: string;
  name: string;
  subtitle: string;
  cadence: BossCadence;
  maxHp: number;
  damagePerQuest: number;
  avatarColor: string;
  avatarGlow: string;
  lore: string;
  rewards: BossReward;
  recommendedLevel: number;
}

export const BOSSES: BossDef[] = [
  // ── Weekly Boss ──
  {
    id: "weekly_ignis",
    name: "Ignis, the Flame of Lethargy",
    subtitle: "Weekly Nemesis",
    cadence: "WEEKLY",
    maxHp: 1200,
    damagePerQuest: 45,
    avatarColor: "#ef4444",
    avatarGlow: "rgba(239, 68, 68, 0.4)",
    lore: "Born from missed alarms and procrastination. Its embers will burn your momentum unless quenched through dedicated daily discipline across the week.",
    rewards: {
      xp: 600,
      coins: 200,
      statBonus: { stat: "discipline", amount: 5 },
      title: "Flame Extinguisher",
    },
    recommendedLevel: 3,
  },
  {
    id: "weekly_vortex",
    name: "Vortex, the Mind Fog",
    subtitle: "Weekly Nemesis",
    cadence: "WEEKLY",
    maxHp: 1500,
    damagePerQuest: 50,
    avatarColor: "#8b5cf6",
    avatarGlow: "rgba(139, 92, 246, 0.4)",
    lore: "A swirling vortex of social media scrolling and endless distraction. Strike it down through sustained concentration and deep work.",
    rewards: {
      xp: 750,
      coins: 250,
      statBonus: { stat: "focus", amount: 5 },
      title: "Mind Cleanser",
    },
    recommendedLevel: 5,
  },

  // ── Monthly Boss ──
  {
    id: "monthly_malakor",
    name: "Malakor, The Procrastination Monarch",
    subtitle: "Monthly Apex Raid",
    cadence: "MONTHLY",
    maxHp: 5000,
    damagePerQuest: 50,
    avatarColor: "#ec4899",
    avatarGlow: "rgba(236, 72, 153, 0.45)",
    lore: "The sovereign titan of comfortable excuses. He feeds on delayed goals and broken promises. Defeat him across 30 days to claim legendary spoils.",
    rewards: {
      xp: 2500,
      coins: 800,
      statBonus: { stat: "consistency", amount: 10 },
      title: "Sovereign of Will",
    },
    recommendedLevel: 10,
  },
  {
    id: "monthly_leviathan",
    name: "Abyssal Leviathan of Chaos",
    subtitle: "Monthly Apex Raid",
    cadence: "MONTHLY",
    maxHp: 7000,
    damagePerQuest: 60,
    avatarColor: "#06b6d4",
    avatarGlow: "rgba(6, 182, 212, 0.45)",
    lore: "Dwelling in the deepest trenches of unstructured time. Only an ironclad daily routine can pierce its abyssal armor.",
    rewards: {
      xp: 3000,
      coins: 1000,
      statBonus: { stat: "strength", amount: 10 },
      title: "Tamer of Chaos",
    },
    recommendedLevel: 15,
  },
];

