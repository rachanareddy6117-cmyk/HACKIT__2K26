// ─────────────────────────────────────────────────────────────
// EchoSign — User / Persona Controller
// ─────────────────────────────────────────────────────────────

const { validationResult } = require('express-validator');
const authService = require('../services/authService');
const { getPersona, listPersonas, getAIProvider } = require('../config/personas');
const { success, validationError } = require('../utils/apiResponse');
const { HTTP_STATUS, PERSONA_KEYS } = require('../constants');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * GET /api/user/persona
 * Get the current user's active persona configuration.
 */
async function getUserPersona(req, res, next) {
  try {
    const { persona: personaKey } = req.user;

    const personaConfig = getPersona(personaKey);

    if (!personaConfig) {
      throw new AppError(
        `Persona "${personaKey}" not found. This should not happen — please contact support.`,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }

    // Return the persona config WITHOUT the full system prompt (it's internal)
    const { systemPrompt, ...publicConfig } = personaConfig;

    return success(res, {
      currentPersona: publicConfig,
      aiProvider: getAIProvider(personaKey),
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
      },
    }, 'Persona retrieved successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/user/persona
 * Update the user's active persona/mode.
 */
async function updateUserPersona(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return validationError(res, errors.array());
    }

    const { persona: newPersonaKey } = req.body;

    // Validate persona key exists
    const validKeys = Object.values(PERSONA_KEYS);
    if (!validKeys.includes(newPersonaKey)) {
      throw new AppError(
        `Invalid persona key "${newPersonaKey}". Valid options: ${validKeys.join(', ')}`,
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Update the user's persona
    const updatedUser = await authService.updateUserPersona(req.user.id, newPersonaKey);

    if (!updatedUser) {
      throw new AppError('Failed to update persona.', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }

    const personaConfig = getPersona(newPersonaKey);
    const { systemPrompt, ...publicConfig } = personaConfig;

    logger.info(`User ${req.user.id} switched to persona: ${newPersonaKey}`, 'UserController');

    return success(res, {
      currentPersona: publicConfig,
      aiProvider: getAIProvider(newPersonaKey),
      user: updatedUser,
    }, `Persona switched to "${personaConfig.name}"`);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/user/personas
 * List all available personas (public info only).
 */
async function getAllPersonas(req, res, next) {
  try {
    const personas = listPersonas();

    return success(res, {
      personas,
      total: personas.length,
    }, 'Available personas retrieved successfully');
  } catch (err) {
    next(err);
  }
}

module.exports = { getUserPersona, updateUserPersona, getAllPersonas };
