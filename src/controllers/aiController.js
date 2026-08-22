// ─────────────────────────────────────────────────────────────
// EchoSign — AI Controller
// ─────────────────────────────────────────────────────────────
// Routes AI requests to Gemini or Claude based on the user's
// active persona. Handles chat, gloss processing, and
// bidirectional translation.
// ─────────────────────────────────────────────────────────────

const { validationResult } = require('express-validator');
const prisma = require('../config/db');
const geminiService = require('../services/geminiService');
const claudeService = require('../services/claudeService');
const { getPersona, getAIProvider } = require('../config/personas');
const { success, validationError } = require('../utils/apiResponse');
const { HTTP_STATUS, CLAUDE_PERSONAS, AI_PROVIDERS } = require('../constants');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * POST /api/ai/chat
 * Main chat endpoint — routes to Gemini or Claude based on active persona.
 *
 * Body: { message: string, mode?: string }
 *   - message: the user's text or gloss input
 *   - mode:    optional override for persona routing
 */
async function chat(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return validationError(res, errors.array());
    }

    const { message, mode } = req.body;
    const userId = req.user.id;

    // Determine which persona to use (explicit mode override or user's default)
    const activePersonaKey = mode || req.user.persona;
    const persona = getPersona(activePersonaKey);

    if (!persona) {
      throw new AppError(
        `Unknown persona mode "${activePersonaKey}".`,
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Get conversation history for this user from SQLite database (last 40 messages)
    const dbMessages = await prisma.chatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 40,
    });

    // Reverse to restore original chronological order
    const history = dbMessages.reverse().map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    // Route to the appropriate AI provider
    const provider = getAIProvider(activePersonaKey);
    let result;

    if (CLAUDE_PERSONAS.includes(activePersonaKey)) {
      logger.info(`Routing to Claude for persona: ${activePersonaKey}`, 'AIController');
      result = await claudeService.generateResponse(
        persona.systemPrompt,
        message,
        history,
      );
    } else {
      logger.info(`Routing to Gemini for persona: ${activePersonaKey}`, 'AIController');
      result = await geminiService.generateResponse(
        persona.systemPrompt,
        message,
        history,
      );
    }

    // Save user and assistant messages to database in a single transaction/createMany
    await prisma.chatMessage.createMany({
      data: [
        {
          userId,
          role: 'user',
          content: message,
          persona: activePersonaKey,
        },
        {
          userId,
          role: 'assistant',
          content: result.response,
          persona: activePersonaKey,
        },
      ],
    });

    return success(res, {
      response: result.response,
      persona: {
        key: persona.key,
        name: persona.name,
      },
      ai: {
        provider: result.provider,
        model: result.model,
      },
    }, 'AI response generated');
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/ai/gloss
 * Process an ISL gloss sequence into a natural English sentence.
 *
 * Body: { gloss: string }  OR  { signs: Array<{ gloss, confidence }> }
 */
async function processGloss(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return validationError(res, errors.array());
    }

    const { gloss, signs } = req.body;

    // Accept either a raw gloss string or structured sign objects
    let glossSequence;
    let confidenceData = null;

    if (signs && Array.isArray(signs)) {
      // Structured input with confidence scores
      glossSequence = signs.map((s) => s.gloss).join(' ');
      confidenceData = signs.map((s) => ({
        gloss: s.gloss,
        confidence: s.confidence || null,
      }));
    } else if (gloss) {
      // Raw gloss string
      glossSequence = gloss;
    } else {
      throw new AppError(
        'Provide either "gloss" (string) or "signs" (array of { gloss, confidence }).',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Use the user's persona for context, default to deaf_hoh for gloss processing
    const personaKey = req.user.persona || 'deaf_hoh';
    const persona = getPersona(personaKey);
    const systemPrompt = persona ? persona.systemPrompt : '';

    const result = await geminiService.processSignGloss(glossSequence, systemPrompt);

    return success(res, {
      ...result,
      confidenceData,
      isEmergency: _isEmergencyGloss(glossSequence),
    }, 'Gloss processed successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/ai/translate
 * Bidirectional translation between English and ISL gloss.
 *
 * Body: { text: string, direction: 'english_to_gloss' | 'gloss_to_english' }
 */
async function translate(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return validationError(res, errors.array());
    }

    const { text, direction } = req.body;

    const personaKey = req.user.persona || 'sign_learner';
    const persona = getPersona(personaKey);
    const systemPrompt = persona ? persona.systemPrompt : '';

    let result;

    if (direction === 'english_to_gloss') {
      result = await geminiService.translateToGloss(text, systemPrompt);
    } else if (direction === 'gloss_to_english') {
      result = await geminiService.processSignGloss(text, systemPrompt);
    } else {
      throw new AppError(
        `Invalid direction "${direction}". Use "english_to_gloss" or "gloss_to_english".`,
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    return success(res, {
      ...result,
      direction,
    }, 'Translation completed');
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

/**
 * Check if a gloss sequence contains emergency terms.
 * Triggers a flag so the frontend can show an alert banner.
 */
const EMERGENCY_GLOSSES = ['HELP', 'DOCTOR', 'HOSPITAL', 'EMERGENCY', 'PAIN', 'I NEED MEDICAL HELP', 'CALL AMBULANCE'];

function _isEmergencyGloss(glossSequence) {
  const upper = glossSequence.toUpperCase();
  return EMERGENCY_GLOSSES.some((eg) => upper.includes(eg));
}

module.exports = { chat, processGloss, translate };
