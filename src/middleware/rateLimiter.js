// ─────────────────────────────────────────────────────────────
// EchoSign — Rate Limiting Configurations
// ─────────────────────────────────────────────────────────────

const rateLimit = require('express-rate-limit');
const { HTTP_STATUS } = require('../constants');

/**
 * Build a rate limiter with custom settings and a structured JSON response.
 * @param {object}  opts
 * @param {number}  opts.windowMs   - Time window in milliseconds
 * @param {number}  opts.max        - Max requests per window
 * @param {string}  opts.message    - Error message when limit is hit
 */
function createLimiter({ windowMs, max, message }) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,   // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false,     // Disable `X-RateLimit-*` headers
    handler: (_req, res) => {
      res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
        success: false,
        message,
        timestamp: new Date().toISOString(),
      });
    },
  });
}

// ── Pre-built limiters ──────────────────────────────────────

/** Auth endpoints — strict (10 req / 1 min) */
const authLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 10,
  message: 'Too many authentication attempts. Please try again after 1 minute.',
});

/** AI chat endpoints — moderate (30 req / 1 min) */
const aiLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 30,
  message: 'AI request rate limit exceeded. Please slow down and try again shortly.',
});

/** General API — standard (100 req / 1 min) */
const generalLimiter = createLimiter({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
  message: 'Too many requests. Please try again later.',
});

module.exports = { authLimiter, aiLimiter, generalLimiter };
