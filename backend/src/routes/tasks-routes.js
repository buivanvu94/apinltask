const express = require('express');
const tasksController = require('../controllers/tasks-controller');

const router = express.Router();

router.get('/summary', tasksController.summary);
router.get('/', tasksController.list);
router.get('/:id', tasksController.getById);
router.post('/', tasksController.create);
router.patch('/:id/toggle', tasksController.toggle);
router.patch('/:id', tasksController.update);
router.delete('/:id', tasksController.remove);

module.exports = router;
