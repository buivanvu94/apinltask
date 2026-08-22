const prisma = require('../lib/prisma-client');
const { fromDbEnum } = require('../utils/enum-mapper');
const { getWeekRange, formatDateKey, addZonedDays } = require('../utils/date-range-utils');

const STREAK_LOOKBACK_DAYS = 60;

async function getCompletionRateWeek(userId, weekRange) {
  const weekTasks = await prisma.task.findMany({
    where: { userId, dueAt: { gte: weekRange.start, lt: weekRange.end } },
    select: { completed: true },
  });

  if (weekTasks.length === 0) {
    return 0;
  }
  const completedCount = weekTasks.filter((t) => t.completed).length;
  return Math.round((completedCount / weekTasks.length) * 100);
}

async function getWeekBars(userId, weekRange) {
  const completed = await prisma.task.findMany({
    where: { userId, completed: true, completedAt: { gte: weekRange.start, lt: weekRange.end } },
    select: { completedAt: true },
  });

  const countsByDateKey = new Map();
  for (const task of completed) {
    const key = formatDateKey(task.completedAt);
    countsByDateKey.set(key, (countsByDateKey.get(key) || 0) + 1);
  }

  return Array.from({ length: 7 }, (_, weekdayIndex) => {
    const dayDate = addZonedDays(weekRange.start, weekdayIndex);
    const dateKey = formatDateKey(dayDate);
    return { weekdayIndex, dateKey, count: countsByDateKey.get(dateKey) || 0 };
  });
}

async function getStreakDays(userId, now) {
  const since = new Date(now.getTime() - STREAK_LOOKBACK_DAYS * 24 * 60 * 60 * 1000);
  const completed = await prisma.task.findMany({
    where: { userId, completed: true, completedAt: { gte: since } },
    select: { completedAt: true },
  });

  const completedDateKeys = new Set(completed.map((t) => formatDateKey(t.completedAt)));

  let streak = 0;
  let cursor = now;
  for (let i = 0; i < STREAK_LOOKBACK_DAYS; i += 1) {
    const key = formatDateKey(cursor);
    if (!completedDateKeys.has(key)) {
      break;
    }
    streak += 1;
    cursor = addZonedDays(cursor, -1);
  }
  return streak;
}

async function getCategoryBreakdown(userId) {
  const completed = await prisma.task.findMany({
    where: { userId, completed: true },
    select: { category: true },
  });

  const countsByCategory = new Map();
  for (const task of completed) {
    const key = fromDbEnum('category', task.category);
    countsByCategory.set(key, (countsByCategory.get(key) || 0) + 1);
  }

  const total = Math.max(1, completed.length);
  return Array.from(countsByCategory.entries()).map(([category, count]) => ({
    category,
    count,
    pct: Math.round((count / total) * 100),
  }));
}

async function getWeekStats(userId, now = new Date()) {
  const weekRange = getWeekRange(now);

  const [completionRateWeek, weekBars, streakDays, categoryBreakdown] = await Promise.all([
    getCompletionRateWeek(userId, weekRange),
    getWeekBars(userId, weekRange),
    getStreakDays(userId, now),
    getCategoryBreakdown(userId),
  ]);

  return { completionRateWeek, streakDays, weekBars, categoryBreakdown };
}

module.exports = { getWeekStats };
