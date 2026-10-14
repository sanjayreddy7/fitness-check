const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { optionalAuth } = require('../middleware/authMiddleware');

router.get('/dashboard', optionalAuth, analyticsController.getAnalytics);

module.exports = router;
