import { supabase } from "./supabase";
import { getTodayDateString } from "./dailyDirectivesData";
import type {
  DailyActivityRecord,
  MonthViewData,
  CalendarDayData,
  DayStatus,
} from "../data/streakCalendar";

const STORAGE_PREFIX = "rpg_activity_record";

function getMonthBounds(year: number, month: number): { startStr: string; endStr: string } {
  const endDate = new Date(year, month + 1, 0);

  const startMonthStr = String(month + 1).padStart(2, "0");
  const endMonthStr = String(month + 1).padStart(2, "0");
  const endDayStr = String(endDate.getDate()).padStart(2, "0");

  return {
    startStr: `${year}-${startMonthStr}-01`,
    endStr: `${year}-${endMonthStr}-${endDayStr}`,
  };
}

export async function fetchMonthActivityRecords(
  userId: string,
  year: number,
  month: number
): Promise<Record<string, DailyActivityRecord>> {
  const { startStr, endStr } = getMonthBounds(year, month);
  const recordsMap: Record<string, DailyActivityRecord> = {};

  // 1. Read cached records for month
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}_${userId}_${year}_${month}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      Object.assign(recordsMap, parsed);
    }
  } catch {
    // safe fallback
  }

  // 2. Query Supabase using a single efficient range query
  try {
    const { data, error } = await supabase
      .from("daily_activity_records")
      .select("*")
      .eq("user_id", userId)
      .gte("activity_date", startStr)
      .lte("activity_date", endStr);

    if (!error && data) {
      for (const row of data) {
        recordsMap[row.activity_date] = {
          id: row.id,
          userId: row.user_id,
          date: row.activity_date,
          questsCompleted: row.quests_completed,
          directiveCompleted: Boolean(row.directive_completed),
          perfectDayEarned: Boolean(row.perfect_day_earned),
          streakCount: row.streak_count,
          xpEarned: row.xp_earned,
          coinsEarned: row.coins_earned,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        };
      }
      try {
        localStorage.setItem(
          `${STORAGE_PREFIX}_${userId}_${year}_${month}`,
          JSON.stringify(recordsMap)
        );
      } catch {
        // safe fallback
      }
    }
  } catch {
    // safe fallback
  }

  return recordsMap;
}

export async function recordDailyActivity(
  userId: string,
  delta: {
    questsIncrement?: number;
    directiveCompleted?: boolean;
    perfectDayEarned?: boolean;
    streakCount?: number;
    xpIncrement?: number;
    coinsIncrement?: number;
  }
): Promise<DailyActivityRecord> {
  const todayStr = getTodayDateString();
  const id = `dar_${userId}_${todayStr}`;
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  // Fetch current row or init
  let current: DailyActivityRecord = {
    id,
    userId,
    date: todayStr,
    questsCompleted: 0,
    directiveCompleted: false,
    perfectDayEarned: false,
    streakCount: 0,
    xpEarned: 0,
    coinsEarned: 0,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  // 1. Check local cache first
  try {
    const cacheKey = `${STORAGE_PREFIX}_${userId}_${year}_${month}`;
    const raw = localStorage.getItem(cacheKey);
    if (raw) {
      const map = JSON.parse(raw);
      if (map[todayStr]) {
        current = map[todayStr];
      }
    }
  } catch {
    // fallback
  }

  // 2. Check Supabase
  try {
    const { data } = await supabase
      .from("daily_activity_records")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (data) {
      current = {
        id: data.id,
        userId: data.user_id,
        date: data.activity_date,
        questsCompleted: data.quests_completed,
        directiveCompleted: Boolean(data.directive_completed),
        perfectDayEarned: Boolean(data.perfect_day_earned),
        streakCount: data.streak_count,
        xpEarned: data.xp_earned,
        coinsEarned: data.coins_earned,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    }
  } catch {
    // fallback
  }

  const updated: DailyActivityRecord = {
    ...current,
    questsCompleted: current.questsCompleted + (delta.questsIncrement ?? 0),
    directiveCompleted: delta.directiveCompleted ?? current.directiveCompleted,
    perfectDayEarned: delta.perfectDayEarned ?? current.perfectDayEarned,
    streakCount: delta.streakCount ?? current.streakCount,
    xpEarned: current.xpEarned + (delta.xpIncrement ?? 0),
    coinsEarned: current.coinsEarned + (delta.coinsIncrement ?? 0),
    updatedAt: new Date().toISOString(),
  };

  // Cache locally
  try {
    const cacheKey = `${STORAGE_PREFIX}_${userId}_${year}_${month}`;
    const raw = localStorage.getItem(cacheKey);
    const map = raw ? JSON.parse(raw) : {};
    map[todayStr] = updated;
    localStorage.setItem(cacheKey, JSON.stringify(map));
  } catch {
    // safe fallback
  }

  // Persist to Supabase
  try {
    await supabase.from("daily_activity_records").upsert({
      id: updated.id,
      user_id: userId,
      activity_date: updated.date,
      quests_completed: updated.questsCompleted,
      directive_completed: updated.directiveCompleted,
      perfect_day_earned: updated.perfectDayEarned,
      streak_count: updated.streakCount,
      xp_earned: updated.xpEarned,
      coins_earned: updated.coinsEarned,
      updated_at: updated.updatedAt,
    });
  } catch {
    // safe fallback
  }

  return updated;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export function generateMonthViewData(
  year: number,
  month: number,
  recordsMap: Record<string, DailyActivityRecord>
): MonthViewData {
  const todayStr = getTodayDateString();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Sun

  const days: CalendarDayData[] = [];
  let totalQuestsCompleted = 0;
  let totalPerfectDays = 0;
  let daysWithActivity = 0;

  // Leading empty days to align with day of week
  for (let i = 0; i < firstDayOfWeek; i++) {
    days.push({
      date: "",
      dayNumber: 0,
      isToday: false,
      isCurrentMonth: false,
      status: "empty",
    });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const isToday = dateStr === todayStr;
    const isFuture = dateStr > todayStr;
    const record = recordsMap[dateStr];

    let status: DayStatus = "missed";
    if (isFuture) {
      status = "future";
    } else if (record?.perfectDayEarned) {
      status = "perfect_day";
      totalPerfectDays++;
      totalQuestsCompleted += record.questsCompleted;
      daysWithActivity++;
    } else if (record && (record.questsCompleted > 0 || record.directiveCompleted)) {
      if (record.directiveCompleted || record.questsCompleted >= 3) {
        status = "completed";
      } else {
        status = "partial";
      }
      totalQuestsCompleted += record.questsCompleted;
      daysWithActivity++;
    } else if (isToday) {
      status = "partial";
    } else {
      status = "missed";
    }

    days.push({
      date: dateStr,
      dayNumber: d,
      isToday,
      isCurrentMonth: true,
      status,
      record,
    });
  }

  return {
    year,
    month,
    monthLabel: `${MONTH_NAMES[month]} ${year}`,
    days,
    totalQuestsCompleted,
    totalPerfectDays,
    daysWithActivity,
  };
}
