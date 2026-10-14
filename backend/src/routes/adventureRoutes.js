const express = require('express');
const router = express.Router();
const adventureController = require('../controllers/adventureController');
const { authMiddleware, optionalAuth } = require('../middleware/authMiddleware');

router.get('/worlds', optionalAuth, adventureController.getWorlds);
router.get('/missions', optionalAuth, adventureController.getMissions);
router.post('/missions/:missionId/swap', optionalAuth, adventureController.swapMission);
router.post('/missions/:missionId/complete', authMiddleware, adventureController.completeMission);
router.get('/achievements', optionalAuth, adventureController.getAchievements);

module.exports = router;
