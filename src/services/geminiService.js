// ─────────────────────────────────────────────────────────────
// EchoSign — Google Gemini Service
// ─────────────────────────────────────────────────────────────
// Handles all Gemini API interactions: chat, sign gloss
// processing, and bidirectional ISL ↔ English translation.
// ─────────────────────────────────────────────────────────────

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { AI_MODELS } = require('../constants');
const logger = require('../utils/logger');

let genAI = null;
let model = null;

/**
 * Initialise the Gemini client. Called once at server startup.
 * Gracefully handles missing API key so the server can still start.
 */
function initialise() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    logger.warn('GEMINI_API_KEY is not set. Gemini features will return mock responses.', 'GeminiService');
    return;
  }

  genAI = new GoogleGenerativeAI(apiKey);
  model = genAI.getGenerativeModel({ model: AI_MODELS.GEMINI });
  logger.info(`Gemini initialised with model: ${AI_MODELS.GEMINI}`, 'GeminiService');
}

/**
 * Generate a chat response using Gemini.
 * @param {string}   systemPrompt         - Persona-specific system prompt
 * @param {string}   userMessage          - The user's message
 * @param {Array}    conversationHistory  - Previous messages [{role, content}]
 * @returns {Promise<{response: string, provider: string, model: string}>}
 */
async function generateResponse(systemPrompt, userMessage, conversationHistory = []) {
  if (!model) {
    return _mockResponse(userMessage, 'chat');
  }

  try {
    // Build the conversation content array for Gemini
    const contents = [];

    // Add conversation history
    for (const msg of conversationHistory) {
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      });
    }

    // Add current user message
    contents.push({
      role: 'user',
      parts: [{ text: userMessage }],
    });

    const chat = model.startChat({
      history: contents.slice(0, -1), // All except the last message
      systemInstruction: { parts: [{ text: systemPrompt }] },
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
        maxOutputTokens: 1024,
      },
    });

    const result = await chat.sendMessage(userMessage);
    const response = result.response.text();

    logger.debug(`Gemini response (${response.length} chars)`, 'GeminiService');

    return {
      response,
      provider: 'gemini',
      model: AI_MODELS.GEMINI,
    };
  } catch (err) {
    logger.error(`Gemini API error: ${err.message}`, 'GeminiService');
    throw new Error(`Gemini API error: ${err.message}`);
  }
}

/**
 * Process an ISL gloss sequence into a natural English sentence.
 * @param {string}   glossSequence  - e.g. "HELLO MY NAME ANJALI"
 * @param {string}   systemPrompt   - Persona-specific system prompt
 * @returns {Promise<{gloss: string, english: string, provider: string, model: string}>}
 */
async function processSignGloss(glossSequence, systemPrompt) {
  if (!model) {
    return _mockGlossResponse(glossSequence);
  }

  try {
    const prompt = `You are an Indian Sign Language (ISL) gloss-to-English translator.

Convert the following ISL gloss sequence into a natural, fluent English sentence.
ISL uses its own grammar — the gloss is NOT broken English.

Gloss input: ${glossSequence}

Respond with ONLY the natural English sentence, nothing else.`;

    const chat = model.startChat({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 256,
      },
    });

    const result = await chat.sendMessage(prompt);
    const english = result.response.text().trim();

    logger.debug(`Gloss processed: "${glossSequence}" → "${english}"`, 'GeminiService');

    return {
      gloss: glossSequence,
      english,
      provider: 'gemini',
      model: AI_MODELS.GEMINI,
    };
  } catch (err) {
    logger.error(`Gemini gloss processing error: ${err.message}`, 'GeminiService');
    throw new Error(`Gemini gloss processing error: ${err.message}`);
  }
}

/**
 * Translate an English sentence to ISL gloss notation.
 * @param {string}   englishText   - Natural English sentence
 * @param {string}   systemPrompt  - Persona-specific system prompt
 * @returns {Promise<{english: string, gloss: string, provider: string, model: string}>}
 */
async function translateToGloss(englishText, systemPrompt) {
  if (!model) {
    return _mockTranslateResponse(englishText);
  }

  try {
    const prompt = `You are an English-to-Indian Sign Language (ISL) gloss translator.

Convert the following English sentence into ISL gloss notation.
Use UPPERCASE for signs and hyphens for compound signs (e.g., GOOD-MORNING).
Follow ISL grammar rules — the word order may differ from English.

English input: ${englishText}

Respond with ONLY the ISL gloss notation, nothing else.`;

    const chat = model.startChat({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 256,
      },
    });

    const result = await chat.sendMessage(prompt);
    const gloss = result.response.text().trim();

    logger.debug(`Translated to gloss: "${englishText}" → "${gloss}"`, 'GeminiService');

    return {
      english: englishText,
      gloss,
      provider: 'gemini',
      model: AI_MODELS.GEMINI,
    };
  } catch (err) {
    logger.error(`Gemini translation error: ${err.message}`, 'GeminiService');
    throw new Error(`Gemini translation error: ${err.message}`);
  }
}

// ─────────────────────────────────────────────────────────────
// Mock responses (when API key is not configured)
// ─────────────────────────────────────────────────────────────

function _mockResponse(userMessage, type) {
  logger.warn('Returning mock Gemini response (API key not configured)', 'GeminiService');
  return {
    response: `[Mock Gemini Response] I received your ${type} message: "${userMessage}". Configure GEMINI_API_KEY in your .env file to get real AI responses.`,
    provider: 'gemini',
    model: `${AI_MODELS.GEMINI} (mock)`,
  };
}

function _mockGlossResponse(glossSequence) {
  logger.warn('Returning mock gloss response (API key not configured)', 'GeminiService');
  const mockTranslations = {
    'HELLO': 'Hello!',
    'HELLO MY NAME': 'Hello, my name is...',
    'WHAT YOUR NAME': 'What is your name?',
    'HOW YOU': 'How are you?',
    'I NEED HELP': 'I need help.',
    'THANK-YOU': 'Thank you.',
    'DOCTOR': 'I need a doctor.',
    'HELP': 'Help!',
  };

  const english = mockTranslations[glossSequence.toUpperCase()] ||
    `[Mock Translation] "${glossSequence}" → (Configure GEMINI_API_KEY for real translation)`;

  return {
    gloss: glossSequence,
    english,
    provider: 'gemini',
    model: `${AI_MODELS.GEMINI} (mock)`,
  };
}

function _mockTranslateResponse(englishText) {
  logger.warn('Returning mock translate response (API key not configured)', 'GeminiService');
  return {
    english: englishText,
    gloss: `[Mock Gloss] ${englishText.toUpperCase().replace(/[?.!,]/g, '')}`,
    provider: 'gemini',
    model: `${AI_MODELS.GEMINI} (mock)`,
  };
}

module.exports = {
  initialise,
  generateResponse,
  processSignGloss,
  translateToGloss,
};
