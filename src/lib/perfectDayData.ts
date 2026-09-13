import { supabase } from "./supabase";
import { getTodayDateString } from "./dailyDirectivesData";
import type { DailyDirective } from "../data/dailyDirectives";
import {
  PERFECT_DAY_REWARDS,
  type PerfectDayRecord,
  type PerfectDayEvaluation,
  type PerfectDayUIState,
} from "../data/perfectDay";

const STORAGE_PREFIX = "rpg_perfect_day";

export function getCachedPerfectDay(userId: string, dateStr: string): PerfectDayRecord | null {
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

export function setCachedPerfectDay(record: PerfectDayRecord): void {
  try {
    localStorage.setItem(
      `${STORAGE_PREFIX}_${record.userId}_${record.date}`,
      JSON.stringify(record)
    );
  } catch {
    // safe fallback
  }
}

/**
 * Loads or initializes the Perfect Day record for a given user and calendar date.
 * Prioritizes Supabase source of truth so stale localStorage cannot overwrite DB.
 */
export async function getOrCreatePerfectDayRecord(
  userId: string,
  targetDate?: string
): Promise<PerfectDayRecord> {
  const dateStr = targetDate || getTodayDateString();
  const cached = getCachedPerfectDay(userId, dateStr);

  // 1. Check Supabase
  try {
    const { data, error } = await supabase
      .from("perfect_days")
      .select("*")
      .eq("user_id", userId)
      .eq("perfect_date", dateStr)
      .maybeSingle();

    if (!error && data) {
      const fromDb: PerfectDayRecord = {
        id: data.id,
        userId: data.user_id,
        date: data.perfect_date,
        earned: Boolean(data.earned),
        rewardClaimed: Boolean(data.reward_claimed),
        rewardXP: data.reward_xp,
        rewardCoins: data.reward_coins,
        createdAt: data.created_at,
        earnedAt: data.earned_at || undefined,
      };

      // Reconcile cache if DB has newer state
      if (
        !cached ||
        fromDb.earned !== cached.earned ||
        fromDb.rewardClaimed !== cached.rewardClaimed
      ) {
        setCachedPerfectDay(fromDb);
      }
      return fromDb;
    }
  } catch {
    // Safe offline fallback
  }

  // 2. Fall back to cached if valid for this date
  if (cached && cached.date === dateStr) {
    return cached;
  }

  // 3. Initialize fresh record for this date
  const newRecord: PerfectDayRecord = {
    id: `pd_${userId}_${dateStr}`,
    userId,
    date: dateStr,
    earned: false,
    rewardClaimed: false,
    rewardXP: PERFECT_DAY_REWARDS.xp,
    rewardCoins: PERFECT_DAY_REWARDS.coins,
    createdAt: new Date().toISOString(),
  };

  setCachedPerfectDay(newRecord);

  // Attempt to persist initial row to Supabase
  try {
    void supabase.from("perfect_days").insert({
      id: newRecord.id,
      user_id: userId,
      perfect_date: dateStr,
      earned: false,
      reward_claimed: false,
      reward_xp: newRecord.rewardXP,
      reward_coins: newRecord.rewardCoins,
    });
  } catch {
    // safe fallback
  }

  return newRecord;
}

/**
 * Authoritative, deterministic evaluation of Perfect Day conditions.
 * Requirements:
 * 1. Today's Daily Directive exists and belongs to current user.
 * 2. Directive date matches today's date.
 * 3. Directive completed === true.
 * 4. Directive currentValue >= targetValue.
 * 5. Directive reward has been claimed successfully.
 */
export function evaluatePerfectDay(
  userId: string,
  dateStr: string,
  directive: DailyDirective | null
): PerfectDayEvaluation {
  const missingRequirements: string[] = [];

  if (!directive) {
    missingRequirements.push("Today's Daily Directive has not been initiated");
    return {
      eligible: false,
      reason: "Missing Daily Directive",
      missingRequirements,
    };
  }

  if (directive.userId !== userId) {
    missingRequirements.push("Directive user mismatch");
  }

  if (directive.date !== dateStr) {
    missingRequirements.push("Directive is not for the specified date");
  }

  const todayStr = getTodayDateString();
  if (dateStr !== todayStr) {
    missingRequirements.push("Cannot evaluate Perfect Day for past or future dates");
  }

  if (!directive.completed) {
    missingRequirements.push("Daily Directive is not yet completed");
  }

  if (directive.currentValue < directive.targetValue) {
    missingRequirements.push("Directive target progress has not been achieved");
  }

  if (!directive.rewardClaimed) {
    missingRequirements.push("Daily Directive reward has not been claimed");
  }

  const eligible = missingRequirements.length === 0;

  return {
    eligible,
    reason: eligible
      ? "All daily objectives satisfied and directive reward claimed"
      : missingRequirements.join("; "),
    missingRequirements,
  };
}

/**
 * Determines current UI state for the Perfect Day dashboard widget.
 */
export function determinePerfectDayUIState(
  record: PerfectDayRecord | null,
  directive: DailyDirective | null
): PerfectDayUIState {
  const todayStr = getTodayDateString();

  if (record?.earned) {
    return "achieved";
  }

  if (directive && directive.date < todayStr && !record?.earned) {
    return "missed";
  }

  if (!directive || directive.currentValue === 0) {
    return "not_started";
  }

  if (directive.currentValue > 0 && !directive.completed) {
    return "in_progress";
  }

  return "not_started";
}

export interface PerfectDayProcessResult {
  record: PerfectDayRecord;
  earned: boolean;
  rewardGranted: boolean;
  reward?: {
    xp: number;
    coins: number;
  };
}

// Queue map to serialize concurrent Perfect Day evaluations per user
const userPerfectDayQueues = new Map<string, Promise<any>>();

/**
 * Event-driven evaluation and reward processing for Perfect Day.
 * Guarantees strict idempotency: reward is granted once and only once.
 */
export async function evaluateAndProcessPerfectDay(
  userId: string,
  directive: DailyDirective | null
): Promise<PerfectDayProcessResult> {
  const todayStr = getTodayDateString();
  const queueKey = `${userId}:${todayStr}`;

  const currentQueue = userPerfectDayQueues.get(queueKey) || Promise.resolve();

  const nextOperation = currentQueue.then(async () => {
    return executeEvaluateAndProcessPerfectDay(userId, directive, todayStr);
  });

  userPerfectDayQueues.set(queueKey, nextOperation.catch(() => {}));

  return nextOperation;
}

async function executeEvaluateAndProcessPerfectDay(
  userId: string,
  directive: DailyDirective | null,
  todayStr: string
): Promise<PerfectDayProcessResult> {
  const record = await getOrCreatePerfectDayRecord(userId, todayStr);

  // If already earned and claimed, strictly return without granting reward
  if (record.earned && record.rewardClaimed) {
    return {
      record,
      earned: true,
      rewardGranted: false,
    };
  }

  const evalResult = evaluatePerfectDay(userId, todayStr, directive);

  if (!evalResult.eligible) {
    return {
      record,
      earned: false,
      rewardGranted: false,
    };
  }

  // Eligible and not yet claimed! Grant Perfect Day reward
  const now = new Date().toISOString();
  const updatedRecord: PerfectDayRecord = {
    ...record,
    earned: true,
    rewardClaimed: true,
    rewardXP: PERFECT_DAY_REWARDS.xp,
    rewardCoins: PERFECT_DAY_REWARDS.coins,
    earnedAt: record.earnedAt || now,
  };

  setCachedPerfectDay(updatedRecord);

  // Persist to Supabase
  try {
    await supabase
      .from("perfect_days")
      .update({
        earned: true,
        reward_claimed: true,
        reward_xp: updatedRecord.rewardXP,
        reward_coins: updatedRecord.rewardCoins,
        earned_at: updatedRecord.earnedAt,
      })
      .eq("id", updatedRecord.id);
  } catch {
    // safe fallback
  }

  return {
    record: updatedRecord,
    earned: true,
    rewardGranted: true,
    reward: {
      xp: updatedRecord.rewardXP,
      coins: updatedRecord.rewardCoins,
    },
  };
}

/**
 * Query helper to fetch historical Perfect Day records for a user.
 */
export async function fetchHistoricalPerfectDays(
  userId: string
): Promise<PerfectDayRecord[]> {
  try {
    const { data, error } = await supabase
      .from("perfect_days")
      .select("*")
      .eq("user_id", userId)
      .order("perfect_date", { ascending: false });

    if (!error && data) {
      return data.map((row) => ({
        id: row.id,
        userId: row.user_id,
        date: row.perfect_date,
        earned: Boolean(row.earned),
        rewardClaimed: Boolean(row.reward_claimed),
        rewardXP: row.reward_xp,
        rewardCoins: row.reward_coins,
        createdAt: row.created_at,
        earnedAt: row.earned_at || undefined,
      }));
    }
  } catch {
    // safe fallback
  }
  return [];
}

/**
 * Authoritative summary for System AI queries regarding Perfect Day.
 */
export async function getPerfectDaySummaryForAI(
  userId: string,
  directive: DailyDirective | null
): Promise<{
  earnedToday: boolean;
  rewardClaimed: boolean;
  status: PerfectDayUIState;
  reason: string;
}> {
  const todayStr = getTodayDateString();
  const record = await getOrCreatePerfectDayRecord(userId, todayStr);
  const status = determinePerfectDayUIState(record, directive);
  const evaluation = evaluatePerfectDay(userId, todayStr, directive);

  return {
    earnedToday: record.earned,
    rewardClaimed: record.rewardClaimed,
    status,
    reason: evaluation.reason,
  };
}

