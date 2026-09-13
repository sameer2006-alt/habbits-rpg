import { supabase } from "./supabase";
import {
  WEEKLY_CHALLENGE_TEMPLATES,
  type WeeklyChallenge,
  type WeeklyChallengeTemplate,
  type WeeklyObjective,
  type WeeklyChallengeUIState,
} from "../data/weeklyChallenges";
import type { StatName } from "../types/game";
import { addItemToInventory } from "./inventoryData";

export interface WeekRange {
  weekStart: string; // YYYY-MM-DD (Monday)
  weekEnd: string;   // YYYY-MM-DD (Sunday)
  expiresAt: string; // ISO string for countdown
}

/**
 * Calculates current calendar week (Monday -> Sunday).
 * Standardized across the entire application.
 */
export function getCurrentWeekRange(referenceDate: Date = new Date()): WeekRange {
  const d = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());
  const day = d.getDay(); // 0 is Sunday, 1 is Monday...
  const diffToMonday = day === 0 ? -6 : 1 - day;

  const monday = new Date(d.getFullYear(), d.getMonth(), d.getDate() + diffToMonday);
  const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  const format = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const dayStr = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${dayStr}`;
  };

  return {
    weekStart: format(monday),
    weekEnd: format(sunday),
    expiresAt: sunday.toISOString(),
  };
}

/**
 * Deterministic template selection:
 * hash(userId + ":" + weekStart) % templates.length
 * Guarantee: One user + one week = exactly one challenge template.
 */
export function selectDeterministicWeeklyTemplate(
  userId: string,
  weekStart: string
): WeeklyChallengeTemplate {
  const seed = `${userId}:${weekStart}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const positiveHash = Math.abs(hash);
  const index = positiveHash % WEEKLY_CHALLENGE_TEMPLATES.length;
  return WEEKLY_CHALLENGE_TEMPLATES[index];
}

const STORAGE_PREFIX = "rpg_weekly_challenge";

export function getCachedWeeklyChallenge(userId: string, weekStart: string): WeeklyChallenge | null {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}_${userId}_${weekStart}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // safe fallback
  }
  return null;
}

export function setCachedWeeklyChallenge(challenge: WeeklyChallenge): void {
  try {
    localStorage.setItem(
      `${STORAGE_PREFIX}_${challenge.userId}_${challenge.weekStart}`,
      JSON.stringify(challenge)
    );
  } catch {
    // safe fallback
  }
}

/**
 * Builds a fresh instance of a weekly challenge from a template.
 */
export function instantiateWeeklyChallenge(
  userId: string,
  template: WeeklyChallengeTemplate,
  weekStart: string,
  weekEnd: string
): WeeklyChallenge {
  const now = new Date().toISOString();
  const objectives: WeeklyObjective[] = template.objectives.map((obj) => ({
    id: obj.id,
    type: obj.type,
    description: obj.description,
    targetValue: obj.targetValue,
    currentValue: 0,
    completed: false,
    targetStat: obj.targetStat,
  }));

  return {
    id: `wc_${userId}_${weekStart}`,
    userId,
    weekStart,
    weekEnd,
    templateId: template.id,
    title: template.title,
    description: template.description,
    objectives,
    currentProgress: 0,
    completed: false,
    rewardClaimed: false,
    rewardXP: template.rewardXP,
    rewardCoins: template.rewardCoins,
    rewardItemId: template.rewardItemId,
    createdAt: now,
  };
}

/**
 * Calculates current progress percentage and completion status across all objectives.
 */
export function evaluateChallengeProgress(objectives: WeeklyObjective[]): {
  currentProgress: number;
  allCompleted: boolean;
} {
  if (objectives.length === 0) {
    return { currentProgress: 100, allCompleted: true };
  }

  let totalFraction = 0;
  let allCompleted = true;

  for (const obj of objectives) {
    const fraction = obj.targetValue > 0 ? Math.min(1, obj.currentValue / obj.targetValue) : 1;
    totalFraction += fraction;
    if (obj.currentValue < obj.targetValue) {
      allCompleted = false;
    }
  }

  const currentProgress = Math.min(100, Math.round((totalFraction / objectives.length) * 100));
  return { currentProgress, allCompleted };
}

/**
 * Retrieves or initializes the player's authoritative weekly challenge.
 * Multi-tier: Supabase is authoritative, local cache is synchronized.
 */
