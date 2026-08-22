const express = require('express');
const authRoutes = require('./routes/auth-routes');
const usersRoutes = require('./routes/users-routes');
const tasksRoutes = require('./routes/tasks-routes');
const historyRoutes = require('./routes/history-routes');
const statsRoutes = require('./routes/stats-routes');
const settingsRoutes = require('./routes/settings-routes');
const authMiddleware = require('./middleware/auth-middleware');
const requireAdminMiddleware = require('./middleware/require-admin-middleware');
const errorHandler = require('./middleware/error-handler');

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', authMiddleware, requireAdminMiddleware, usersRoutes);
app.use('/api/tasks', authMiddleware, tasksRoutes);
app.use('/api/history', authMiddleware, historyRoutes);
app.use('/api/stats', authMiddleware, statsRoutes);
app.use('/api/settings', authMiddleware, settingsRoutes);

app.use(errorHandler);

module.exports = app;
