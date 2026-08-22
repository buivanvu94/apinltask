const prisma = require('../lib/prisma-client');

async function getSettings(userId) {
  return prisma.settings.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });
}

async function updateSettings(userId, patch) {
  await getSettings(userId);
  return prisma.settings.update({ where: { userId }, data: patch });
}

module.exports = { getSettings, updateSettings };
