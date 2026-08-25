const { port } = require('./config/env-config');
const app = require('./app');
const bootstrapAdmin = require('./bootstrap/bootstrap-admin');
const { startTaskReminderScheduler } = require('./jobs/task-reminder-scheduler');

async function start() {
  await bootstrapAdmin();
  startTaskReminderScheduler();
  app.listen(port, () => {
    console.log(`NLTASK backend listening on port ${port}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
