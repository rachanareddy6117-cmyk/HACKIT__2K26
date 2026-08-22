// ─────────────────────────────────────────────────────────────
// EchoSign — Constants & Enums
// ─────────────────────────────────────────────────────────────

/**
 * Supported credential types for authentication.
 * EchoSign supports multimodal login — traditional email/password,
 * Face ID biometric tokens, and Voice ID biometric tokens.
 */
const CREDENTIAL_TYPES = Object.freeze({
  EMAIL: 'email',
  FACE_ID: 'face_id',
  VOICE_ID: 'voice_id',
});

/**
 * Persona keys mapping to distinct user experiences.
 * Each persona gets a tailored system prompt and may route
 * to a different AI provider for optimal response quality.
 */
const PERSONA_KEYS = Object.freeze({
  DEAF_HOH: 'deaf_hoh',
  NON_SPEAKING: 'non_speaking',
  AUTISM_SUPPORT: 'autism_support',
  INTROVERT_COACH: 'introvert_coach',
  SIGN_LEARNER: 'sign_learner',
});

/**
 * AI provider identifiers.
 * Gemini handles sign language processing and translation;
 * Claude handles nuanced social/emotional guidance.
 */
const AI_PROVIDERS = Object.freeze({
  GEMINI: 'gemini',
  CLAUDE: 'claude',
});

/**
 * AI model identifiers used for each provider.
 */
const AI_MODELS = Object.freeze({
  GEMINI: 'gemini-1.5-flash',
  CLAUDE: 'claude-3-5-sonnet-20241022',
});

/**
 * Personas that route to Claude instead of Gemini.
 * These personas require nuanced social/emotional understanding.
 */
const CLAUDE_PERSONAS = Object.freeze([
  PERSONA_KEYS.AUTISM_SUPPORT,
  PERSONA_KEYS.INTROVERT_COACH,
]);

/**
 * HTTP status codes used throughout the API.
 */
const HTTP_STATUS = Object.freeze({
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
});

/**
 * ISL MVP Vocabulary — 30–50 signs/phrases from the PRD.
 * Organized by category for the hackathon demo scope.
 */
const ISL_VOCABULARY = Object.freeze({
  greetings: [
    { gloss: 'HELLO', english: 'Hello', category: 'greetings' },
    { gloss: 'GOOD-MORNING', english: 'Good morning', category: 'greetings' },
    { gloss: 'THANK-YOU', english: 'Thank you', category: 'greetings' },
    { gloss: 'SORRY', english: 'Sorry', category: 'greetings' },
    { gloss: 'GOODBYE', english: 'Goodbye', category: 'greetings' },
    { gloss: 'PLEASE', english: 'Please', category: 'greetings' },
  ],

  conversation: [
    { gloss: 'WHAT YOUR NAME', english: 'What is your name?', category: 'conversation' },
    { gloss: 'MY NAME', english: 'My name is...', category: 'conversation' },
    { gloss: 'HOW YOU', english: 'How are you?', category: 'conversation' },
    { gloss: 'I NEED HELP', english: 'I need help', category: 'conversation' },
    { gloss: 'PLEASE WAIT', english: 'Please wait', category: 'conversation' },
    { gloss: 'YES', english: 'Yes', category: 'conversation' },
    { gloss: 'NO', english: 'No', category: 'conversation' },
    { gloss: 'I UNDERSTAND', english: 'I understand', category: 'conversation' },
    { gloss: 'I NOT-UNDERSTAND', english: 'I do not understand', category: 'conversation' },
    { gloss: 'REPEAT PLEASE', english: 'Please repeat', category: 'conversation' },
  ],

  emergency: [
    { gloss: 'DOCTOR', english: 'Doctor', category: 'emergency' },
    { gloss: 'HOSPITAL', english: 'Hospital', category: 'emergency' },
    { gloss: 'HELP', english: 'Help!', category: 'emergency' },
    { gloss: 'PAIN', english: 'Pain', category: 'emergency' },
    { gloss: 'WATER', english: 'Water', category: 'emergency' },
    { gloss: 'FOOD', english: 'Food', category: 'emergency' },
    { gloss: 'MEDICINE', english: 'Medicine', category: 'emergency' },
    { gloss: 'EMERGENCY', english: 'Emergency', category: 'emergency' },
    { gloss: 'I NEED MEDICAL HELP', english: 'I need medical help', category: 'emergency' },
    { gloss: 'CALL AMBULANCE', english: 'Call an ambulance', category: 'emergency' },
  ],

  campus: [
    { gloss: 'TEACHER', english: 'Teacher', category: 'campus' },
    { gloss: 'STUDENT', english: 'Student', category: 'campus' },
    { gloss: 'CLASSROOM', english: 'Classroom', category: 'campus' },
    { gloss: 'EXAM', english: 'Exam', category: 'campus' },
    { gloss: 'PROJECT', english: 'Project', category: 'campus' },
    { gloss: 'FRIEND', english: 'Friend', category: 'campus' },
    { gloss: 'LIBRARY', english: 'Library', category: 'campus' },
    { gloss: 'CANTEEN', english: 'Canteen', category: 'campus' },
    { gloss: 'OFFICE', english: 'Office', category: 'campus' },
    { gloss: 'TOILET', english: 'Toilet / Restroom', category: 'campus' },
  ],

  time_and_numbers: [
    { gloss: 'TODAY', english: 'Today', category: 'time_and_numbers' },
    { gloss: 'TOMORROW', english: 'Tomorrow', category: 'time_and_numbers' },
    { gloss: 'YESTERDAY', english: 'Yesterday', category: 'time_and_numbers' },
    { gloss: 'NOW', english: 'Now', category: 'time_and_numbers' },
    { gloss: 'LATER', english: 'Later', category: 'time_and_numbers' },
  ],
});

/**
 * Flattened vocabulary list for quick lookup.
 */
const ISL_VOCABULARY_FLAT = Object.freeze(
  Object.values(ISL_VOCABULARY).flat()
);

module.exports = {
  CREDENTIAL_TYPES,
  PERSONA_KEYS,
  AI_PROVIDERS,
  AI_MODELS,
  CLAUDE_PERSONAS,
  HTTP_STATUS,
  ISL_VOCABULARY,
  ISL_VOCABULARY_FLAT,
};
