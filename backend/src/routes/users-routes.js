const express = require('express');
const usersController = require('../controllers/users-controller');

const router = express.Router();

router.get('/', usersController.list);
router.post('/', usersController.create);
router.patch('/:id', usersController.update);
router.post('/:id/reset-password', usersController.resetPassword);
router.delete('/:id', usersController.remove);

module.exports = router;
