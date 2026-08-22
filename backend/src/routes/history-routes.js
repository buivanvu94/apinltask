const express = require('express');
const historyController = require('../controllers/history-controller');

const router = express.Router();

router.get('/', historyController.list);

module.exports = router;
