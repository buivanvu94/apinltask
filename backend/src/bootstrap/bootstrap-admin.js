const prisma = require('../lib/prisma-client');
const { hashPassword } = require('../utils/password-utils');
const { adminEmail, adminPassword, adminName } = require('../config/env-config');

async function bootstrapAdmin() {
  const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
  if (adminCount > 0) {
    return;
  }

  const passwordHash = await hashPassword(adminPassword);
  await prisma.user.create({
    data: {
      email: adminEmail,
      name: adminName,
      passwordHash,
      role: 'ADMIN',
      settings: { create: {} },
    },
  });

  console.log(`Bootstrap: created initial admin user (${adminEmail})`);
}

module.exports = bootstrapAdmin;
