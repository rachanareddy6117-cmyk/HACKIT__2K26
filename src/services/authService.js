// ─────────────────────────────────────────────────────────────
// EchoSign — Authentication Service (Prisma & SQLite Store)
// ─────────────────────────────────────────────────────────────

const prisma = require('../config/db');
const { CREDENTIAL_TYPES, PERSONA_KEYS } = require('../constants');
const logger = require('../utils/logger');

// ── Seed a demo user if it doesn't already exist ──
async function seedDemoUser() {
  try {
    const demoEmail = 'demo@echosign.dev';
    const existing = await prisma.user.findUnique({
      where: { email: demoEmail },
    });

    if (!existing) {
      await prisma.user.create({
        data: {
          id: 'demo-user-001',
          email: demoEmail,
          password: 'echosign2026', // plain text for demo only
          name: 'EchoSign Demo',
          persona: PERSONA_KEYS.DEAF_HOH,
          credentialType: CREDENTIAL_TYPES.EMAIL,
          faceId: 'demo-face-token',
          voiceId: 'demo-voice-token',
        },
      });
      logger.info(`Seeded demo user in database: ${demoEmail} / echosign2026`, 'AuthService');
    } else {
      logger.info('Demo user already exists in database.', 'AuthService');
    }
  } catch (err) {
    logger.error(`Error seeding demo user: ${err.message}`, 'AuthService');
  }
}

// ─────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────

/**
 * Register a new user.
 * @param {object} data
 * @param {string} data.email
 * @param {string} data.password
 * @param {string} data.name
 * @param {string} [data.persona]   - One of PERSONA_KEYS (default: sign_learner)
 * @param {string} [data.faceId]    - Optional Face ID token
 * @param {string} [data.voiceId]   - Optional Voice ID token
 * @returns {Promise<{ user: object, token: string } | { error: string }>}
 */
async function register({ email, password, name, persona, faceId, voiceId }) {
  try {
    // Check for duplicate email
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: 'A user with this email already exists.' };
    }

    // Create user in database
    const user = await prisma.user.create({
      data: {
        email,
        password, // In production -> hash with bcrypt
        name,
        persona: persona || PERSONA_KEYS.SIGN_LEARNER,
        credentialType: CREDENTIAL_TYPES.EMAIL,
        faceId: faceId || null,
        voiceId: voiceId || null,
      },
    });

    // Create session in database
    const session = await prisma.session.create({
      data: { userId: user.id },
    });

    logger.info(`Registered user ${user.id} (${email})`, 'AuthService');

    const { password: _pw, ...safeUser } = user;
    return { user: safeUser, token: session.id };
  } catch (err) {
    logger.error(`Registration error: ${err.message}`, 'AuthService');
    return { error: 'An error occurred during registration.' };
  }
}

/**
 * Authenticate a user by credential type.
 * @param {object}  data
 * @param {string}  data.credentialType - 'email' | 'face_id' | 'voice_id'
 * @param {string}  [data.email]        - Required for email login
 * @param {string}  [data.password]     - Required for email login
 * @param {string}  [data.faceId]       - Required for face_id login
 * @param {string}  [data.voiceId]      - Required for voice_id login
 * @returns {Promise<{ user: object, token: string } | { error: string }>}
 */
async function login({ credentialType, email, password, faceId, voiceId }) {
  try {
    let user = null;

    switch (credentialType) {
      case CREDENTIAL_TYPES.EMAIL: {
        if (!email || !password) {
          return { error: 'Email and password are required for email login.' };
        }
        user = await prisma.user.findUnique({ where: { email } });
        if (!user || user.password !== password) { // In production -> bcrypt.compare
          return { error: 'Invalid email or password.' };
        }
        break;
      }

      case CREDENTIAL_TYPES.FACE_ID: {
        if (!faceId) {
          return { error: 'Face ID token is required for Face ID login.' };
        }
        user = await prisma.user.findFirst({ where: { faceId } });
        if (!user) {
          return { error: 'Face ID not recognised. Please register first.' };
        }
        break;
      }

      case CREDENTIAL_TYPES.VOICE_ID: {
        if (!voiceId) {
          return { error: 'Voice ID token is required for Voice ID login.' };
        }
        user = await prisma.user.findFirst({ where: { voiceId } });
        if (!user) {
          return { error: 'Voice ID not recognised. Please register first.' };
        }
        break;
      }

      default:
        return { error: `Unsupported credential type: "${credentialType}". Use email, face_id, or voice_id.` };
    }

    // Create session in database
    const session = await prisma.session.create({
      data: { userId: user.id },
    });

    logger.info(`User logged in: ${user.id} via ${credentialType}`, 'AuthService');

    const { password: _pw, ...safeUser } = user;
    return { user: safeUser, token: session.id };
  } catch (err) {
    logger.error(`Login error: ${err.message}`, 'AuthService');
    return { error: 'An error occurred during authentication.' };
  }
}

/**
 * Look up a session by token.
 * @param {string} token
 * @returns {Promise<object|null>} { id, userId, createdAt } or null
 */
async function getSession(token) {
  try {
    return await prisma.session.findUnique({
      where: { id: token },
    });
  } catch (err) {
    logger.error(`Get session error: ${err.message}`, 'AuthService');
    return null;
  }
}

/**
 * Get a user by ID.
 * @param {string} id
 * @returns {Promise<object|null>}
 */
async function getUserById(id) {
  try {
    return await prisma.user.findUnique({
      where: { id },
    });
  } catch (err) {
    logger.error(`Get user error: ${err.message}`, 'AuthService');
    return null;
  }
}

/**
 * Update a user's persona.
 * @param {string} userId
 * @param {string} personaKey - One of PERSONA_KEYS
 * @returns {Promise<object|null>} Updated user (safe, without password)
 */
async function updateUserPersona(userId, personaKey) {
  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { persona: personaKey },
    });

    logger.info(`User ${userId} switched persona to ${personaKey}`, 'AuthService');

    const { password: _pw, ...safeUser } = updatedUser;
    return safeUser;
  } catch (err) {
    logger.error(`Update user persona error: ${err.message}`, 'AuthService');
    return null;
  }
}

/**
 * Invalidate a session token (logout).
 * @param {string} token
 * @returns {Promise<void>}
 */
async function logout(token) {
  try {
    await prisma.session.delete({
      where: { id: token },
    });
  } catch (err) {
    logger.error(`Logout error: ${err.message}`, 'AuthService');
  }
}

module.exports = {
  seedDemoUser,
  register,
  login,
  getSession,
  getUserById,
  updateUserPersona,
  logout,
};
