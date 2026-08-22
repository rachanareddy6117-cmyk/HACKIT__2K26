// ─────────────────────────────────────────────────────────────
// EchoSign — AI Routes
// ─────────────────────────────────────────────────────────────

const { Router } = require('express');
const { body } = require('express-validator');
const aiController = require('../controllers/aiController');
const { requireAuth } = require('../middleware/authMiddleware');
const { aiLimiter } = require('../middleware/rateLimiter');

const router = Router();

// All AI routes require authentication + rate limiting
router.use(requireAuth);
router.use(aiLimiter);

/**
 * POST /api/ai/chat
 * Main chat endpoint — routed to Gemini or Claude based on active persona.
 */
router.post(
  '/chat',
  [
    body('message')
      .notEmpty()
      .withMessage('message is required.')
      .isString()
      .withMessage('message must be a string.')
      .isLength({ max: 5000 })
      .withMessage('message must be 5000 characters or fewer.'),
    body('mode')
      .optional()
      .isString()
      .withMessage('mode must be a string (persona key).'),
  ],
  aiController.chat,
);

/**
 * POST /api/ai/gloss
 * Process an ISL gloss sequence into natural English.
 * Accepts either { gloss: "HELLO MY NAME" }
 * or { signs: [{ gloss: "HELLO", confidence: 0.95 }, ...] }
 */
router.post(
  '/gloss',
  [
    body('gloss')
      .optional()
      .isString()
      .withMessage('gloss must be a string.'),
    body('signs')
      .optional()
      .isArray()
      .withMessage('signs must be an array of { gloss, confidence } objects.'),
    body('signs.*.gloss')
      .optional()
      .isString()
      .withMessage('Each sign must have a gloss string.'),
    body('signs.*.confidence')
      .optional()
      .isFloat({ min: 0, max: 1 })
      .withMessage('Confidence must be a number between 0 and 1.'),
  ],
  aiController.processGloss,
);

/**
 * POST /api/ai/translate
 * Bidirectional translation between English and ISL gloss.
 */
router.post(
  '/translate',
  [
    body('text')
      .notEmpty()
      .withMessage('text is required.')
      .isString()
      .withMessage('text must be a string.')
      .isLength({ max: 2000 })
      .withMessage('text must be 2000 characters or fewer.'),
    body('direction')
      .notEmpty()
      .withMessage('direction is required.')
      .isIn(['english_to_gloss', 'gloss_to_english'])
      .withMessage('direction must be "english_to_gloss" or "gloss_to_english".'),
  ],
  aiController.translate,
);

module.exports = router;
