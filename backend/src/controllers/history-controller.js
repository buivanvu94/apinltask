const { z } = require('zod');
const historyService = require('../services/history-service');

const querySchema = z.object({ search: z.string().optional() });

async function list(req, res, next) {
  try {
    const { search } = querySchema.parse(req.query);
    res.json(await historyService.getHistory(req.user.id, search));
  } catch (err) {
    next(err);
  }
}

module.exports = { list };
