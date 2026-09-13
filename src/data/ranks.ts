import type {
  PlayerStats,
  RankDefinition,
  RankProgressInfo,
  RankRequirementCheck,
} from "../types/game";

export const RANK_DEFINITIONS: RankDefinition[] = [
  {
    id: "F",
    name: "Awakened Recruit",
    tierOrder: 0,
    symbol: "F",
    badgeLabel: "RANK F",
    color: "#8b949e",
    glowColor: "rgba(139, 148, 158, 0.4)",
    bgGradient: ["#1b1f27", "#0d1117"],
    titleTag: "Recruit",
    description: "Your inner power has awakened. The hunter path begins here.",
    lore: "Every monarch and champion once stood here—uncertain, untested, but resolved.",
    requiredXP: 0,
    requiredTasks: 0,
    requiredStreak: 0,
    perks: [
      "Access to Daily Quests & Habits",
      "Basic Soul Coin Shop Access",
      "Standard System HUD",
    ],
  },
  {
    id: "E",
    name: "Trainee Hunter",
    tierOrder: 1,
    symbol: "E",
    badgeLabel: "RANK E",
    color: "#cd7f32",
    glowColor: "rgba(205, 127, 50, 0.45)",
    bgGradient: ["#2d1810", "#140a06"],
    titleTag: "Trainee",
    description: "Proof of consistency under pressure. Basic endurance achieved.",
    lore: "Trivial quests forged the raw stamina required to step beyond mediocrity.",
    requiredXP: 500,
    requiredTasks: 8,
    requiredStreak: 2,
    perks: [
      "+5% XP on Daily Quests",
      "Bronze Profile Badge",
      "Access to Weekly Boss Arena",
    ],
  },
  {
    id: "D",
    name: "Scout Vanguard",
    tierOrder: 2,
    symbol: "D",
    badgeLabel: "RANK D",
    color: "#70a1ff",
    glowColor: "rgba(112, 161, 255, 0.5)",
    bgGradient: ["#0e1e3d", "#060e20"],
    titleTag: "Vanguard",
    description: "Habits are becoming instinctual. Sloth no longer has hold over you.",
    lore: "You navigate obstacles before they materialize. The vanguard leads the charge.",
    requiredXP: 1500,
    requiredTasks: 20,
    requiredStreak: 3,
    perks: [
      "+10% Soul Coin Gain",
      "Sapphire Vanguard Aura",
      "Access to Custom Daily Quests",
    ],
  },
  {
    id: "C",
    name: "Iron Striker",
    tierOrder: 3,
    symbol: "C",
    badgeLabel: "RANK C",
    color: "#2ed573",
    glowColor: "rgba(46, 213, 115, 0.5)",
    bgGradient: ["#0b291a", "#04140c"],
    titleTag: "Striker",
    description: "Steel-forged execution. Objectives fall with lethal precision.",
    lore: "Discipline has permanently replaced fleeting motivation. You strike without hesitation.",
    requiredXP: 3500,
    requiredTasks: 45,
    requiredStreak: 5,
    perks: [
      "+15% Boss Damage Multiplier",
      "Verdant Iron Frame",
      "Rare Items Available in Shop",
    ],
  },
  {
    id: "B",
    name: "Silver Slayer",
    tierOrder: 4,
    symbol: "B",
    badgeLabel: "RANK B",
    color: "#a55eea",
    glowColor: "rgba(165, 94, 234, 0.55)",
    bgGradient: ["#280f3b", "#12051d"],
    titleTag: "Slayer",
    description: "A commanding presence. Your focus cuts deeper than enchanted steel.",
    lore: "Arcane energy wraps around your daily actions. Weak habits wither away.",
    requiredXP: 7000,
    requiredTasks: 80,
    requiredStreak: 7,
    specialConditionText: "Any Stat ≥ 20",
    specialConditionKey: "stat_20",
    perks: [
      "+20% Streak Recovery Grace",
      "Amethyst Resonance Glow",
      "Exclusive Slayer Avatar Frame",
    ],
  },
  {
    id: "A",
    name: "Elite Champion",
    tierOrder: 5,
    symbol: "A",
    badgeLabel: "RANK A",
    color: "#ff4757",
    glowColor: "rgba(255, 71, 87, 0.6)",
    bgGradient: ["#380a13", "#1b0308"],
    titleTag: "Champion",
    description: "The top echelon of mortal hunters. A terrifying beacon of work ethic.",
    lore: "Only the top 5% of awakened reach Rank A. The abyss gazes back and flinches.",
    requiredXP: 12500,
    requiredTasks: 130,
    requiredStreak: 10,
    specialConditionText: "Any Stat ≥ 35",
    specialConditionKey: "stat_35",
    perks: [
      "+25% Total XP and Coins",
      "Crimson Inferno Aura",
      "High-Tier Boss Bounty Boost",
    ],
  },
  {
    id: "S",
    name: "Shadow Monarch",
    tierOrder: 6,
    symbol: "S",
    badgeLabel: "RANK S",
    color: "#ffa502",
    glowColor: "rgba(255, 165, 2, 0.7)",
    bgGradient: ["#3d2503", "#1f1200"],
    titleTag: "Monarch",
    description: "A sovereign of sovereign will. You command reality through sheer output.",
    lore: "'Arise.' In the kingdom of shadows, you do not follow destiny—you conquer it.",
    requiredXP: 20000,
    requiredTasks: 200,
    requiredStreak: 14,
    specialConditionText: "Defeat At Least 1 Boss",
    specialConditionKey: "boss_1",
    perks: [
      "Shadow Sovereign Crest",
      "+35% Coin Multiplier",
      "Double Damage against Monthly Bosses",
      "Epic Title: 'Shadow Monarch'",
    ],
  },
  {
    id: "SS",
    name: "Grand Sovereign",
    tierOrder: 7,
    symbol: "SS",
    badgeLabel: "RANK SS",
    color: "#00d2d3",
    glowColor: "rgba(0, 210, 211, 0.75)",
    bgGradient: ["#042a33", "#01141a"],
    titleTag: "Grand Sovereign",
    description: "Transcendence beyond conventional classification. National-level hunter.",
    lore: "The skies crackle with cyan lightning whenever you begin your daily tasks.",
    requiredXP: 32000,
    requiredTasks: 300,
    requiredStreak: 21,
    specialConditionText: "Defeat At Least 2 Bosses",
    specialConditionKey: "boss_2",
    perks: [
      "Celestial Cyan Lightning Aura",
      "+50% Boss Damage Multiplier",
      "Legendary Shop Items Unlocked",
    ],
  },
  {
    id: "HEROIC",
    name: "Heroic Paragon",
    tierOrder: 8,
    symbol: "👑",
    badgeLabel: "HEROIC",
    color: "#ff6b81",
    glowColor: "rgba(255, 107, 129, 0.8)",
    bgGradient: ["#440a1c", "#1f030b"],
    titleTag: "Paragon",
    description: "A living myth. Your discipline inspires all who cross your path.",
    lore: "Unshakable fortitude. Failure is merely fuel for your inevitable triumph.",
    requiredXP: 50000,
    requiredTasks: 450,
    requiredStreak: 30,
    specialConditionText: "Defeat At Least 3 Bosses",
    specialConditionKey: "boss_3",
    perks: [
      "Radiant Solar Flare Crest",
      "Permanent 2x Streak Protection Shield",
      "Exclusive Paragon Identity Title",
    ],
  },
  {
    id: "LEGENDARY",
    name: "Mythic God of Discipline",
    tierOrder: 9,
    symbol: "✦",
    badgeLabel: "LEGENDARY",
    color: "#ffd700",
    glowColor: "rgba(255, 215, 0, 0.9)",
    bgGradient: ["#4a3700", "#1f1700"],
    titleTag: "Immortal",
    description: "The absolute zenith of existence. Total, undisputed dominion over self.",
    lore: "You have mastered time, body, and consciousness. You are an unstoppable force.",
    requiredXP: 75000,
    requiredTasks: 650,
    requiredStreak: 45,
    specialConditionText: "All 6 Stats ≥ 50",
    specialConditionKey: "all_stats_50",
    perks: [
      "Godspeed Astral Shimmer",
      "Permanent Supreme Crest & Halo",
      "Immortal Master of Destiny Status",
      "Triple Rewards from all Quests & Bosses",
    ],
  },
];

