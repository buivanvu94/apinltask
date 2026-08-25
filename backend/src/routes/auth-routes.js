const express = require('express');
const authController = require('../controllers/auth-controller');
const authMiddleware = require('../middleware/auth-middleware');

const router = express.Router();

router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.get('/me', authMiddleware, authController.me);
router.patch('/me', authMiddleware, authController.updateMe);

module.exports = router;
