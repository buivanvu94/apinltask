const prisma = require('../lib/prisma-client');
const { fromDbEnum } = require('../utils/enum-mapper');
const { formatDateKey } = require('../utils/date-range-utils');

async function getHistory(userId, search) {
  // Case-insensitive relies on the table's default collation (utf8mb4_*_ci);
  // MySQL/MariaDB's `contains` filter has no separate case-insensitive mode.
  const items = await prisma.task.findMany({
    where: {
      userId,
      completed: true,
      ...(search && { title: { contains: search } }),
    },
    orderBy: { completedAt: 'desc' },
  });

  return {
    totalCount: items.length,
    items: items.map((task) => ({
      id: task.id,
      title: task.title,
      category: fromDbEnum('category', task.category),
      completedAt: task.completedAt.toISOString(),
      dateKey: formatDateKey(task.completedAt),
    })),
  };
}

module.exports = { getHistory };