export function getRankDefinition(rankId: string): RankDefinition {
  const normalized = (rankId || "").trim().toUpperCase();
  const match = RANK_DEFINITIONS.find(
    (r) => r.id.toUpperCase() === normalized || r.badgeLabel.toUpperCase() === normalized
  );
  return match ?? RANK_DEFINITIONS[0];
}

export function getRankByTierOrder(tier: number): RankDefinition {
  const clamped = Math.max(0, Math.min(RANK_DEFINITIONS.length - 1, tier));
  return RANK_DEFINITIONS[clamped];
}

export function getNextRank(currentRankId: string): RankDefinition | null {
  const current = getRankDefinition(currentRankId);
  if (current.tierOrder >= RANK_DEFINITIONS.length - 1) {
    return null;
  }
  return RANK_DEFINITIONS[current.tierOrder + 1];
}

export function checkSpecialCondition(
  key: RankDefinition["specialConditionKey"],
  stats: PlayerStats,
  bossesSlainCount: number
): boolean {
  if (!key) return true;

  const statValues = Object.values(stats || {});
  const maxStat = Math.max(...statValues, 0);

  switch (key) {
    case "stat_20":
      return maxStat >= 20;
    case "stat_35":
      return maxStat >= 35;
    case "boss_1":
      return bossesSlainCount >= 1;
    case "boss_2":
      return bossesSlainCount >= 2;
    case "boss_3":
      return bossesSlainCount >= 3;
    case "all_stats_50": {
      const statKeys: (keyof PlayerStats)[] = [
        "strength",
        "intelligence",
        "vitality",
        "focus",
        "discipline",
        "consistency",
      ];
      return statKeys.every((k) => (stats?.[k] ?? 0) >= 50);
    }
    default:
      return true;
  }
}