export async function getOrCreateWeeklyChallenge(
  userId: string,
  referenceDate: Date = new Date()
): Promise<WeeklyChallenge> {
  const { weekStart, weekEnd } = getCurrentWeekRange(referenceDate);
  const cached = getCachedWeeklyChallenge(userId, weekStart);

  try {
    const { data, error } = await supabase
      .from("weekly_challenges")
      .select("*")
      .eq("user_id", userId)
      .eq("week_start", weekStart)
      .maybeSingle();

    if (!error && data) {
      const dbChallenge: WeeklyChallenge = {
        id: data.id,
        userId: data.user_id,
        weekStart: data.week_start,
        weekEnd: data.week_end,
        templateId: data.template_id,
        title: data.title,
        description: data.description,
        objectives: (data.objectives as any) || [],
        currentProgress: Number(data.current_progress) || 0,
        completed: Boolean(data.completed),
        rewardClaimed: Boolean(data.reward_claimed),
        rewardXP: data.reward_xp,
        rewardCoins: data.reward_coins,
        rewardItemId: data.reward_item_id || undefined,
        createdAt: data.created_at,
        completedAt: data.completed_at || undefined,
      };

      // Stale cache reconciliation: Supabase always wins
      setCachedWeeklyChallenge(dbChallenge);
      return dbChallenge;
    }

    // No row in Supabase yet.
    // If cached already exists for this weekStart, attempt to persist to Supabase
    if (cached && cached.weekStart === weekStart) {
      await supabase.from("weekly_challenges").upsert({
        id: cached.id,
        user_id: cached.userId,
        week_start: cached.weekStart,
        week_end: cached.weekEnd,
        template_id: cached.templateId,
        title: cached.title,
        description: cached.description,
        objectives: cached.objectives as any,
        current_progress: cached.currentProgress,
        completed: cached.completed,
        reward_claimed: cached.rewardClaimed,
        reward_xp: cached.rewardXP,
        reward_coins: cached.rewardCoins,
        reward_item_id: cached.rewardItemId || null,
        created_at: cached.createdAt,
        completed_at: cached.completedAt || null,
      });
      return cached;
    }

    // Generate deterministic template
    const template = selectDeterministicWeeklyTemplate(userId, weekStart);
    const fresh = instantiateWeeklyChallenge(userId, template, weekStart, weekEnd);

    // Persist to Supabase
    const { error: insertErr } = await supabase.from("weekly_challenges").insert({
      id: fresh.id,
      user_id: fresh.userId,
      week_start: fresh.weekStart,
      week_end: fresh.weekEnd,
      template_id: fresh.templateId,
      title: fresh.title,
      description: fresh.description,
      objectives: fresh.objectives as any,
      current_progress: fresh.currentProgress,
      completed: fresh.completed,
      reward_claimed: fresh.rewardClaimed,
      reward_xp: fresh.rewardXP,
      reward_coins: fresh.rewardCoins,
      reward_item_id: fresh.rewardItemId || null,
      created_at: fresh.createdAt,
    });

    if (insertErr) {
      // If concurrent insert occurred, re-query Supabase
      const { data: retryData } = await supabase
        .from("weekly_challenges")
        .select("*")
        .eq("user_id", userId)
        .eq("week_start", weekStart)
        .maybeSingle();

      if (retryData) {
        const existing: WeeklyChallenge = {
          id: retryData.id,
          userId: retryData.user_id,
          weekStart: retryData.week_start,
          weekEnd: retryData.week_end,
          templateId: retryData.template_id,
          title: retryData.title,
          description: retryData.description,
          objectives: (retryData.objectives as any) || [],
          currentProgress: Number(retryData.current_progress) || 0,
          completed: Boolean(retryData.completed),
          rewardClaimed: Boolean(retryData.reward_claimed),
          rewardXP: retryData.reward_xp,
          rewardCoins: retryData.reward_coins,
          rewardItemId: retryData.reward_item_id || undefined,
          createdAt: retryData.created_at,
          completedAt: retryData.completed_at || undefined,
        };
        setCachedWeeklyChallenge(existing);
        return existing;
      }
    }

    setCachedWeeklyChallenge(fresh);
    return fresh;
  } catch {
    // Offline / fallback path
    if (cached && cached.weekStart === weekStart) {
      return cached;
    }
    const template = selectDeterministicWeeklyTemplate(userId, weekStart);
    const fresh = instantiateWeeklyChallenge(userId, template, weekStart, weekEnd);
    setCachedWeeklyChallenge(fresh);
    return fresh;
  }
}

export interface WeeklyProgressDelta {
  questsCompleted?: number;
  xpEarned?: number;
  coinsEarned?: number;
  bossesDefeated?: number;
  perfectDaysEarned?: number;
  statGains?: { stat: StatName; amount: number }[];
}

export interface WeeklyChallengeUpdateResult {
  challenge: WeeklyChallenge;
  rewardGranted: boolean;
  reward?: {
    xp: number;
    coins: number;
    itemId?: string;
  };
}

/**
 * Updates weekly challenge objectives from verified gameplay events.
 * Guarantees:
 * 1. Clamps progress to target values (0 <= currentValue <= targetValue).
 * 2. Multi-objective validation (challenge only completes when ALL objectives are satisfied).
 * 3. Expiration enforcement (expired challenges cannot advance or award loot).
 * 4. 100% reward idempotency (rewardClaimed = true prevents duplicate claims).
 */
