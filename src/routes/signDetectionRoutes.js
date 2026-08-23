/**
 * EchoSign — Sign Detection Routes
 * Bridges frontend hand landmarks → FastAPI inference service
 * Endpoints for real-time gesture recognition and translation
 */

const { Router } = require('express');
const { body } = require('express-validator');
const signDetectionController = require('../controllers/signDetectionController');
const { requireAuth } = require('../middleware/authMiddleware');
const { aiLimiter } = require('../middleware/rateLimiter');

const router = Router();

/**
 * POST /api/sign-detect/landmarks
 * Accepts hand landmarks from MediaPipe and runs inference
 * 
 * Body:
 * {
 *   hand_landmarks: [{ x, y, z }, ...],  // 21 hand landmarks from MediaPipe
 *   pose_landmarks?: [...],              // Optional pose landmarks
 *   face_landmarks?: [...],              // Optional face landmarks
 *   raw_vector?: [number],               // Optional pre-computed feature vector
 *   confidence_threshold?: 0.7           // Minimum confidence to return (default 0.7)
 * }
 * 
 * Response:
 * {
 *   success: true,
 *   gloss: "HELLO",
 *   confidence: 0.94,
 *   emoji: "👋",
 *   speech: "Hello",
 *   timestamp: "2026-08-23T12:34:56Z",
 *   all_candidates: [
 *     { gloss: "HELLO", confidence: 0.94, emoji: "👋" },
 *     { gloss: "HI", confidence: 0.78, emoji: "👋" },
 *     ...
 *   ]
 * }
 */
router.post(
  '/landmarks',
  requireAuth,
  aiLimiter,
  [
    body('hand_landmarks')
      .optional()
      .isArray({ min: 21, max: 21 })
      .withMessage('hand_landmarks must be an array of exactly 21 landmark points.'),
    body('hand_landmarks.*.x')
      .optional()
      .isFloat({ min: 0, max: 1 })
      .withMessage('Landmark x coordinate must be between 0 and 1.'),
    body('hand_landmarks.*.y')
      .optional()
      .isFloat({ min: 0, max: 1 })
      .withMessage('Landmark y coordinate must be between 0 and 1.'),
    body('hand_landmarks.*.z')
      .optional()
      .isFloat()
      .withMessage('Landmark z coordinate must be a number.'),
    body('pose_landmarks')
      .optional()
      .isArray()
      .withMessage('pose_landmarks must be an array.'),
    body('raw_vector')
      .optional()
      .isArray()
      .withMessage('raw_vector must be an array of numbers.'),
    body('confidence_threshold')
      .optional()
      .isFloat({ min: 0, max: 1 })
      .withMessage('confidence_threshold must be between 0 and 1.'),
  ],
  signDetectionController.detectFromLandmarks
);

/**
 * POST /api/sign-detect/batch
 * Process multiple frames in a batch for better accuracy
 * Useful for temporal debouncing and smoothing
 * 
 * Body:
 * {
 *   frames: [
 *     { hand_landmarks: [...], timestamp: "..." },
 *     { hand_landmarks: [...], timestamp: "..." },
 *     ...
 *   ],
 *   window_size?: 5  // Number of frames to consider (default 5)
 * }
 */
router.post(
  '/batch',
  requireAuth,
  aiLimiter,
  [
    body('frames')
      .isArray({ min: 1 })
      .withMessage('frames must be a non-empty array.'),
    body('frames.*.hand_landmarks')
      .isArray({ min: 21, max: 21 })
      .withMessage('Each frame must have exactly 21 landmarks.'),
    body('window_size')
      .optional()
      .isInt({ min: 1, max: 20 })
      .withMessage('window_size must be between 1 and 20.'),
  ],
  signDetectionController.detectFromBatch
);

/**
 * POST /api/sign-detect/to-text
 * Convert detected sign (as gloss) to English text
 * 
 * Body: { gloss: "HELLO MY NAME" }
 * Response: { text: "Hello, my name is...", confidence: 0.92 }
 */
router.post(
  '/to-text',
  requireAuth,
  aiLimiter,
  [
    body('gloss')
      .notEmpty()
      .withMessage('gloss is required.')
      .isString()
      .withMessage('gloss must be a string.')
      .isLength({ max: 500 })
      .withMessage('gloss must be 500 characters or fewer.'),
  ],
  signDetectionController.glossToText
);

/**
 * POST /api/sign-detect/to-speech
 * Convert detected sign to audio (speech output)
 * 
 * Body: { gloss: "HELLO", audio_format: "mp3" }
 * Response: { audio_url: "...", mime_type: "audio/mp3" }
 */
router.post(
  '/to-speech',
  requireAuth,
  aiLimiter,
  [
    body('gloss')
      .notEmpty()
      .withMessage('gloss is required.')
      .isString()
      .withMessage('gloss must be a string.'),
    body('audio_format')
      .optional()
      .isIn(['mp3', 'wav', 'webm'])
      .withMessage('audio_format must be mp3, wav, or webm.'),
  ],
  signDetectionController.glossToSpeech
);

/**
 * GET /api/sign-detect/vocabulary
 * Get all supported ISL glosses and their metadata
 * 
 * Response: { glosses: [{ gloss: "HELLO", emoji: "👋", category: "Greetings", ... }, ...] }
 */
router.get(
  '/vocabulary',
  requireAuth,
  signDetectionController.getVocabulary
);

/**
 * GET /api/sign-detect/health
 * Check if inference service is reachable
 * 
 * Response: { status: "healthy|unhealthy", inference_url: "...", message: "..." }
 */
router.get(
  '/health',
  signDetectionController.checkInferenceHealth
);

module.exports = router;
