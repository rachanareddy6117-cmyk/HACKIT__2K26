// ─────────────────────────────────────────────────────────────
// EchoSign — Authentication Routes
// ─────────────────────────────────────────────────────────────

const { Router } = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { requireAuth } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');
const { PERSONA_KEYS } = require('../constants');

const router = Router();

// Apply rate limiting to all auth routes
router.use(authLimiter);

/**
 * POST /api/auth/register
 * Create a new user account.
 */
router.post(
  '/register',
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('A valid email address is required.'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters.'),
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required.')
      .isLength({ max: 100 })
      .withMessage('Name must be 100 characters or fewer.'),
    body('persona')
      .optional()
      .isIn(Object.values(PERSONA_KEYS))
      .withMessage(`Persona must be one of: ${Object.values(PERSONA_KEYS).join(', ')}`),
    body('faceId')
      .optional()
      .isString()
      .withMessage('Face ID must be a string token.'),
    body('voiceId')
      .optional()
      .isString()
      .withMessage('Voice ID must be a string token.'),
  ],
  authController.register,
);

/**
 * POST /api/auth/login
 * Authenticate with email, face_id, or voice_id.
 */
router.post(
  '/login',
  [
    body('credentialType')
      .notEmpty()
      .withMessage('credentialType is required (email, face_id, or voice_id).'),
    body('email')
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage('A valid email address is required for email login.'),
    body('password')
      .optional()
      .isString(),
    body('faceId')
      .optional()
      .isString(),
    body('voiceId')
      .optional()
      .isString(),
  ],
  authController.login,
);

/**
 * POST /api/auth/logout
 * Invalidate the current session (requires auth).
 */
router.post('/logout', requireAuth, authController.logout);

module.exports = router;
