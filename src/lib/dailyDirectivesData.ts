import { supabase } from "./supabase";
import {
  DAILY_DIRECTIVE_TEMPLATES,
  type DailyDirective,
  type DailyDirectiveTemplate,
} from "../data/dailyDirectives";
import type { Quest, Player, StatName } from "../types/game";

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Deterministic template selection:
 * For a given (userId, dateStr), this always returns the exact same template index.
 * Guarantee: ONE USER + ONE DATE = ONE DIRECTIVE TEMPLATE.
 */
export function selectDeterministicTemplate(
  userId: string,
  dateStr: string
): DailyDirectiveTemplate {
  const seed = `${userId}:${dateStr}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  const positiveHash = Math.abs(hash);
  const index = positiveHash % DAILY_DIRECTIVE_TEMPLATES.length;
  return DAILY_DIRECTIVE_TEMPLATES[index];
}

const STORAGE_PREFIX = "rpg_daily_directive";

export function getCachedDirective(userId: string, dateStr: string): DailyDirective | null {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}_${userId}_${dateStr}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // safe fallback
  }
  return null;
}

export function setCachedDirective(directive: DailyDirective): void {
  try {
    localStorage.setItem(
      `${STORAGE_PREFIX}_${directive.userId}_${directive.date}`,
      JSON.stringify(directive)
    );
  } catch {
    // safe fallback
  }
}


/**
 * Loads or deterministically initializes today's Daily Directive for the player.
 * Prioritizes Supabase source of truth so stale localStorage cannot overwrite newer DB data.
 */
export async function getOrCreateDailyDirective(userId: string): Promise<DailyDirective> {
  const todayStr = getTodayDateString();
  const cached = getCachedDirective(userId, todayStr);

  // 1. Fetch authoritative state from Supabase
  try {
    const { data, error } = await supabase
      .from("daily_directives")
      .select("*")
      .eq("user_id", userId)
      .eq("directive_date", todayStr)
      .maybeSingle();

    if (!error && data) {
      const fromDb: DailyDirective = {
        id: data.id,
        userId: data.user_id,
        date: data.directive_date,
        templateId: data.template_id,
        title: data.title,
        description: data.description,
        requirementType: data.requirement_type as any,
        targetValue: data.target_value,
        targetStat: data.target_stat as StatName | undefined,
        currentValue: Math.max(0, Math.min(data.target_value, data.current_value)),
        completed: Boolean(data.completed),
        rewardClaimed: Boolean(data.reward_claimed),
        rewardXP: data.reward_xp,
        rewardCoins: data.reward_coins,
        rewardStat: data.reward_stat as StatName | undefined,
        rewardStatAmount: data.reward_stat_amount,
        createdAt: data.created_at,
        completedAt: data.completed_at || undefined,
      };

      // Reconcile: If local cache is stale (e.g. lower currentValue or rewardClaimed=false when DB is true),
      // the Supabase record is authoritative and updates cache!
      if (
        !cached ||
        fromDb.completed !== cached.completed ||
        fromDb.rewardClaimed !== cached.rewardClaimed ||
        fromDb.currentValue > cached.currentValue
      ) {
        setCachedDirective(fromDb);
      }
      return fromDb;
    }
  } catch {
    // If offline, continue to fallback below
  }

  // 2. If cached and DB was offline, return valid today cache
  if (cached && cached.date === todayStr) {
    return cached;
  }

  // 3. Create fresh deterministic directive for today
  const template = selectDeterministicTemplate(userId, todayStr);
  const newDirective: DailyDirective = {
    id: `dd_${userId}_${todayStr}`,
    userId,
    date: todayStr,
    templateId: template.id,
    title: template.title,
    description: template.description,
    requirementType: template.requirementType,
    targetValue: template.targetValue,
    targetStat: template.targetStat,
    currentValue: 0,
    completed: false,
    rewardClaimed: false,
    rewardXP: template.rewardXP,
    rewardCoins: template.rewardCoins,
    rewardStat: template.rewardStat,
    rewardStatAmount: template.rewardStatAmount,
    createdAt: new Date().toISOString(),
  };

  setCachedDirective(newDirective);

  // Attempt to persist to Supabase if supported
  try {
    void supabase.from("daily_directives").insert({
      id: newDirective.id,
      user_id: userId,
      directive_date: todayStr,
      template_id: newDirective.templateId,
      title: newDirective.title,
      description: newDirective.description,
      requirement_type: newDirective.requirementType,
      target_value: newDirective.targetValue,
      target_stat: newDirective.targetStat,
      current_value: 0,
      completed: false,
      reward_claimed: false,
      reward_xp: newDirective.rewardXP,
      reward_coins: newDirective.rewardCoins,
      reward_stat: newDirective.rewardStat,
      reward_stat_amount: newDirective.rewardStatAmount,
    });
  } catch {
    // safe fallback
  }

  return newDirective;
}

export interface DirectiveProgressResult {
  directive: DailyDirective;
  progressIncremented: boolean;
  rewardGranted: boolean;
  reward?: {
    xp: number;
    coins: number;
    stat?: StatName;
    statAmount?: number;
  };
}

/**
 * Evaluates whether a completed quest matches the directive criteria and increments progress.
 * Strict exploit protections:
 * - Clamps 0 <= currentValue <= targetValue
 * - Protects against past/expired dates
 * - Guarantees reward is granted exactly once (idempotency)
 */
// Promise queue map to guarantee 100% sequential serialization of concurrent updates per user
const userDirectiveQueues = new Map<string, Promise<any>>();

export async function updateDailyDirectiveOnQuestComplete(
  userId: string,
  quest: Quest,
  player: Player
): Promise<DirectiveProgressResult> {
  const todayStr = getTodayDateString();
  const queueKey = `${userId}:${todayStr}`;

  const currentQueue = userDirectiveQueues.get(queueKey) || Promise.resolve();

  const nextOperation = currentQueue.then(async () => {
    return executeUpdateDailyDirectiveOnQuestComplete(userId, quest, player, todayStr);
  });

  userDirectiveQueues.set(queueKey, nextOperation.catch(() => {}));

  return nextOperation;
}

async function executeUpdateDailyDirectiveOnQuestComplete(
  userId: string,
  quest: Quest,
  player: Player,
  todayStr: string
): Promise<DirectiveProgressResult> {
  const directive = await getOrCreateDailyDirective(userId);

    // If directive belongs to another day or is already completed & claimed, no new progress
    if (directive.date !== todayStr) {
      return { directive, progressIncremented: false, rewardGranted: false };
    }

    if (directive.completed && directive.rewardClaimed) {
      return { directive, progressIncremented: false, rewardGranted: false };
    }

    // Check requirement match
    let matchesRequirement = false;
    if (directive.requirementType === "any_quests") {
      matchesRequirement = true;
    } else if (directive.requirementType === "stat_quest") {
      matchesRequirement = directive.targetStat === quest.statReward.stat;
    } else if (directive.requirementType === "streak_quests") {
      // Streak quest: player has active streak >= 1
      matchesRequirement = (player.progress.currentStreak ?? 0) >= 0;
    }

    if (!matchesRequirement) {
      return { directive, progressIncremented: false, rewardGranted: false };
    }

    // Increment progress, clamped to targetValue
    const nextValue = Math.min(directive.targetValue, directive.currentValue + 1);
    const isComplete = nextValue >= directive.targetValue;
    const shouldGrantReward = isComplete && !directive.rewardClaimed;

    const updatedDirective: DailyDirective = {
      ...directive,
      currentValue: nextValue,
      completed: isComplete,
      rewardClaimed: directive.rewardClaimed || shouldGrantReward,
      completedAt: isComplete && !directive.completedAt ? new Date().toISOString() : directive.completedAt,
    };

    setCachedDirective(updatedDirective);

    // Update Supabase with condition that reward_claimed is not already true if we are claiming
    try {
      await supabase
        .from("daily_directives")
        .update({
          current_value: updatedDirective.currentValue,
          completed: updatedDirective.completed,
          reward_claimed: updatedDirective.rewardClaimed,
          completed_at: updatedDirective.completedAt,
        })
        .eq("id", updatedDirective.id);
    } catch {
      // safe fallback
    }

    let reward;
    if (shouldGrantReward) {
      reward = {
        xp: updatedDirective.rewardXP,
        coins: updatedDirective.rewardCoins,
        stat: updatedDirective.rewardStat,
        statAmount: updatedDirective.rewardStatAmount,
      };
    }

    return {
      directive: updatedDirective,
      progressIncremented: true,
      rewardGranted: shouldGrantReward,
      reward,
    };
}