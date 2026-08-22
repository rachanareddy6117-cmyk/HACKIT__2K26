// ─────────────────────────────────────────────────────────────
// EchoSign — User / Persona Routes
// ─────────────────────────────────────────────────────────────

const { Router } = require('express');
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const { requireAuth } = require('../middleware/authMiddleware');
const { PERSONA_KEYS } = require('../constants');

const router = Router();

// All user routes require authentication
router.use(requireAuth);

/**
 * GET /api/user/persona
 * Get the current user's active persona configuration.
 */
router.get('/persona', userController.getUserPersona);

/**
 * PUT /api/user/persona
 * Switch the user's active persona/mode.
 */
router.put(
  '/persona',
  [
    body('persona')
      .notEmpty()
      .withMessage('persona key is required.')
      .isIn(Object.values(PERSONA_KEYS))
      .withMessage(`persona must be one of: ${Object.values(PERSONA_KEYS).join(', ')}`),
  ],
  userController.updateUserPersona,
);

/**
 * GET /api/user/personas
 * List all available personas (no auth technically needed,
 * but kept behind auth for consistency).
 */
router.get('/personas', userController.getAllPersonas);

module.exports = router;
