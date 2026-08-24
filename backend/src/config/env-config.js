require('dotenv').config();

const REQUIRED_KEYS = ['DATABASE_URL', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET', 'ADMIN_EMAIL', 'ADMIN_PASSWORD'];

const PLACEHOLDER_VALUES = new Set(['change-me', 'change-me-too']);

for (const key of REQUIRED_KEYS) {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required env var: ${key}`);
  }
}

if (PLACEHOLDER_VALUES.has(process.env.JWT_ACCESS_SECRET) || PLACEHOLDER_VALUES.has(process.env.JWT_REFRESH_SECRET)) {
  throw new Error('JWT secrets must not use the .env.example placeholder values');
}

module.exports = {
  databaseUrl: process.env.DATABASE_URL,
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '90d',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '180d',
  adminEmail: process.env.ADMIN_EMAIL,
  adminPassword: process.env.ADMIN_PASSWORD,
  adminName: process.env.ADMIN_NAME || 'Administrator',
  appTimezone: process.env.APP_TIMEZONE || 'Asia/Ho_Chi_Minh',
  port: Number(process.env.PORT) || 4000,
};
