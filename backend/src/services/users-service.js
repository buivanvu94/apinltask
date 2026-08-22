const prisma = require('../lib/prisma-client');
const { hashPassword } = require('../utils/password-utils');
const { revokeAllUserTokens } = require('./auth-service');

const USER_LIST_SELECT = { id: true, email: true, name: true, role: true, createdAt: true };

// Uses raw SQL with FOR UPDATE to lock the admin rows for the duration of the
// transaction, so two concurrent demote/delete requests can't both read the
// same admin count before either write commits (lost-update race).
async function assertNotLastAdmin(tx, userId) {
  const rows = await tx.$queryRaw`SELECT id, role FROM users WHERE id = ${userId} FOR UPDATE`;
  const user = rows[0];
  if (!user || user.role !== 'ADMIN') {
    return;
  }
  const countRows = await tx.$queryRaw`SELECT COUNT(*) as count FROM users WHERE role = 'ADMIN' FOR UPDATE`;
  if (Number(countRows[0].count) <= 1) {
    const error = new Error('Cannot remove the last remaining admin');
    error.status = 400;
    throw error;
  }
}

async function listUsers() {
  return prisma.user.findMany({ select: USER_LIST_SELECT });
}

async function createUser({ email, name, password, role }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const error = new Error('Email already in use');
    error.status = 409;
    throw error;
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { email, name, passwordHash, role, settings: { create: {} } },
    select: USER_LIST_SELECT,
  });
  return user;
}

async function updateUser(id, { name, role }) {
  return prisma.$transaction(async (tx) => {
    if (role === 'USER') {
      await assertNotLastAdmin(tx, id);
    }

    return tx.user.update({
      where: { id },
      data: { ...(name !== undefined && { name }), ...(role !== undefined && { role }) },
      select: USER_LIST_SELECT,
    });
  });
}

async function resetPassword(id, newPassword) {
  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({ where: { id }, data: { passwordHash } });
  await revokeAllUserTokens(id);
}

async function deleteUser(id) {
  await prisma.$transaction(async (tx) => {
    await assertNotLastAdmin(tx, id);
    await tx.user.delete({ where: { id } });
  });
}

module.exports = { listUsers, createUser, updateUser, resetPassword, deleteUser };
