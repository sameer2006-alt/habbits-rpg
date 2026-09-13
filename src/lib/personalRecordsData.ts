import { supabase } from "./supabase";

// High-Water Mark Records (strictly monotonic non-decreasing)
export type TruePersonalRecordType =
  | "longest_streak"
  | "highest_power_score"
  | "most_quests_one_day"
  | "most_xp_one_day"
  | "most_coins_one_day"
  | "highest_season_level";

// Cumulative Lifetime Statistics (cumulative counters)
export type LifetimeStatType =
  | "total_quests_completed"
  | "total_xp_earned"
  | "total_bosses_defeated"
  | "total_perfect_days"
  | "weekly_challenges_completed"
  | "monthly_challenges_completed"
  | "total_seasons_completed";

export type PersonalRecordType = TruePersonalRecordType | LifetimeStatType;

export type RecordOrStatType = PersonalRecordType | string;

export interface PersonalRecord {
  id: string;
  userId: string;
  recordType: PersonalRecordType;
  recordValue: number;
  recordedAt: string;
  metadata?: Record<string, any>;
}

export type PlayerRecordsMap = Partial<Record<PersonalRecordType, PersonalRecord>>;

const RECORDS_STORAGE_KEY_PREFIX = "habbits_rpg_player_records_";

export async function getPersonalRecords(userId: string): Promise<PlayerRecordsMap> {
  const storageKey = `${RECORDS_STORAGE_KEY_PREFIX}${userId}`;
  const recordsMap: PlayerRecordsMap = {};

  try {
    const { data, error } = await supabase
      .from("player_records")
      .select("*")
      .eq("user_id", userId);

    if (!error && data && Array.isArray(data)) {
      for (const row of data) {
        recordsMap[row.record_type as PersonalRecordType] = {
          id: row.id,
          userId: row.user_id,
          recordType: row.record_type as PersonalRecordType,
          recordValue: Number(row.record_value),
          recordedAt: row.recorded_at,
          metadata: row.metadata as Record<string, any>,
        };
      }
      localStorage.setItem(storageKey, JSON.stringify(recordsMap));
      return recordsMap;
    }
  } catch (err) {
    console.warn("Supabase personal records fetch fallback:", err);
  }

  const cached = localStorage.getItem(storageKey);
  if (cached) {
    try {
      return JSON.parse(cached) as PlayerRecordsMap;
    } catch {
      // invalid cache
    }
  }

  return recordsMap;
}

export async function updatePersonalRecords(
  userId: string,
  updates: Partial<Record<PersonalRecordType, number>>
): Promise<PlayerRecordsMap> {
  const currentMap = await getPersonalRecords(userId);
  let modified = false;

  for (const [key, value] of Object.entries(updates)) {
    if (value === undefined || isNaN(value)) continue;
    const recType = key as PersonalRecordType;
    const existing = currentMap[recType]?.recordValue ?? 0;

    // High-water mark rule: Only update if strictly higher!
    if (value > existing) {
      modified = true;
      const rec: PersonalRecord = {
        id: `rec_${userId}_${recType}`,
        userId,
        recordType: recType,
        recordValue: value,
        recordedAt: new Date().toISOString(),
      };
      currentMap[recType] = rec;

      try {
        await supabase
          .from("player_records")
          .upsert({
            id: rec.id,
            user_id: rec.userId,
            record_type: rec.recordType,
            record_value: rec.recordValue,
            recorded_at: rec.recordedAt,
            metadata: {},
          });
      } catch (err) {
        console.warn(`Supabase record update error for ${recType}:`, err);
      }
    }
  }

  if (modified) {
    const storageKey = `${RECORDS_STORAGE_KEY_PREFIX}${userId}`;
    localStorage.setItem(storageKey, JSON.stringify(currentMap));
  }

  return currentMap;
}

export async function updateLifetimeStats(
  userId: string,
  updates: Partial<Record<LifetimeStatType, number>>
): Promise<PlayerRecordsMap> {
  const currentMap = await getPersonalRecords(userId);
  let modified = false;

  for (const [key, value] of Object.entries(updates)) {
    if (value === undefined || isNaN(value)) continue;
    const statType = key as LifetimeStatType;

    modified = true;
    const rec: PersonalRecord = {
      id: `stat_${userId}_${statType}`,
      userId,
      recordType: statType,
      recordValue: value,
      recordedAt: new Date().toISOString(),
    };
    currentMap[statType] = rec;

    try {
      await supabase
        .from("player_records")
        .upsert({
          id: rec.id,
          user_id: rec.userId,
          record_type: rec.recordType,
          record_value: rec.recordValue,
          recorded_at: rec.recordedAt,
          metadata: {},
        });
    } catch (err) {
      console.warn(`Supabase lifetime stat update error for ${statType}:`, err);
    }
  }

  if (modified) {
    const storageKey = `${RECORDS_STORAGE_KEY_PREFIX}${userId}`;
    localStorage.setItem(storageKey, JSON.stringify(currentMap));
  }

  return currentMap;
}

export function getDerivedRecordsAndStats(
  records: PlayerRecordsMap,
  player?: { progress?: { currentStreak?: number; bestStreak?: number; tasksCompleted?: number; totalXP?: number; lifetimeBossKills?: number } },
  livePowerScore?: number
) {
  const longestStreak = Math.max(
    records.longest_streak?.recordValue ?? 0,
    player?.progress?.bestStreak ?? 0,
    player?.progress?.currentStreak ?? 0
  );

  const highestPower = Math.max(
    records.highest_power_score?.recordValue ?? 0,
    livePowerScore ?? 0
  );

  const totalQuests = Math.max(
    records.total_quests_completed?.recordValue ?? 0,
    player?.progress?.tasksCompleted ?? 0
  );

  const totalXP = Math.max(
    records.total_xp_earned?.recordValue ?? 0,
    player?.progress?.totalXP ?? 0
  );

  const totalBosses = Math.max(
    records.total_bosses_defeated?.recordValue ?? 0,
    player?.progress?.lifetimeBossKills ?? 0
  );

  return {
    personalRecords: {
      longest_streak: longestStreak,
      highest_power_score: highestPower,
      most_quests_one_day: records.most_quests_one_day?.recordValue ?? 0,
      most_xp_one_day: records.most_xp_one_day?.recordValue ?? 0,
      most_coins_one_day: records.most_coins_one_day?.recordValue ?? 0,
      highest_season_level: records.highest_season_level?.recordValue ?? 0,
    },
    lifetimeStats: {
      total_quests_completed: totalQuests,
      total_xp_earned: totalXP,
      total_bosses_defeated: totalBosses,
      total_perfect_days: records.total_perfect_days?.recordValue ?? 0,
      weekly_challenges_completed: records.weekly_challenges_completed?.recordValue ?? 0,
      monthly_challenges_completed: records.monthly_challenges_completed?.recordValue ?? 0,
      total_seasons_completed: records.total_seasons_completed?.recordValue ?? 0,
    },
  };
}
