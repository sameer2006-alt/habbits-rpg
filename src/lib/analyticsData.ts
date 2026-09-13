import { supabase } from "./supabase";
import type { Player } from "../types/game";
import type { PlayerRecordsMap } from "./personalRecordsData";

export type AnalyticsTimeRange = "7d" | "30d" | "90d" | "all";

export interface AnalyticsSummary {
  timeRange: AnalyticsTimeRange;
  totalQuests: number;
  avgQuestsPerDay: number;
  totalXP: number;
  totalCoins: number;
  perfectDaysCount: number;
  perfectDayRate: number;
  mostActiveDayOfWeek: string;
  hasData: boolean;
  insights: string[];
}

export function computeAnalyticsSummary(
  activityRows: any[],
  timeRange: AnalyticsTimeRange,
  player?: Player,
  records: PlayerRecordsMap = {}
): AnalyticsSummary {
  if (!activityRows || activityRows.length === 0) {
    return {
      timeRange,
      totalQuests: 0,
      avgQuestsPerDay: 0,
      totalXP: 0,
      totalCoins: 0,
      perfectDaysCount: 0,
      perfectDayRate: 0,
      mostActiveDayOfWeek: "NO DATA AVAILABLE",
      hasData: false,
      insights: ["NO DATA AVAILABLE for selected period. Complete quests and daily directives to generate intelligence."],
    };
  }

  let totalQuests = 0;
  let totalXP = 0;
  let totalCoins = 0;
  let perfectDaysCount = 0;
  const dayCounts: Record<string, number> = {
    Sunday: 0, Monday: 0, Tuesday: 0, Wednesday: 0, Thursday: 0, Friday: 0, Saturday: 0
  };
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  for (const row of activityRows) {
    totalQuests += row.quests_completed || 0;
    totalXP += row.xp_earned || 0;
    totalCoins += row.coins_earned || 0;
    if (row.perfect_day_earned || row.perfect_day) perfectDaysCount++;

    const dateStr = row.activity_date || row.record_date;
    if (dateStr) {
      const d = new Date(dateStr);
      const dayName = dayNames[d.getDay()];
      dayCounts[dayName] = (dayCounts[dayName] || 0) + (row.quests_completed || 0);
    }
  }

  let bestDay = "NO DATA AVAILABLE";
  let maxQuestsOnDay = 0;
  for (const [day, count] of Object.entries(dayCounts)) {
    if (count > maxQuestsOnDay) {
      maxQuestsOnDay = count;
      bestDay = day;
    }
  }

  const daysSampled = activityRows.length;
  const avgQuestsPerDay = daysSampled > 0 ? Number((totalQuests / daysSampled).toFixed(1)) : 0;
  const perfectDayRate = daysSampled > 0 ? Math.round((perfectDaysCount / daysSampled) * 100) : 0;

  const insights: string[] = [];
  if (bestDay !== "NO DATA AVAILABLE") {
    insights.push(`Your most active day was ${bestDay} with ${maxQuestsOnDay} quests completed.`);
  }
  insights.push(`You generated ${totalXP.toLocaleString()} XP and ${totalCoins.toLocaleString()} coins across ${daysSampled} recorded days.`);
  if (perfectDaysCount > 0) {
    insights.push(`Attained ${perfectDaysCount} Perfect Days (${perfectDayRate}% consistency rate).`);
  }
  if (records?.highest_power_score) {
    insights.push(`Historical power score peak is ${records.highest_power_score.recordValue.toLocaleString()}.`);
  }
  if (player?.progress) {
    insights.push(`Current standing: Level ${player.progress.level} (Rank ${player.progress.rank}).`);
  }

  return {
    timeRange,
    totalQuests,
    avgQuestsPerDay,
    totalXP,
    totalCoins,
    perfectDaysCount,
    perfectDayRate,
    mostActiveDayOfWeek: bestDay,
    hasData: true,
    insights,
  };
}

export async function fetchPlayerAnalytics(
  userId: string,
  timeRange: AnalyticsTimeRange,
  player: Player,
  records: PlayerRecordsMap
): Promise<AnalyticsSummary> {
  const now = new Date();
  let startDate: string | null = null;

  if (timeRange === "7d") {
    const d = new Date(now);
    d.setDate(now.getDate() - 7);
    startDate = d.toISOString().split("T")[0];
  } else if (timeRange === "30d") {
    const d = new Date(now);
    d.setDate(now.getDate() - 30);
    startDate = d.toISOString().split("T")[0];
  } else if (timeRange === "90d") {
    const d = new Date(now);
    d.setDate(now.getDate() - 90);
    startDate = d.toISOString().split("T")[0];
  }

  let activityRows: any[] = [];

  try {
    let query = supabase
      .from("daily_activity_records")
      .select("*")
      .eq("user_id", userId);

    if (startDate) {
      query = query.gte("activity_date", startDate);
    }

    const { data, error } = await query.order("activity_date", { ascending: false });
    if (!error && data) {
      activityRows = data;
    }
  } catch (err) {
    console.warn("Analytics fetch fallback:", err);
  }

  return computeAnalyticsSummary(activityRows, timeRange, player, records);
}
