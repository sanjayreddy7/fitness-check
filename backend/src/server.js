const express = require('express');
const cors = require('cors');
const { PORT, CORS_ORIGIN, AI_PROVIDER, GEMINI_API_KEY } = require('./config/env');

const authRoutes = require('./routes/authRoutes');
const workoutRoutes = require('./routes/workoutRoutes');
const adventureRoutes = require('./routes/adventureRoutes');
const aiCoachRoutes = require('./routes/aiCoachRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

const app = express();

// Middlewares
app.use(cors({
  origin: CORS_ORIGIN === '*' ? true : CORS_ORIGIN,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request Logger (Development / Viva observation)
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (process.env.NODE_ENV !== 'test') {
      console.log(`[${new Date().toISOString().split('T')[1].slice(0, 8)}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/adventure', adventureRoutes);
app.use('/api/ai-coach', aiCoachRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health Check & Diagnostic Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'AI Fitness Adventure API',
    version: '2.0.0',
    aiProvider: GEMINI_API_KEY ? 'gemini-1.5-flash' : 'intelligent_heuristic_fallback',
    computerVisionSupported: true,
    features: [
      'ai_personalized_workout_generator',
      'adventure_world_map_engine',
      'computer_vision_pose_estimation',
      'conversational_coach_nova',
      'gamified_leveling_and_achievements',
      'safety_and_pain_guardrails'
    ]
  });
});

// 404 Handler for undefined API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.method} ${req.originalUrl} not found.`
  });
});

// Central Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'An unexpected internal server error occurred.'
  });
});

// Start Server (only when run directly)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log('======================================================');
    console.log(`🔥 AI Fitness Adventure API Server running on port ${PORT}`);
    console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`🤖 AI Provider: ${GEMINI_API_KEY ? 'Gemini 1.5' : 'Heuristic Engine (Local)'}`);
    console.log('======================================================');
  });
}

module.exports = app;
