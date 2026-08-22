// ─────────────────────────────────────────────────────────────
// EchoSign — Global Error Handling Middleware
// ─────────────────────────────────────────────────────────────

const { HTTP_STATUS } = require('../constants');
const logger = require('../utils/logger');

/**
 * Custom operational error class.
 * Throw this from controllers/services when you want the error handler
 * to return a specific HTTP status and message to the client.
 */
class AppError extends Error {
  /**
   * @param {string} message    - Human-readable error description
   * @param {number} statusCode - HTTP status code
   * @param {Array}  errors     - Optional array of detailed error objects
   */
  constructor(message, statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, errors = null) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.isOperational = true;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Express error-handling middleware (4-argument signature).
 * Must be the LAST middleware mounted on the app.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, _next) {
  // Default to 500 if no status is set
  const statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const isOperational = err.isOperational || false;

  // Log the error — full stack in development, summary in production
  if (!isOperational || statusCode >= 500) {
    logger.error(`${err.name}: ${err.message}`, 'ErrorHandler');
    if (process.env.NODE_ENV !== 'production') {
      logger.error(err.stack, 'ErrorHandler');
    }
  } else {
    logger.warn(`${err.name}: ${err.message} [${statusCode}]`, 'ErrorHandler');
  }

  // Build response payload
  const payload = {
    success: false,
    message: isOperational ? err.message : 'An unexpected error occurred',
    timestamp: new Date().toISOString(),
  };

  // Attach detailed errors if available
  if (err.errors) {
    payload.errors = err.errors;
  }

  // Include stack trace only in development
  if (process.env.NODE_ENV !== 'production' && !isOperational) {
    payload.stack = err.stack;
  }

  return res.status(statusCode).json(payload);
}

module.exports = { AppError, errorHandler };
