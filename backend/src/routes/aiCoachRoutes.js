const express = require('express');
const router = express.Router();
const aiCoachController = require('../controllers/aiCoachController');
const { optionalAuth } = require('../middleware/authMiddleware');

router.post('/chat', optionalAuth, aiCoachController.chat);
router.get('/history', optionalAuth, aiCoachController.getChatHistory);
router.get('/tips', aiCoachController.getQuickTips);

module.exports = router;
