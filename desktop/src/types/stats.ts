import { TaskCategory } from './task';

export interface DayBarData {
  weekdayIndex: number; // 0 = Mon, ..., 6 = Sun
  dateKey: string;      // YYYY-MM-DD
  count: number;
}

export interface CategoryStat {
  category: TaskCategory;
  count: number;
  pct: number;
}

export interface WeekStats {
  completionRateWeek: number;
  streakDays: number;
  weekBars: DayBarData[];
  categoryBreakdown: CategoryStat[];
}
