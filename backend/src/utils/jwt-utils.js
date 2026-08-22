const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { jwtAccessSecret, jwtAccessExpiresIn } = require('../config/env-config');

function signAccessToken({ id, role }) {
  return jwt.sign({ sub: id, role }, jwtAccessSecret, { expiresIn: jwtAccessExpiresIn });
}

function verifyAccessToken(token) {
  const payload = jwt.verify(token, jwtAccessSecret);
  return { id: payload.sub, role: payload.role };
}

function generateRefreshToken() {
  return crypto.randomBytes(48).toString('hex');
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

module.exports = {
  signAccessToken,
  verifyAccessToken,
  generateRefreshToken,
  hashToken,
};