export async function updateWeeklyChallengeProgress(
  userId: string,
  delta: WeeklyProgressDelta,
  referenceDate: Date = new Date()
): Promise<WeeklyChallengeUpdateResult> {
  const challenge = await getOrCreateWeeklyChallenge(userId, referenceDate);
  const now = referenceDate;

  // 1. Expiration check: If current date is past weekEnd, reject progress and rewards
  const [endY, endM, endD] = challenge.weekEnd.split("-").map(Number);
  const weekEndDate = new Date(endY, endM - 1, endD, 23, 59, 59, 999);
  if (now.getTime() > weekEndDate.getTime()) {
    return { challenge, rewardGranted: false };
  }

  const updatedObjectives = challenge.objectives.map((obj) => {
    let addValue = 0;

    switch (obj.type) {
      case "quests_completed":
        if (delta.questsCompleted) addValue += delta.questsCompleted;
        break;
      case "xp_earned":
        if (delta.xpEarned) addValue += delta.xpEarned;
        break;
      case "coins_earned":
        if (delta.coinsEarned) addValue += delta.coinsEarned;
        break;
      case "bosses_defeated":
        if (delta.bossesDefeated) addValue += delta.bossesDefeated;
        break;
      case "perfect_days":
        if (delta.perfectDaysEarned) addValue += delta.perfectDaysEarned;
        break;
      case "stat_training":
        if (delta.statGains && obj.targetStat) {
          for (const gain of delta.statGains) {
            if (gain.stat === obj.targetStat) {
              addValue += gain.amount;
            }
          }
        }
        break;
    }

    if (addValue > 0 && obj.currentValue < obj.targetValue) {
      const newValue = Math.min(obj.targetValue, obj.currentValue + addValue);
      return {
        ...obj,
        currentValue: newValue,
        completed: newValue >= obj.targetValue,
      };
    }

    return obj;
  });

  const { currentProgress, allCompleted } = evaluateChallengeProgress(updatedObjectives);

  let completedAt = challenge.completedAt;
  if (allCompleted && !challenge.completed) {
    completedAt = new Date().toISOString();
  }

  let rewardClaimed = challenge.rewardClaimed;
  let rewardGranted = false;
  let rewardInfo: { xp: number; coins: number; itemId?: string } | undefined;

  if (allCompleted && !rewardClaimed) {
    rewardClaimed = true;
    rewardGranted = true;
    rewardInfo = {
      xp: challenge.rewardXP,
      coins: challenge.rewardCoins,
      itemId: challenge.rewardItemId,
    };

    // Auto-deposit item reward into player inventory if present
    if (challenge.rewardItemId) {
      void addItemToInventory(userId, challenge.rewardItemId, 1);
    }
  }

  const updatedChallenge: WeeklyChallenge = {
    ...challenge,
    objectives: updatedObjectives,
    currentProgress,
    completed: allCompleted,
    rewardClaimed,
    completedAt,
  };

  // Synchronously update local cache
  setCachedWeeklyChallenge(updatedChallenge);

  // Persist to Supabase
  try {
    await supabase.from("weekly_challenges").upsert({
      id: updatedChallenge.id,
      user_id: updatedChallenge.userId,
      week_start: updatedChallenge.weekStart,
      week_end: updatedChallenge.weekEnd,
      template_id: updatedChallenge.templateId,
      title: updatedChallenge.title,
      description: updatedChallenge.description,
      objectives: updatedChallenge.objectives as any,
      current_progress: updatedChallenge.currentProgress,
      completed: updatedChallenge.completed,
      reward_claimed: updatedChallenge.rewardClaimed,
      reward_xp: updatedChallenge.rewardXP,
      reward_coins: updatedChallenge.rewardCoins,
      reward_item_id: updatedChallenge.rewardItemId || null,
      completed_at: updatedChallenge.completedAt || null,
    });
  } catch {
    // safe fallback
  }

  return {
    challenge: updatedChallenge,
    rewardGranted,
    reward: rewardInfo,
  };
}

/**
 * Determines current UI state for the Weekly Challenge card.
 */
export function determineWeeklyChallengeUIState(
  challenge: WeeklyChallenge | null,
  referenceDate: Date = new Date()
): WeeklyChallengeUIState {
  if (!challenge) return "loading";

  if (challenge.completed) {
    return "completed";
  }

  const [endY, endM, endD] = challenge.weekEnd.split("-").map(Number);
  const weekEndDate = new Date(endY, endM - 1, endD, 23, 59, 59, 999);
  if (referenceDate.getTime() > weekEndDate.getTime()) {
    return "expired";
  }

  if (challenge.currentProgress > 0) {
    return "in_progress";
  }

  return "active";
}