export interface PlayerRankEvaluationInput {
  totalXP: number;
  tasksCompleted: number;
  streak: number;
  bestStreak?: number;
  stats: PlayerStats;
  bossesSlain: number;
  currentRankId?: string;
}

export function evaluatePlayerRank(params: PlayerRankEvaluationInput): RankDefinition {
  const { totalXP, tasksCompleted, streak, bestStreak, stats, bossesSlain, currentRankId } = params;
  const effectiveStreak = Math.max(streak, bestStreak ?? 0);

  let highestValidRank = RANK_DEFINITIONS[0];

  // Evaluate sequentially from Tier 1 (E) upwards to Tier 9 (Legendary).
  // A player cannot skip an unfulfilled intermediate rank to achieve a higher one.
  for (let i = 1; i < RANK_DEFINITIONS.length; i++) {
    const rank = RANK_DEFINITIONS[i];
    const xpPass = totalXP >= rank.requiredXP;
    const taskPass = tasksCompleted >= rank.requiredTasks;
    const streakPass = effectiveStreak >= rank.requiredStreak;
    const specialPass = checkSpecialCondition(rank.specialConditionKey, stats, bossesSlain);

    if (xpPass && taskPass && streakPass && specialPass) {
      highestValidRank = rank;
    } else {
      // Immediate next rank requirement not met; stop evaluation here
      break;
    }
  }

  // Prevent accidental rank downgrade
  if (currentRankId) {
    const currentDef = getRankDefinition(currentRankId);
    if (highestValidRank.tierOrder < currentDef.tierOrder) {
      return currentDef;
    }
  }

  return highestValidRank;
}

