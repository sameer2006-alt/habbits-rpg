import { supabase } from "./supabase";
import {
  RANDOM_EVENT_TEMPLATES,
  type RandomEventInstance,
  type PlayerRandomEvent,
} from "../data/randomEvents";
import type { Quest, StatName } from "../types/game";

export type { PlayerRandomEvent, RandomEventInstance };

const STORAGE_KEY = "rpg_active_random_event";

export function getCachedRandomEvent(userId: string): RandomEventInstance | null {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
    if (raw) return JSON.parse(raw);
  } catch {
    // safe fallback
  }
  return null;
}

export function setCachedRandomEvent(event: RandomEventInstance | null, userId: string): void {
  try {
    if (!event) {
      localStorage.removeItem(`${STORAGE_KEY}_${userId}`);
    } else {
      localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(event));
    }
  } catch {
    // safe fallback
  }
}

/**
 * Loads the single active Random Event for the user.
 * Guarantees NO reroll upon refresh, reload, or page navigation.
 */
export async function getActiveRandomEvent(userId: string): Promise<RandomEventInstance | null> {
  const cached = getCachedRandomEvent(userId);
  const now = new Date();

  // 1. Fetch from Supabase
  try {
    const { data, error } = await supabase
      .from("player_random_events")
      .select("*")
      .eq("user_id", userId)
      .order("start_time", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      const fromDb: RandomEventInstance = {
        id: data.id,
        userId: data.user_id,
        templateId: data.template_id,
        eventType: data.event_type as any,
        title: data.title,
        description: data.description,
        requirementType: data.requirement_type as any,
        targetValue: data.target_value,
        targetStat: data.target_stat as StatName | undefined,
        currentValue: data.current_value,
        rewardXP: data.reward_xp,
        rewardCoins: data.reward_coins,
        rewardStat: data.reward_stat as StatName | undefined,
        rewardStatAmount: data.reward_stat_amount,
        startTime: data.start_time,
        expiryTime: data.expiry_time,
        completed: Boolean(data.completed),
        rewardClaimed: Boolean(data.reward_claimed),
        createdAt: data.created_at,
        completedAt: data.completed_at || undefined,
      };

      const isExpired = new Date(fromDb.expiryTime).getTime() <= now.getTime();

      // If active and not expired, or completed today, return it
      if (!isExpired || (!fromDb.rewardClaimed && fromDb.completed)) {
        setCachedRandomEvent(fromDb, userId);
        return fromDb;
      }
    }
  } catch {
    // safe fallback
  }

  // 2. If cached and valid, return it
  if (cached && new Date(cached.expiryTime).getTime() > now.getTime()) {
    return cached;
  }

  // 3. If no active event exists, generate a deterministic instance
  const dateStr = now.toISOString().slice(0, 10); // Deterministic per calendar day
  const seed = `${userId}_${dateStr}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
  }
  const templateIdx = Math.abs(hash) % RANDOM_EVENT_TEMPLATES.length;
  const template = RANDOM_EVENT_TEMPLATES[templateIdx];

  const startTime = now.toISOString();
  const expiryDate = new Date(now.getTime() + template.durationHours * 60 * 60 * 1000);
  const expiryTime = expiryDate.toISOString();

  const newInstance: RandomEventInstance = {
    id: `re_${userId}_${Date.now()}`,
    userId,
    templateId: template.id,
    eventType: template.type,
    title: template.title,
    description: template.description,
    requirementType: template.requirementType,
    targetValue: template.targetValue,
    targetStat: template.targetStat,
    currentValue: 0,
    rewardXP: template.rewardXP,
    rewardCoins: template.rewardCoins,
    rewardStat: template.rewardStat,
    rewardStatAmount: template.rewardStatAmount,
    startTime,
    expiryTime,
    completed: false,
    rewardClaimed: false,
    createdAt: startTime,
  };

  setCachedRandomEvent(newInstance, userId);

  try {
    void supabase.from("player_random_events").insert({
      id: newInstance.id,
      user_id: userId,
      template_id: newInstance.templateId,
      event_type: newInstance.eventType,
      title: newInstance.title,
      description: newInstance.description,
      requirement_type: newInstance.requirementType,
      target_value: newInstance.targetValue,
      target_stat: newInstance.targetStat,
      current_value: 0,
      reward_xp: newInstance.rewardXP,
      reward_coins: newInstance.rewardCoins,
      reward_stat: newInstance.rewardStat,
      reward_stat_amount: newInstance.rewardStatAmount,
      start_time: newInstance.startTime,
      expiry_time: newInstance.expiryTime,
      completed: false,
      reward_claimed: false,
    });
  } catch {
    // safe fallback
  }

  return newInstance;
}

export interface RandomEventProgressResult {
  event: RandomEventInstance | null;
  progressIncremented: boolean;
  rewardGranted: boolean;
  reward?: {
    xp: number;
    coins: number;
    stat?: StatName;
    statAmount?: number;
  };
}

export async function updateRandomEventOnQuestComplete(
  userId: string,
  quest: Quest
): Promise<RandomEventProgressResult> {
  const event = await getActiveRandomEvent(userId);
  if (!event) {
    return { event: null, progressIncremented: false, rewardGranted: false };
  }

  const now = new Date();
  if (new Date(event.expiryTime).getTime() <= now.getTime()) {
    return { event, progressIncremented: false, rewardGranted: false };
  }

  if (event.completed && event.rewardClaimed) {
    return { event, progressIncremented: false, rewardGranted: false };
  }

  let matches = false;
  if (event.requirementType === "any_quests") {
    matches = true;
  } else if (event.requirementType === "stat_quest") {
    matches = event.targetStat === quest.statReward.stat;
  }

  if (!matches) {
    return { event, progressIncremented: false, rewardGranted: false };
  }

  const nextVal = Math.min(event.targetValue, event.currentValue + 1);
  const isComplete = nextVal >= event.targetValue;
  const shouldGrant = isComplete && !event.rewardClaimed;

  const updated: RandomEventInstance = {
    ...event,
    currentValue: nextVal,
    completed: isComplete,
    rewardClaimed: event.rewardClaimed || shouldGrant,
    completedAt: isComplete && !event.completedAt ? now.toISOString() : event.completedAt,
  };

  setCachedRandomEvent(updated, userId);

  try {
    await supabase
      .from("player_random_events")
      .update({
        current_value: updated.currentValue,
        completed: updated.completed,
        reward_claimed: updated.rewardClaimed,
        completed_at: updated.completedAt,
      })
      .eq("id", updated.id);
  } catch {
    // safe fallback
  }

  let reward;
  if (shouldGrant) {
    reward = {
      xp: updated.rewardXP,
      coins: updated.rewardCoins,
      stat: updated.rewardStat,
      statAmount: updated.rewardStatAmount,
    };
  }

  return {
    event: updated,
    progressIncremented: true,
    rewardGranted: shouldGrant,
    reward,
  };
}

export { getActiveRandomEvent as getOrCreateDailyRandomEvent };
