const { Expo } = require('expo-server-sdk');
const prisma = require('../lib/prisma-client');
const { appTimezone } = require('../config/env-config');
const { getZonedParts } = require('../utils/date-range-utils');

const expo = new Expo();

const PUSH_TITLES = {
  task_reminder: 'Nhắc việc',
  task_overdue: 'Trễ hạn',
  task_updated: 'Cập nhật công việc',
};

const PUSH_BODIES = {
  task_reminder: (task) => `Sắp đến giờ: ${task.title}`,
  task_overdue: (task) => `Đã trễ hạn: ${task.title}`,
  task_updated: (task) => `Đã cập nhật: ${task.title}`,
};

// Cùng thuật toán isQuietHour với desktop (desktop/src/services/notification-service.ts:36-49),
// chỉ khác chỗ giờ lấy theo APP_TIMEZONE của server thay vì giờ máy client.
function isQuietHour(now, quietStart, quietEnd) {
  const { hour, minute } = getZonedParts(now, appTimezone);
  const [startH, startM] = quietStart.split(':').map(Number);
  const [endH, endM] = quietEnd.split(':').map(Number);

  if ([startH, startM, endH, endM].some((n) => Number.isNaN(n))) {
    console.warn('[push] invalid quiet-hours format, skip quiet-hours check:', quietStart, quietEnd);
    return false;
  }

  const curMinutes = hour * 60 + minute;
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  if (startMinutes <= endMinutes) {
    return curMinutes >= startMinutes && curMinutes < endMinutes;
  }
  return curMinutes >= startMinutes || curMinutes < endMinutes;
}

function canSendToUser(user, type, now) {
  if (!user || !Expo.isExpoPushToken(user.deviceToken)) return false;
  if (!user.settings) {
    console.warn('[push] user missing settings, skip:', user.id);
    return false;
  }
  if (!user.settings.push) return false;
  if (type === 'task_updated') return true;
  return !isQuietHour(now, user.settings.quietStart, user.settings.quietEnd);
}

function buildTaskMessage(type, task, deviceToken) {
  return {
    to: deviceToken,
    sound: 'default',
    title: PUSH_TITLES[type],
    body: PUSH_BODIES[type](task),
    data: { type, taskId: task.id },
  };
}

async function clearDeviceTokens(userIds) {
  if (!userIds.length) return;
  const uniqueIds = [...new Set(userIds)];
  await prisma.user.updateMany({ where: { id: { in: uniqueIds } }, data: { deviceToken: null } });
  console.warn('[push] cleared dead device tokens for %d user(s)', uniqueIds.length);
}

async function sendPushMessages(entries) {
  if (!entries.length) return [];

  const messages = entries.map((e) => e.message);
  const chunks = expo.chunkPushNotifications(messages);
  const receiptEntries = [];
  const deadUserIds = [];
  let offset = 0;

  for (const chunk of chunks) {
    let tickets;
    try {
      tickets = await expo.sendPushNotificationsAsync(chunk);
    } catch (err) {
      console.error('[push] sendPushNotificationsAsync failed:', err);
      offset += chunk.length;
      continue;
    }

    tickets.forEach((ticket, i) => {
      const entry = entries[offset + i];
      if (ticket.status === 'ok') {
        receiptEntries.push({
          receiptId: ticket.id,
          userId: entry.userId,
          taskId: entry.message.data?.taskId,
          type: entry.message.data?.type,
        });
      } else {
        console.error('[push] ticket error for user %s: %s', entry.userId, ticket.message);
        if (ticket.details?.error === 'DeviceNotRegistered') {
          deadUserIds.push(entry.userId);
        }
      }
    });

    offset += chunk.length;
  }

  await clearDeviceTokens(deadUserIds);
  return receiptEntries;
}

async function checkReceipts(receiptEntries) {
  if (!receiptEntries.length) return;

  const userIdByReceiptId = new Map(receiptEntries.map((e) => [e.receiptId, e.userId]));
  const receiptIds = receiptEntries.map((e) => e.receiptId);
  const chunks = expo.chunkPushNotificationReceiptIds(receiptIds);
  const deadUserIds = [];

  for (const chunk of chunks) {
    let receipts;
    try {
      receipts = await expo.getPushNotificationReceiptsAsync(chunk);
    } catch (err) {
      console.error('[push] getPushNotificationReceiptsAsync failed:', err);
      continue;
    }

    for (const [receiptId, receipt] of Object.entries(receipts)) {
      if (receipt.status === 'error' && receipt.details?.error === 'DeviceNotRegistered') {
        const userId = userIdByReceiptId.get(receiptId);
        if (userId) deadUserIds.push(userId);
      }
    }
  }

  await clearDeviceTokens(deadUserIds);
}

async function notifyTaskUpdated(userId, task) {
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { settings: true } });
  if (!canSendToUser(user, 'task_updated', new Date())) return;
  await sendPushMessages([{ userId, message: buildTaskMessage('task_updated', task, user.deviceToken) }]);
}

module.exports = {
  buildTaskMessage,
  canSendToUser,
  sendPushMessages,
  checkReceipts,
  notifyTaskUpdated,
  isQuietHour,
};
