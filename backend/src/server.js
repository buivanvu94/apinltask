const { port } = require('./config/env-config');
const app = require('./app');
const bootstrapAdmin = require('./bootstrap/bootstrap-admin');

async function start() {
  await bootstrapAdmin();
  app.listen(port, () => {
    console.log(`NLTASK backend listening on port ${port}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
