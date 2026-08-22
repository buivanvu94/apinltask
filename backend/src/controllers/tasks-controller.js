const { z } = require('zod');
const tasksService = require('../services/tasks-service');

const categoryEnum = z.enum(['work', 'personal', 'study', 'health', 'other']);
const priorityEnum = z.enum(['low', 'medium', 'high']);
const repeatEnum = z.enum(['none', 'daily', 'weekly']);

const listQuerySchema = z.object({
  scope: z.enum(['overdue', 'today', 'upcoming', 'all']).default('all'),
  category: categoryEnum.optional(),
});

const createTaskSchema = z.object({
  title: z.string().min(1),
  desc: z.string().optional(),
  category: categoryEnum.default('other'),
  priority: priorityEnum.default('medium'),
  repeat: repeatEnum.default('none'),
  location: z.string().optional(),
  dueAt: z.string().datetime(),
});

const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  desc: z.string().optional(),
  category: categoryEnum.optional(),
  priority: priorityEnum.optional(),
  repeat: repeatEnum.optional(),
  location: z.string().optional(),
  dueAt: z.string().datetime().optional(),
});

async function list(req, res, next) {
  try {
    const query = listQuerySchema.parse(req.query);
    res.json(await tasksService.listTasks(req.user.id, query));
  } catch (err) {
    next(err);
  }
}

async function summary(req, res, next) {
  try {
    res.json(await tasksService.getSummary(req.user.id));
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    res.json(await tasksService.getTaskById(req.user.id, req.params.id));
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const data = createTaskSchema.parse(req.body);
    res.status(201).json(await tasksService.createTask(req.user.id, data));
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const data = updateTaskSchema.parse(req.body);
    res.json(await tasksService.updateTask(req.user.id, req.params.id, data));
  } catch (err) {
    next(err);
  }
}

async function toggle(req, res, next) {
  try {
    res.json(await tasksService.toggleTask(req.user.id, req.params.id));
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await tasksService.deleteTask(req.user.id, req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { list, summary, getById, create, update, toggle, remove };
