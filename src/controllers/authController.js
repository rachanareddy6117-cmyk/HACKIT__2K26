// ─────────────────────────────────────────────────────────────
// EchoSign — Authentication Controller
// ─────────────────────────────────────────────────────────────

const { validationResult } = require('express-validator');
const authService = require('../services/authService');
const { success, validationError, error } = require('../utils/apiResponse');
const { HTTP_STATUS, CREDENTIAL_TYPES } = require('../constants');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * POST /api/auth/register
 * Register a new user with persona selection.
 */
async function register(req, res, next) {
  try {
    // Validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return validationError(res, errors.array());
    }

    const { email, password, name, persona, faceId, voiceId } = req.body;

    const result = await authService.register({
      email,
      password,
      name,
      persona,
      faceId,
      voiceId,
    });

    if (result.error) {
      throw new AppError(result.error, HTTP_STATUS.CONFLICT);
    }

    logger.info(`New user registered: ${result.user.email}`, 'AuthController');

    return success(res, {
      user: result.user,
      token: result.token,
    }, 'Registration successful', HTTP_STATUS.CREATED);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/login
 * Authenticate with email, face_id, or voice_id credentials.
 */
async function login(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return validationError(res, errors.array());
    }

    const { credentialType, email, password, faceId, voiceId } = req.body;

    // Validate that the credential type is supported
    const validTypes = Object.values(CREDENTIAL_TYPES);
    if (!validTypes.includes(credentialType)) {
      throw new AppError(
        `Invalid credential type "${credentialType}". Supported types: ${validTypes.join(', ')}`,
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const result = await authService.login({
      credentialType,
      email,
      password,
      faceId,
      voiceId,
    });

    if (result.error) {
      throw new AppError(result.error, HTTP_STATUS.UNAUTHORIZED);
    }

    logger.info(`User logged in: ${result.user.id} via ${credentialType}`, 'AuthController');

    return success(res, {
      user: result.user,
      token: result.token,
      credentialType,
    }, 'Login successful');
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/logout
 * Invalidate the current session token.
 */
async function logout(req, res, next) {
  try {
    await authService.logout(req.token);
    logger.info(`User logged out: ${req.user.id}`, 'AuthController');
    return success(res, null, 'Logged out successfully');
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, logout };
