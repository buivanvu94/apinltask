const { z } = require('zod');
const settingsService = require('../services/settings-service');

const updateSchema = z
  .object({
    push: z.boolean(),
    sound: z.boolean(),
    vibrate: z.boolean(),
    remindBefore: z.union([z.literal(0), z.literal(5), z.literal(15), z.literal(30)]),
    snooze: z.union([z.literal(5), z.literal(10), z.literal(15), z.literal(20)]),
    quietStart: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
    quietEnd: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  })
  .partial();

async function get(req, res, next) {
  try {
    res.json(await settingsService.getSettings(req.user.id));
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const patch = updateSchema.parse(req.body);
    res.json(await settingsService.updateSettings(req.user.id, patch));
  } catch (err) {
    next(err);
  }
}

module.exports = { get, update };
