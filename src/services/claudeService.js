// ─────────────────────────────────────────────────────────────
// EchoSign — Anthropic Claude Service
// ─────────────────────────────────────────────────────────────
// Handles Claude API interactions for personas that require
// nuanced social and emotional guidance — specifically
// autism_support and introvert_coach modes.
// ─────────────────────────────────────────────────────────────

const Anthropic = require('@anthropic-ai/sdk');
const { AI_MODELS } = require('../constants');
const logger = require('../utils/logger');

let client = null;

/**
 * Initialise the Anthropic client. Called once at server startup.
 * Gracefully handles missing API key so the server can still start.
 */
function initialise() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === 'your_anthropic_api_key_here') {
    logger.warn('ANTHROPIC_API_KEY is not set. Claude features will return mock responses.', 'ClaudeService');
    return;
  }

  client = new Anthropic({ apiKey });
  logger.info(`Claude initialised with model: ${AI_MODELS.CLAUDE}`, 'ClaudeService');
}

/**
 * Generate a chat response using Claude.
 * Optimised for nuanced social/emotional guidance.
 *
 * @param {string}   systemPrompt         - Persona-specific system prompt
 * @param {string}   userMessage          - The user's message
 * @param {Array}    conversationHistory  - Previous messages [{role, content}]
 * @returns {Promise<{response: string, provider: string, model: string}>}
 */
async function generateResponse(systemPrompt, userMessage, conversationHistory = []) {
  if (!client) {
    return _mockResponse(userMessage);
  }

  try {
    // Build the messages array for Claude
    const messages = [];

    // Add conversation history
    for (const msg of conversationHistory) {
      messages.push({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content,
      });
    }

    // Add current user message
    messages.push({
      role: 'user',
      content: userMessage,
    });

    const response = await client.messages.create({
      model: AI_MODELS.CLAUDE,
      max_tokens: 1024,
      system: systemPrompt,
      messages,
      temperature: 0.7,
      top_p: 0.9,
    });

    // Extract text from the response content blocks
    const responseText = response.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('\n');

    logger.debug(`Claude response (${responseText.length} chars)`, 'ClaudeService');

    return {
      response: responseText,
      provider: 'claude',
      model: AI_MODELS.CLAUDE,
    };
  } catch (err) {
    logger.error(`Claude API error: ${err.message}`, 'ClaudeService');
    logger.warn('Falling back to mock response due to Claude API error.', 'ClaudeService');
    return _mockResponse(userMessage);
  }
}

// ─────────────────────────────────────────────────────────────
// Mock responses (when API key is not configured)
// ─────────────────────────────────────────────────────────────

function _mockResponse(userMessage) {
  logger.warn('Returning mock Claude response (API key not configured)', 'ClaudeService');
  return {
    response: `[Mock Claude Response]\n\n📝 **What I understood:** You said: "${userMessage}"\n\n💡 **My response:** Configure ANTHROPIC_API_KEY in your .env file to get real AI responses from Claude. Claude is used for autism support and introvert coaching personas, where nuanced social guidance is essential.\n\n➡️ **What you can do next:** Add your API key to the .env file and restart the server.`,
    provider: 'claude',
    model: `${AI_MODELS.CLAUDE} (mock)`,
  };
}

module.exports = {
  initialise,
  generateResponse,
};
