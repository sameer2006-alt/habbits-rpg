import { supabase } from "./supabase";
import {
  MONTHLY_CHALLENGE_TEMPLATES,
  type MonthlyChallenge,
  type MonthlyChallengeTemplate,
  type MonthlyChallengeUIState,
} from "../data/monthlyChallenges";
import { addItemToInventory } from "./inventoryData";
import type { StatName } from "../types/game";

export interface MonthRange {
  monthStart: string;
  monthEnd: string;
  monthLabel: string;
  daysRemaining: number;
  totalDays: number;
}

export function getCurrentMonthRange(customDate?: Date): MonthRange {
  const now = customDate ? new Date(customDate) : new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0, 23, 59, 59, 999);

  const format = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const monthNames = [
    "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
    "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
  ];

  const diffMs = Math.max(0, lastDay.getTime() - now.getTime());
  const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  return {
    monthStart: format(firstDay),
    monthEnd: format(lastDay),
    monthLabel: `${monthNames[month]} ${year}`,
    daysRemaining,
    totalDays: lastDay.getDate(),
  };
}

export function selectDeterministicMonthlyTemplate(
  userId: string,
  monthStart: string
): MonthlyChallengeTemplate {
  const seed = `${userId}::monthly::${monthStart}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % MONTHLY_CHALLENGE_TEMPLATES.length;
  return MONTHLY_CHALLENGE_TEMPLATES[index];
}

const MONTHLY_STORAGE_KEY_PREFIX = "habbits_rpg_monthly_challenge_";

export async function getOrCreateMonthlyChallenge(
  userId: string,
  customDate?: Date
): Promise<MonthlyChallenge> {
  const { monthStart, monthEnd } = getCurrentMonthRange(customDate);
  const storageKey = `${MONTHLY_STORAGE_KEY_PREFIX}${userId}_${monthStart}`;

  try {
    const { data, error } = await supabase
      .from("monthly_challenges")
      .select("*")
      .eq("user_id", userId)
      .eq("month_start", monthStart)
      .maybeSingle();

    if (!error && data) {
      const challenge: MonthlyChallenge = {
        id: data.id,
        userId: data.user_id,
        monthStart: data.month_start,
        monthEnd: data.month_end,
        templateId: data.template_id,
        title: data.title,
        description: data.description,
        objectives: Array.isArray(data.objectives) ? (data.objectives as any) : [],
        completed: data.completed,
        rewardClaimed: data.reward_claimed,
        rewardXP: data.reward_xp,
        rewardCoins: data.reward_coins,
        rewardItemId: data.reward_item_id,
        createdAt: data.created_at,
        completedAt: data.completed_at,
      };
      localStorage.setItem(storageKey, JSON.stringify(challenge));
      return challenge;
    }
  } catch (err) {
    console.warn("Supabase monthly challenge fetch fallback:", err);
  }

  const cached = localStorage.getItem(storageKey);
  if (cached) {
    try {
      const parsed = JSON.parse(cached) as MonthlyChallenge;
      if (parsed.monthStart === monthStart && parsed.userId === userId) {
        return parsed;
      }
    } catch {
      // invalid cache
    }
  }

  const template = selectDeterministicMonthlyTemplate(userId, monthStart);
  const newChallenge: MonthlyChallenge = {
    id: `mc_${userId}_${monthStart}`,
    userId,
    monthStart,
    monthEnd,
    templateId: template.id,
    title: template.title,
    description: template.description,
    objectives: template.objectives.map((obj) => ({
      ...obj,
      currentValue: 0,
      completed: false,
    })),
    completed: false,
    rewardClaimed: false,
    rewardXP: template.rewardXP,
    rewardCoins: template.rewardCoins,
    rewardItemId: template.rewardItemId ?? null,
    createdAt: new Date().toISOString(),
  };

  try {
    await supabase.from("monthly_challenges").insert({
      id: newChallenge.id,
      user_id: newChallenge.userId,
      month_start: newChallenge.monthStart,
      month_end: newChallenge.monthEnd,
      template_id: newChallenge.templateId,
      title: newChallenge.title,
      description: newChallenge.description,
      objectives: newChallenge.objectives as any,
      completed: newChallenge.completed,
      reward_claimed: newChallenge.rewardClaimed,
      reward_xp: newChallenge.rewardXP,
      reward_coins: newChallenge.rewardCoins,
      reward_item_id: newChallenge.rewardItemId,
      created_at: newChallenge.createdAt,
    });
  } catch (insertErr) {
    console.warn("Supabase monthly challenge insert fallback:", insertErr);
  }

  localStorage.setItem(storageKey, JSON.stringify(newChallenge));
  return newChallenge;
}

export interface MonthlyProgressIncrements {
  questsCompleted?: number;
  xpEarned?: number;
  bossesDefeated?: number;
  perfectDays?: number;
  weeklyChallengesCompleted?: number;
  randomEventsCompleted?: number;
  statTraining?: { stat: StatName; count: number };
}

export async function updateMonthlyChallengeProgress(
  userId: string,
  increments: MonthlyProgressIncrements,
  customDate?: Date
): Promise<{
  challenge: MonthlyChallenge;
  rewardGranted: { xp: number; coins: number; itemId?: string | null } | null;
  status: MonthlyChallengeUIState;
}> {
  const challenge = await getOrCreateMonthlyChallenge(userId, customDate);
  const now = customDate ? new Date(customDate) : new Date();
  const format = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const nowStr = format(now);

  if (nowStr > challenge.monthEnd) {
    return {
      challenge,
      rewardGranted: null,
      status: "expired",
    };
  }

  let progressModified = false;
  const updatedObjectives = challenge.objectives.map((obj) => {
    let delta = 0;
    if (obj.type === "quests_completed" && increments.questsCompleted) delta = increments.questsCompleted;
    if (obj.type === "xp_earned" && increments.xpEarned) delta = increments.xpEarned;
    if (obj.type === "bosses_defeated" && increments.bossesDefeated) delta = increments.bossesDefeated;
    if (obj.type === "perfect_days" && increments.perfectDays) delta = increments.perfectDays;
    if (obj.type === "weekly_challenges_completed" && increments.weeklyChallengesCompleted) delta = increments.weeklyChallengesCompleted;
    if (obj.type === "random_events_completed" && increments.randomEventsCompleted) delta = increments.randomEventsCompleted;
    if (obj.type === "stat_training" && increments.statTraining) delta = increments.statTraining.count;

    if (delta > 0) {
      progressModified = true;
      const nextVal = Math.min(obj.targetValue, obj.currentValue + delta);
      return {
        ...obj,
        currentValue: nextVal,
        completed: nextVal >= obj.targetValue,
      };
    }
    return obj;
  });

  const allCompleted = updatedObjectives.every((obj) => obj.completed);
  let rewardGranted: { xp: number; coins: number; itemId?: string | null } | null = null;

  if (allCompleted && !challenge.completed) {
    challenge.completed = true;
    challenge.completedAt = new Date().toISOString();
    progressModified = true;
  }

  if (challenge.completed && !challenge.rewardClaimed) {
    challenge.rewardClaimed = true;
    rewardGranted = {
      xp: challenge.rewardXP,
      coins: challenge.rewardCoins,
      itemId: challenge.rewardItemId,
    };
    if (challenge.rewardItemId) {
      await addItemToInventory(userId, challenge.rewardItemId, 1);
    }
    progressModified = true;
  }

  challenge.objectives = updatedObjectives;

  if (progressModified) {
    const storageKey = `${MONTHLY_STORAGE_KEY_PREFIX}${userId}_${challenge.monthStart}`;
    localStorage.setItem(storageKey, JSON.stringify(challenge));

    try {
      await supabase
        .from("monthly_challenges")
        .update({
          objectives: challenge.objectives as any,
          completed: challenge.completed,
          reward_claimed: challenge.rewardClaimed,
          completed_at: challenge.completedAt,
        })
        .eq("id", challenge.id)
        .eq("user_id", userId);
    } catch (err) {
      console.warn("Supabase monthly challenge update error:", err);
    }
  }

  return {
    challenge,
    rewardGranted,
    status: determineMonthlyChallengeUIState(challenge),
  };
}

export function determineMonthlyChallengeUIState(
  challenge: MonthlyChallenge | null
): MonthlyChallengeUIState {
  if (!challenge) return "loading";
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const nowStr = `${y}-${m}-${d}`;

  if (challenge.completed) return "completed";
  if (nowStr > challenge.monthEnd) return "expired";
  const hasProgress = challenge.objectives.some((o) => o.currentValue > 0);
  return hasProgress ? "in_progress" : "active";
}
