const { z } = require('zod');
const usersService = require('../services/users-service');

const roleSchema = z.enum(['ADMIN', 'USER']);

const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(8),
  role: roleSchema.default('USER'),
});

const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  role: roleSchema.optional(),
});

const resetPasswordSchema = z.object({
  newPassword: z.string().min(8),
});

async function list(req, res, next) {
  try {
    res.json(await usersService.listUsers());
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const data = createUserSchema.parse(req.body);
    res.status(201).json(await usersService.createUser(data));
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const data = updateUserSchema.parse(req.body);
    res.json(await usersService.updateUser(req.params.id, data));
  } catch (err) {
    next(err);
  }
}

async function resetPassword(req, res, next) {
  try {
    const { newPassword } = resetPasswordSchema.parse(req.body);
    await usersService.resetPassword(req.params.id, newPassword);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await usersService.deleteUser(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create, update, resetPassword, remove };