export function calculateRankProgress(params: {
  currentRankId: string;
  totalXP: number;
  tasksCompleted: number;
  streak: number;
  bestStreak?: number;
  stats: PlayerStats;
  bossesSlain: number;
}): RankProgressInfo {
  const { currentRankId, totalXP, tasksCompleted, streak, bestStreak, stats, bossesSlain } = params;
  const effectiveStreak = Math.max(streak, bestStreak ?? 0);
  const currentRank = getRankDefinition(currentRankId);
  const nextRank = getNextRank(currentRank.id);

  if (!nextRank) {
    return {
      currentRank,
      nextRank: null,
      overallPercent: 100,
      xpPercent: 100,
      tasksPercent: 100,
      streakPercent: 100,
      specialPercent: 100,
      requirements: [
        {
          label: "Total XP",
          current: totalXP,
          target: currentRank.requiredXP,
          completed: true,
        },
        {
          label: "Quests Cleared",
          current: tasksCompleted,
          target: currentRank.requiredTasks,
          completed: true,
        },
        {
          label: "Streak Days",
          current: effectiveStreak,
          target: currentRank.requiredStreak,
          completed: true,
        },
      ],
      allRequirementsMet: true,
      tasksRemaining: 0,
      xpRemaining: 0,
      streakRemaining: 0,
    };
  }

  const xpBase = currentRank.requiredXP;
  const xpTarget = nextRank.requiredXP;
  const xpProgress = Math.max(0, totalXP - xpBase);
  const xpSpan = Math.max(1, xpTarget - xpBase);
  const xpPercent = Math.min(100, Math.floor((xpProgress / xpSpan) * 100));

  const tasksTarget = nextRank.requiredTasks;
  const tasksPercent = Math.min(100, Math.floor((tasksCompleted / Math.max(1, tasksTarget)) * 100));

  const streakTarget = nextRank.requiredStreak;
  const streakPercent = streakTarget === 0
    ? 100
    : Math.min(100, Math.floor((effectiveStreak / streakTarget) * 100));

  const specialPassed = checkSpecialCondition(nextRank.specialConditionKey, stats, bossesSlain);
  const specialPercent = specialPassed ? 100 : 0;

  const xpPassed = totalXP >= nextRank.requiredXP;
  const taskPassed = tasksCompleted >= nextRank.requiredTasks;
  const streakPassed = effectiveStreak >= nextRank.requiredStreak;

  const requirements: RankRequirementCheck[] = [
    {
      label: "Total XP",
      current: totalXP,
      target: nextRank.requiredXP,
      unit: "XP",
      completed: xpPassed,
    },
    {
      label: "Quests Cleared",
      current: tasksCompleted,
      target: nextRank.requiredTasks,
      unit: "tasks",
      completed: taskPassed,
    },
    {
      label: "Streak Discipline",
      current: effectiveStreak,
      target: nextRank.requiredStreak,
      unit: "days",
      completed: streakPassed,
    },
  ];

  if (nextRank.specialConditionText) {
    requirements.push({
      label: nextRank.specialConditionText,
      current: specialPassed ? 1 : 0,
      target: 1,
      completed: specialPassed,
    });
  }

  const allRequirementsMet = xpPassed && taskPassed && streakPassed && specialPassed;

  const overallPercent = nextRank.specialConditionText
    ? Math.min(
        allRequirementsMet ? 100 : 99,
        Math.floor(
          xpPercent * 0.4 +
            tasksPercent * 0.3 +
            streakPercent * 0.2 +
            specialPercent * 0.1
        )
      )
    : Math.min(
        allRequirementsMet ? 100 : 99,
        Math.floor(
          xpPercent * 0.45 + tasksPercent * 0.35 + streakPercent * 0.2
        )
      );

  return {
    currentRank,
    nextRank,
    overallPercent,
    xpPercent,
    tasksPercent,
    streakPercent,
    specialPercent,
    requirements,
    allRequirementsMet,
    tasksRemaining: Math.max(0, nextRank.requiredTasks - tasksCompleted),
    xpRemaining: Math.max(0, nextRank.requiredXP - totalXP),
    streakRemaining: Math.max(0, nextRank.requiredStreak - effectiveStreak),
    specialRemainingText: specialPassed ? undefined : nextRank.specialConditionText,
  };
}
