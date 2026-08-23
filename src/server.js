// ─────────────────────────────────────────────────────────────
// EchoSign — Express.js Server Entry Point
// ─────────────────────────────────────────────────────────────
// A real-time, bidirectional Sign ↔ Speech communication bridge.
// This is the main entry point that wires together all middleware,
// routes, services, and error handling.
// ─────────────────────────────────────────────────────────────

// Load environment variables FIRST — before any other imports
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const logger = require('./utils/logger');
const { errorHandler } = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimiter');

// Route modules
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const aiRoutes = require('./routes/aiRoutes');
const signDetectionRoutes = require('./routes/signDetectionRoutes');

// AI Services (initialise clients at startup)
const geminiService = require('./services/geminiService');
const claudeService = require('./services/claudeService');

// ─────────────────────────────────────────────────────────────
// App Initialisation
// ─────────────────────────────────────────────────────────────

const app = express();
const PORT = process.env.PORT || 3000;

// ─────────────────────────────────────────────────────────────
// Global Middleware Stack
// ─────────────────────────────────────────────────────────────

// Security headers
app.use(helmet());

// CORS — allow configurable origin(s)
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400, // Pre-flight cache: 24 hours
}));

// Parse JSON request bodies (limit 10MB for multimodal inputs)
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// General rate limiting (applied to all routes)
app.use(generalLimiter);

// Request logging (development)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    logger.debug(`${req.method} ${req.originalUrl}`, 'HTTP');
    next();
  });
}

// ─────────────────────────────────────────────────────────────
// Health Check
// ─────────────────────────────────────────────────────────────

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'EchoSign API is running',
    data: {
      status: 'healthy',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: `${Math.floor(process.uptime())}s`,
      timestamp: new Date().toISOString(),
      services: {
        gemini: process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here'
          ? 'configured' : 'not configured (mock mode)',
        claude: process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'your_anthropic_api_key_here'
          ? 'configured' : 'not configured (mock mode)',
      },
    },
  });
});

// ─────────────────────────────────────────────────────────────
// API Routes
// ─────────────────────────────────────────────────────────────

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/sign-detect', signDetectionRoutes);

// ─────────────────────────────────────────────────────────────
// ISL Vocabulary Endpoint (public — for the frontend to fetch)
// ─────────────────────────────────────────────────────────────

const { ISL_VOCABULARY, ISL_VOCABULARY_FLAT } = require('./constants');

app.get('/api/vocabulary', (req, res) => {
  const { category } = req.query;

  if (category && ISL_VOCABULARY[category]) {
    return res.status(200).json({
      success: true,
      message: `ISL vocabulary for category: ${category}`,
      data: {
        category,
        signs: ISL_VOCABULARY[category],
        count: ISL_VOCABULARY[category].length,
      },
    });
  }

  return res.status(200).json({
    success: true,
    message: 'Full ISL MVP vocabulary',
    data: {
      categories: Object.keys(ISL_VOCABULARY),
      vocabulary: ISL_VOCABULARY,
      totalSigns: ISL_VOCABULARY_FLAT.length,
    },
  });
});

// ─────────────────────────────────────────────────────────────
// 404 Handler (must come after all routes)
// ─────────────────────────────────────────────────────────────

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    timestamp: new Date().toISOString(),
  });
});

// ─────────────────────────────────────────────────────────────
// Global Error Handler (must be the LAST middleware)
// ─────────────────────────────────────────────────────────────

app.use(errorHandler);

// ─────────────────────────────────────────────────────────────
// Start Server
// ─────────────────────────────────────────────────────────────

app.listen(PORT, async () => {
  // Initialise AI services
  geminiService.initialise();
  claudeService.initialise();

  // Seed database
  const authService = require('./services/authService');
  await authService.seedDemoUser();

  logger.info('═══════════════════════════════════════════════════', 'Server');
  logger.info('  EchoSign API Server', 'Server');
  logger.info(`  Port:        ${PORT}`, 'Server');
  logger.info(`  Environment: ${process.env.NODE_ENV || 'development'}`, 'Server');
  logger.info(`  CORS Origin: ${process.env.CORS_ORIGIN || '*'}`, 'Server');
  logger.info('═══════════════════════════════════════════════════', 'Server');
  logger.info('', 'Server');
  logger.info('Available endpoints:', 'Server');
  logger.info('  GET  /api/health           — Health check', 'Server');
  logger.info('  GET  /api/vocabulary       — ISL vocabulary', 'Server');
  logger.info('  POST /api/auth/register    — Register', 'Server');
  logger.info('  POST /api/auth/login       — Login', 'Server');
  logger.info('  POST /api/auth/logout      — Logout', 'Server');
  logger.info('  GET  /api/user/persona     — Get persona', 'Server');
  logger.info('  PUT  /api/user/persona     — Update persona', 'Server');
  logger.info('  GET  /api/user/personas    — List all personas', 'Server');
  logger.info('  POST /api/ai/chat          — AI chat', 'Server');
  logger.info('  POST /api/ai/gloss         — Gloss processing', 'Server');
  logger.info('  POST /api/ai/translate     — Translation', 'Server');
  logger.info('', 'Server');
});

module.exports = app;
