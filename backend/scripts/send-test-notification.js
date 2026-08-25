// Bắn 1 push thật tới TEST_DEVICE_TOKEN để xác nhận credentials + thiết bị nhận được,
// trước khi tin cron logic đúng. Không đụng DB, không chạy cron.
// Chạy trong backend/:  node scripts/send-test-notification.js task_overdue
const { buildTaskMessage, sendPushMessages } = require('../src/services/expo-push-service');

const TEST_DEVICE_TOKEN = 'ExponentPushToken[REPLACE_ME]';
const TYPES = ['task_reminder', 'task_overdue', 'task_updated'];

const type = process.argv[2];

if (!TYPES.includes(type)) {
  console.log(`Usage: node scripts/send-test-notification.js <${TYPES.join('|')}>`);
  process.exit(1);
}

if (TEST_DEVICE_TOKEN.includes('REPLACE_ME')) {
  console.log('Dán Expo push token thật của thiết bị vào TEST_DEVICE_TOKEN trong file này trước khi chạy.');
  process.exit(1);
}

const message = buildTaskMessage(type, { id: 'test-task-id', title: 'Task test' }, TEST_DEVICE_TOKEN);

sendPushMessages([{ userId: 'test-user', message }])
  .then((result) => {
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
