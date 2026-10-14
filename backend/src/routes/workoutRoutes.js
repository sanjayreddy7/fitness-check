const express = require('express');
const router = express.Router();
const workoutController = require('../controllers/workoutController');
const { authMiddleware, optionalAuth } = require('../middleware/authMiddleware');

router.post('/generate-plan', optionalAuth, workoutController.generatePlan);
router.post('/log', authMiddleware, workoutController.logWorkout);
router.get('/history', authMiddleware, workoutController.getHistory);
router.get('/exercises', workoutController.getExerciseLibrary);

module.exports = router;
