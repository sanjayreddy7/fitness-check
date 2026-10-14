const path = require('path');
require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 5000,
  JWT_SECRET: process.env.JWT_SECRET || 'ai_fitness_adventure_secret_jwt_key_2026',
  AI_PROVIDER: process.env.AI_PROVIDER || (process.env.GEMINI_API_KEY ? 'gemini' : 'heuristic'),
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*'
};
