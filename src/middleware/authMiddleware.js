// ─────────────────────────────────────────────────────────────
// EchoSign — Authentication Middleware
// ─────────────────────────────────────────────────────────────
// Validates bearer tokens on protected routes and attaches
// the authenticated user object to req.user.
// ─────────────────────────────────────────────────────────────

const { AppError } = require('./errorHandler');
const { HTTP_STATUS } = require('../constants');
const authService = require('../services/authService');
const logger = require('../utils/logger');

/**
 * Middleware: require a valid bearer token.
 * Extracts the token from the Authorization header,
 * looks up the session, and attaches the user to req.user.
 */
async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(
        'Authentication required. Please provide a valid Bearer token.',
        HTTP_STATUS.UNAUTHORIZED,
      );
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new AppError(
        'Authentication token is malformed.',
        HTTP_STATUS.UNAUTHORIZED,
      );
    }

    // Look up the session by token
    const session = await authService.getSession(token);

    if (!session) {
      throw new AppError(
        'Invalid or expired authentication token.',
        HTTP_STATUS.UNAUTHORIZED,
      );
    }

    // Look up the full user record
    const user = await authService.getUserById(session.userId);

    if (!user) {
      throw new AppError(
        'User associated with this token no longer exists.',
        HTTP_STATUS.UNAUTHORIZED,
      );
    }

    // Attach user (without password) to the request
    const { password, ...safeUser } = user;
    req.user = safeUser;
    req.token = token;

    logger.debug(`Authenticated user: ${user.id} (${user.email || user.id})`, 'Auth');
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { requireAuth };
