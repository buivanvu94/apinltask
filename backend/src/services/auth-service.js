const prisma = require('../lib/prisma-client');
const { comparePassword } = require('../utils/password-utils');
const { signAccessToken, generateRefreshToken, hashToken } = require('../utils/jwt-utils');
const { jwtRefreshExpiresIn } = require('../config/env-config');

const INVALID_CREDENTIALS_MESSAGE = 'Email hoặc mật khẩu không đúng';

function parseExpiresIn(value) {
  const match = /^(\d+)([smhd])$/.exec(value);
  if (!match) {
    throw new Error(`Invalid duration format: ${value}`);
  }
  const amount = Number(match[1]);
  const unitMs = { s: 1000, m: 60 * 1000, h: 60 * 60 * 1000, d: 24 * 60 * 60 * 1000 }[match[2]];
  return amount * unitMs;
}

async function issueRefreshToken(userId) {
  const refreshToken = generateRefreshToken();
  const expiresAt = new Date(Date.now() + parseExpiresIn(jwtRefreshExpiresIn));
  await prisma.refreshToken.create({
    data: { userId, tokenHash: hashToken(refreshToken), expiresAt },
  });
  return refreshToken;
}

async function login(email, password) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const error = new Error(INVALID_CREDENTIALS_MESSAGE);
    error.status = 401;
    throw error;
  }

  const passwordMatches = await comparePassword(password, user.passwordHash);
  if (!passwordMatches) {
    const error = new Error(INVALID_CREDENTIALS_MESSAGE);
    error.status = 401;
    throw error;
  }

  const accessToken = signAccessToken({ id: user.id, role: user.role });
  const refreshToken = await issueRefreshToken(user.id);

  return {
    accessToken,
    refreshToken,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  };
}

async function refresh(refreshToken) {
  const tokenHash = hashToken(refreshToken);
  const record = await prisma.refreshToken.findUnique({ where: { tokenHash } });

  if (!record || record.revokedAt || record.expiresAt < new Date()) {
    const error = new Error('Invalid refresh token');
    error.status = 401;
    throw error;
  }

  const revoked = await prisma.refreshToken.updateMany({
    where: { id: record.id, revokedAt: null },
    data: { revokedAt: new Date() },
  });
  if (revoked.count === 0) {
    // Lost the race to another concurrent refresh using the same token — reject both.
    const error = new Error('Invalid refresh token');
    error.status = 401;
    throw error;
  }

  const user = await prisma.user.findUnique({ where: { id: record.userId } });
  const accessToken = signAccessToken({ id: user.id, role: user.role });
  const newRefreshToken = await issueRefreshToken(user.id);

  return { accessToken, refreshToken: newRefreshToken };
}

async function logout(refreshToken) {
  const tokenHash = hashToken(refreshToken);
  await prisma.refreshToken.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

async function revokeAllUserTokens(userId) {
  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

module.exports = {
  login,
  refresh,
  logout,
  revokeAllUserTokens,
};
