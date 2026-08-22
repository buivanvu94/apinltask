const prisma = require('../lib/prisma-client');
const { toDbEnum, fromDbEnum } = require('../utils/enum-mapper');
const { getTodayRange } = require('../utils/date-range-utils');

function serializeTask(task) {
  return {
    id: task.id,
    title: task.title,
    desc: task.desc,
    category: fromDbEnum('category', task.category),
    priority: fromDbEnum('priority', task.priority),
    repeat: fromDbEnum('repeat', task.repeat),
    location: task.location,
    dueAt: task.dueAt.toISOString(),
    completed: task.completed,
    completedAt: task.completedAt ? task.completedAt.toISOString() : null,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}

function buildScopeWhere(scope, now) {
  const todayRange = getTodayRange(now);
  if (scope === 'overdue') {
    return { completed: false, dueAt: { lt: now } };
  }
  if (scope === 'today') {
    return { completed: false, dueAt: { gte: now, lte: todayRange.end } };
  }
  if (scope === 'upcoming') {
    return { completed: false, dueAt: { gt: todayRange.end } };
  }
  return {};
}

async function listTasks(userId, { scope = 'all', category }, now = new Date()) {
  const where = {
    userId,
    ...buildScopeWhere(scope, now),
    ...(category && { category: toDbEnum('category', category) }),
  };

  const tasks = await prisma.task.findMany({ where, orderBy: { dueAt: 'asc' } });
  return tasks.map(serializeTask);
}

async function getSummary(userId, now = new Date()) {
  const todayRange = getTodayRange(now);

  const [todayTotalCount, todayCompletedCount, overdueCount, upcomingCount] = await Promise.all([
    prisma.task.count({ where: { userId, dueAt: { gte: todayRange.start, lte: todayRange.end } } }),
    prisma.task.count({
      where: { userId, completed: true, dueAt: { gte: todayRange.start, lte: todayRange.end } },
    }),
    prisma.task.count({ where: { userId, completed: false, dueAt: { lt: now } } }),
    prisma.task.count({ where: { userId, completed: false, dueAt: { gt: todayRange.end } } }),
  ]);

  return { todayTotalCount, todayCompletedCount, overdueCount, upcomingCount };
}

async function getTaskById(userId, id) {
  const task = await prisma.task.findFirst({ where: { id, userId } });
  if (!task) {
    const error = new Error('Task not found');
    error.status = 404;
    throw error;
  }
  return serializeTask(task);
}

async function createTask(userId, data) {
  const task = await prisma.task.create({
    data: {
      userId,
      title: data.title,
      desc: data.desc,
      category: toDbEnum('category', data.category),
      priority: toDbEnum('priority', data.priority),
      repeat: toDbEnum('repeat', data.repeat),
      location: data.location,
      dueAt: new Date(data.dueAt),
    },
  });
  return serializeTask(task);
}

async function updateTask(userId, id, data) {
  const updateData = {
    ...(data.title !== undefined && { title: data.title }),
    ...(data.desc !== undefined && { desc: data.desc }),
    ...(data.category !== undefined && { category: toDbEnum('category', data.category) }),
    ...(data.priority !== undefined && { priority: toDbEnum('priority', data.priority) }),
    ...(data.repeat !== undefined && { repeat: toDbEnum('repeat', data.repeat) }),
    ...(data.location !== undefined && { location: data.location }),
    ...(data.dueAt !== undefined && { dueAt: new Date(data.dueAt) }),
  };

  const { count } = await prisma.task.updateMany({ where: { id, userId }, data: updateData });
  if (count === 0) {
    const error = new Error('Task not found');
    error.status = 404;
    throw error;
  }
  return getTaskById(userId, id);
}

async function toggleTask(userId, id) {
  const existing = await prisma.task.findFirst({ where: { id, userId } });
  if (!existing) {
    const error = new Error('Task not found');
    error.status = 404;
    throw error;
  }

  const completed = !existing.completed;
  const task = await prisma.task.update({
    where: { id },
    data: { completed, completedAt: completed ? new Date() : null },
  });
  return serializeTask(task);
}

async function deleteTask(userId, id) {
  const { count } = await prisma.task.deleteMany({ where: { id, userId } });
  if (count === 0) {
    const error = new Error('Task not found');
    error.status = 404;
    throw error;
  }
}

module.exports = {
  listTasks,
  getSummary,
  getTaskById,
  createTask,
  updateTask,
  toggleTask,
  deleteTask,
};
