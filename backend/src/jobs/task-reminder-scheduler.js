const cron = require('node-cron');
const prisma = require('../lib/prisma-client');
const { canSendToUser, buildTaskMessage, sendPushMessages, checkReceipts } = require('../services/expo-push-service');
const { getTodayRange, formatDateKey } = require('../utils/date-range-utils');

const DEFAULT_MAX_REMIND_BEFORE_MIN = 30;
let isRunning = false;

async function getMaxRemindBeforeMs() {
  const agg = await prisma.settings.aggregate({ _max: { remindBefore: true } });
  return (agg._max.remindBefore ?? DEFAULT_MAX_REMIND_BEFORE_MIN) * 60_000;
}

async function collectReminderEntries(now) {
  const horizon = new Date(now.getTime() + (await getMaxRemindBeforeMs()));

  const tasks = await prisma.task.findMany({
    where: {
      completed: false,
      remindedAt: null,
      dueAt: { gte: now, lte: horizon },
      user: { deviceToken: { not: null } },
    },
    include: { user: { include: { settings: true } } },
  });

  const entries = [];
  const taskIds = [];

  for (const task of tasks) {
    if (!canSendToUser(task.user, 'task_reminder', now)) continue;
    if (task.dueAt.getTime() > now.getTime() + task.user.settings.remindBefore * 60_000) continue;
    entries.push({ userId: task.userId, message: buildTaskMessage('task_reminder', task, task.user.deviceToken) });
    taskIds.push(task.id);
  }

  return { entries, taskIds };
}

async function collectOverdueEntries(now) {
  const todayStart = getTodayRange(now).start;

  const tasks = await prisma.task.findMany({
    where: {
      completed: false,
      dueAt: { lt: now },
      OR: [{ lastOverdueNotifiedAt: null }, { lastOverdueNotifiedAt: { lt: todayStart } }],
      user: { deviceToken: { not: null } },
    },
    include: { user: { include: { settings: true } } },
  });

  const entries = [];
  const taskIds = [];

  for (const task of tasks) {
    if (!canSendToUser(task.user, 'task_overdue', now)) continue;
    if (task.lastOverdueNotifiedAt && formatDateKey(task.lastOverdueNotifiedAt) === formatDateKey(now)) continue;
    entries.push({ userId: task.userId, message: buildTaskMessage('task_overdue', task, task.user.deviceToken) });
    taskIds.push(task.id);
  }

  return { entries, taskIds };
}

async function runTick(now = new Date()) {
  const reminder = await collectReminderEntries(now);
  const overdue = await collectOverdueEntries(now);

  const receipts = await sendPushMessages([...reminder.entries, ...overdue.entries]);

  // Chỉ đánh dấu dedupe cho task thực sự có ticket 'ok' (không phải toàn bộ taskIds thu thập
  // được) — task nằm trong 1 chunk gửi lỗi (network/Expo 5xx) sẽ không bị đánh dấu, để tick sau
  // thử gửi lại thay vì mất reminder vĩnh viễn.
  const sentReminderIds = new Set(receipts.filter((r) => r.type === 'task_reminder').map((r) => r.taskId));
  const sentOverdueIds = new Set(receipts.filter((r) => r.type === 'task_overdue').map((r) => r.taskId));
  const remindedIds = reminder.taskIds.filter((id) => sentReminderIds.has(id));
  const overdueIds = overdue.taskIds.filter((id) => sentOverdueIds.has(id));

  if (remindedIds.length) {
    await prisma.task.updateMany({ where: { id: { in: remindedIds } }, data: { remindedAt: now } });
  }
  if (overdueIds.length) {
    await prisma.task.updateMany({ where: { id: { in: overdueIds } }, data: { lastOverdueNotifiedAt: now } });
  }

  await checkReceipts(receipts);

  if (remindedIds.length || overdueIds.length) {
    console.log('[push] tick: reminder=%d overdue=%d', remindedIds.length, overdueIds.length);
  }
}

function startTaskReminderScheduler() {
  cron.schedule('* * * * *', async () => {
    if (isRunning) {
      console.warn('[push] previous tick still running, skip');
      return;
    }
    isRunning = true;
    try {
      await runTick();
    } catch (err) {
      console.error('[push] tick failed:', err);
    } finally {
      isRunning = false;
    }
  });
  console.log('[push] task reminder scheduler started (* * * * *)');
}

module.exports = { startTaskReminderScheduler, runTick };
