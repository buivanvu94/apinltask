const statsService = require('../services/stats-service');

async function week(req, res, next) {
  try {
    res.json(await statsService.getWeekStats(req.user.id));
  } catch (err) {
    next(err);
  }
}

module.exports = { week };
