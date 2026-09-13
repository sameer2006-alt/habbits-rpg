import type { Quest } from "../types/game";

export const QUEST_REWARD_LIMITS = {
  minXP: 1,
  maxXP: 300,
  minCoins: 0,
  maxCoins: 100,
  minStatReward: 0,
  maxStatReward: 10,
} as const;

export interface SanitizedQuestReward {
  xpReward: number;
  coinReward: number;
  statAmount: number;
}

export function validateAndSanitizeQuestReward(
  xp: unknown,
  coins: unknown,
  statAmount: unknown
): { valid: boolean; sanitized: SanitizedQuestReward; error?: string } {
  const numXp = typeof xp === "number" ? xp : Number(xp);
  const numCoins = typeof coins === "number" ? coins : Number(coins);
  const numStat = typeof statAmount === "number" ? statAmount : Number(statAmount);

  if (!Number.isFinite(numXp) || !Number.isInteger(numXp)) {
    return {
      valid: false,
      sanitized: {
        xpReward: QUEST_REWARD_LIMITS.minXP,
        coinReward: QUEST_REWARD_LIMITS.minCoins,
        statAmount: QUEST_REWARD_LIMITS.minStatReward,
      },
      error: "XP must be a valid whole number",
    };
  }

  if (!Number.isFinite(numCoins) || !Number.isInteger(numCoins)) {
    return {
      valid: false,
      sanitized: {
        xpReward: QUEST_REWARD_LIMITS.minXP,
        coinReward: QUEST_REWARD_LIMITS.minCoins,
        statAmount: QUEST_REWARD_LIMITS.minStatReward,
      },
      error: "Coins must be a valid whole number",
    };
  }

  if (!Number.isFinite(numStat) || !Number.isInteger(numStat)) {
    return {
      valid: false,
      sanitized: {
        xpReward: QUEST_REWARD_LIMITS.minXP,
        coinReward: QUEST_REWARD_LIMITS.minCoins,
        statAmount: QUEST_REWARD_LIMITS.minStatReward,
      },
      error: "Stat amount must be a valid whole number",
    };
  }

  const clampedXp = Math.min(Math.max(numXp, QUEST_REWARD_LIMITS.minXP), QUEST_REWARD_LIMITS.maxXP);
  const clampedCoins = Math.min(Math.max(numCoins, QUEST_REWARD_LIMITS.minCoins), QUEST_REWARD_LIMITS.maxCoins);
  const clampedStat = Math.min(Math.max(numStat, QUEST_REWARD_LIMITS.minStatReward), QUEST_REWARD_LIMITS.maxStatReward);

  if (numXp < QUEST_REWARD_LIMITS.minXP || numXp > QUEST_REWARD_LIMITS.maxXP) {
    return {
      valid: false,
      sanitized: { xpReward: clampedXp, coinReward: clampedCoins, statAmount: clampedStat },
      error: `XP reward must be between ${QUEST_REWARD_LIMITS.minXP} and ${QUEST_REWARD_LIMITS.maxXP}`,
    };
  }

  if (numCoins < QUEST_REWARD_LIMITS.minCoins || numCoins > QUEST_REWARD_LIMITS.maxCoins) {
    return {
      valid: false,
      sanitized: { xpReward: clampedXp, coinReward: clampedCoins, statAmount: clampedStat },
      error: `Coin reward must be between ${QUEST_REWARD_LIMITS.minCoins} and ${QUEST_REWARD_LIMITS.maxCoins}`,
    };
  }

  if (numStat < QUEST_REWARD_LIMITS.minStatReward || numStat > QUEST_REWARD_LIMITS.maxStatReward) {
    return {
      valid: false,
      sanitized: { xpReward: clampedXp, coinReward: clampedCoins, statAmount: clampedStat },
      error: `Stat reward must be between ${QUEST_REWARD_LIMITS.minStatReward} and ${QUEST_REWARD_LIMITS.maxStatReward}`,
    };
  }

  return {
    valid: true,
    sanitized: {
      xpReward: Math.floor(clampedXp),
      coinReward: Math.floor(clampedCoins),
      statAmount: Math.floor(clampedStat),
    },
  };
}

export const initialQuests: Quest[] = [
  {
    id: "water",
    title: "Hydration",
    description: "Reach your personal daily water target.",
    category: "VITALITY",
    xpReward: 50,
    coinReward: 10,
    statReward: { stat: "vitality", amount: 2 },
    completed: false,
  },
  {
    id: "exercise",
    title: "Physical Training",
    description: "Complete your planned exercise session.",
    category: "STRENGTH",
    xpReward: 100,
    coinReward: 20,
    statReward: { stat: "strength", amount: 5 },
    completed: false,
  },
  {
    id: "study",
    title: "Knowledge Expansion",
    description: "Complete your planned study session.",
    category: "INTELLIGENCE",
    xpReward: 150,
    coinReward: 10,
    statReward: { stat: "intelligence", amount: 5 },
    completed: false,
  },
  {
    id: "reading",
    title: "Read",
    description: "Spend some time reading.",
    category: "FOCUS",
    xpReward: 50,
    coinReward: 5,
    statReward: { stat: "focus", amount: 2 },
    completed: false,
  },
];