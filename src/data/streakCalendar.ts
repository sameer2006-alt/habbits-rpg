export interface DailyActivityRecord {
  id: string; // `dar_${userId}_${date}`
  userId: string;
  date: string; // YYYY-MM-DD
  questsCompleted: number;
  directiveCompleted: boolean;
  perfectDayEarned: boolean;
  streakCount: number;
  xpEarned: number;
  coinsEarned: number;
  createdAt: string;
  updatedAt: string;
}

export type DayStatus = "perfect_day" | "completed" | "partial" | "missed" | "future" | "empty";

export interface CalendarDayData {
  date: string; // YYYY-MM-DD
  dayNumber: number;
  isToday: boolean;
  isCurrentMonth: boolean;
  status: DayStatus;
  record?: DailyActivityRecord;
}

export interface MonthViewData {
  year: number;
  month: number; // 0-indexed (0 = Jan, 8 = Sep)
  monthLabel: string;
  days: CalendarDayData[];
  totalQuestsCompleted: number;
  totalPerfectDays: number;
  daysWithActivity: number;
}

