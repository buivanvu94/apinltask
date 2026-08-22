const express = require('express');
const statsController = require('../controllers/stats-controller');

const router = express.Router();

router.get('/week', statsController.week);

module.exports = router;
