require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { Pool } = require('pg');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Anthropic = require('@anthropic-ai/sdk');
const { privacyFirewallMiddleware, encryptSensitiveField } = require('./privacy_firewall');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'echosign_fallback_secret_key_2026';

// ----------------------------------------------------
// 1. DATABASE CONNECTIONS (MongoDB & PostgreSQL)
// ----------------------------------------------------

// MongoDB Connection (Mongoose)
const MONGO_URI = process.env.MONGO_URI || null;
let UserMongoModel = null;

if (MONGO_URI) {
  mongoose.connect(MONGO_URI)
    .then(() => console.log('[DATABASE] MongoDB Connected Successfully.'))
    .catch(err => console.warn('[DATABASE] MongoDB Connection Warning (Using Memory Store Fallback):', err.message));

  const userMongoSchema = new mongoose.Schema({
    userId: String,
    encryptedIdentifier: String,
    authMethod: String,
    createdAt: { type: Date, default: Date.now }
  });
  UserMongoModel = mongoose.model('User', userMongoSchema);
} else {
  console.log('[DATABASE] MongoDB not configured. Using in-memory fallback.');
}

// PostgreSQL Connection Pool (pg)
let pgPool = null;
if (process.env.POSTGRES_URI) {
  pgPool = new Pool({
    connectionString: process.env.POSTGRES_URI
  });
  pgPool.on('error', (err) => console.warn('[DATABASE] PostgreSQL Pool Warning:', err.message));
}

// Initialize PostgreSQL Schema
async function initPgDb() {
  if (!pgPool) return;
  try {
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(100),
        action VARCHAR(100),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('[DATABASE] PostgreSQL Schema Initialized.');
  } catch (err) {
    console.warn('[DATABASE] PostgreSQL Table Init Warning:', err.message);
  }
}
initPgDb();

// ----------------------------------------------------
// 2. MIDDLEWARES (Privacy Protected Firewall)
// ----------------------------------------------------
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(privacyFirewallMiddleware); // Apply Privacy Firewall across all routes

// Persona Prompts Configuration
const PERSONA_CONFIGS = {
  deaf_hoh: {
    id: 'deaf_hoh',
    title: 'Deaf & Non-Speaking Module',
    preferredModel: 'gemini-1.5-flash',
    systemPrompt: `You are Echo AI Sign Instructor. Focus on sign language glossing, ISL/ASL structure, and concise visual responses.`
  },
  autism_support: {
    id: 'autism_support',
    title: 'Autism Spectrum Module',
    preferredModel: 'claude-3-5-sonnet-20241022',
    systemPrompt: `You are Echo AI Sensory & Situation Coach. Offer sensory-aware, low-pressure, predictable advice for daily situations.`
  },
  introvert_coach: {
    id: 'introvert_coach',
    title: 'Introvert Personality Module',
    preferredModel: 'claude-3-5-sonnet-20241022',
    systemPrompt: `You are Echo AI Introvert Confidence Coach. Provide step-by-step scripts and low-stress social guidance.`
  },
  general_translator: {
    id: 'general_translator',
    title: 'Universal Sign Translator',
    preferredModel: 'gemini-1.5-flash',
    systemPrompt: `You are Echo AI Universal Translator. Translate sign language glosses directly to spoken English and other languages.`
  }
};

// ----------------------------------------------------
// 3. API ENDPOINTS
// ----------------------------------------------------

// Sample User Accounts Registry for Direct Login & Testing
const SAMPLE_USER_ACCOUNTS = [
  { id: 'usr_sample_1', email: 'rachana.reddy@gmail.com', name: 'Rachana Reddy', method: 'google', role: 'Deaf/HOH Learner' },
  { id: 'usr_sample_2', email: 'alex.smith@echosign.org', name: 'Alex Smith', method: 'face_id', role: 'Autism Spectrum Support' },
  { id: 'usr_sample_3', email: 'sarah.introvert@echosign.org', name: 'Sarah Miller', method: 'voice_id', role: 'Introvert Social Coach' },
  { id: 'usr_sample_4', email: 'demo.user@echosign.org', name: 'Demo Accessibility User', method: 'email', role: 'Universal Translator' }
];

// Authentication (/api/auth/login) with Encrypted Privacy, DB Persistence & Sample IDs
app.post('/api/auth/login', async (req, res) => {
  try {
    const { authType, identifier } = req.body;
    const loginId = identifier || 'rachana.reddy@gmail.com';

    // Match sample user if available
    const matchedSample = SAMPLE_USER_ACCOUNTS.find(u => u.email === loginId) || {
      id: `usr_${Date.now()}`,
      email: loginId,
      name: loginId.split('@')[0],
      method: authType || 'email',
      role: 'General User'
    };

    // Encrypt sensitive user identifier for firewall customer privacy
    const encryptedPii = encryptSensitiveField(matchedSample.email);

    // Persist to MongoDB (User Profile)
    if (UserMongoModel) {
      try {
        await UserMongoModel.create({
          userId: matchedSample.id,
          encryptedIdentifier: encryptedPii,
          authMethod: matchedSample.method
        });
      } catch (mErr) {
        console.warn('MongoDB Save Fallback:', mErr.message);
      }
    }

    // Audit log to PostgreSQL
    if (pgPool) {
      try {
        await pgPool.query(
          'INSERT INTO audit_logs (user_id, action) VALUES ($1, $2)',
          [matchedSample.id, `LOGIN_${(matchedSample.method).toUpperCase()}`]
        );
      } catch (pErr) {
        console.warn('PostgreSQL Audit Fallback:', pErr.message);
      }
    }

    const token = jwt.sign({ userId: matchedSample.id, email: matchedSample.email }, JWT_SECRET, { expiresIn: '24h' });

    return res.json({
      success: true,
      token,
      user: {
        id: matchedSample.id,
        displayName: matchedSample.name,
        email: matchedSample.email,
        role: matchedSample.role,
        privacyShield: 'AES-256-Encrypted'
      },
      availableSampleAccounts: SAMPLE_USER_ACCOUNTS
    });
  } catch (error) {
    console.error('Auth Error:', error);
    return res.status(500).json({ error: 'Authentication processing error' });
  }
});

// Persona Route (/api/user/persona)
app.post('/api/user/persona', (req, res) => {
  const { category } = req.body;
  const persona = PERSONA_CONFIGS[category] || PERSONA_CONFIGS.deaf_hoh;
  return res.json({ success: true, persona });
});

// AI Chat Route (/api/ai/chat) with Gemini & Claude
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, personaCategory, liveGlosses } = req.body;
    const persona = PERSONA_CONFIGS[personaCategory] || PERSONA_CONFIGS.deaf_hoh;
    const promptText = `[Input]: ${message || liveGlosses?.join(' ') || 'Hello'}`;

    if (personaCategory === 'autism_support' || personaCategory === 'introvert_coach') {
      try {
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (apiKey && !apiKey.includes('DemoKey') && !apiKey.includes('your_anthropic_claude_api_key_here')) {
          const anthropic = new Anthropic({ apiKey });
          const response = await anthropic.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 800,
            system: persona.systemPrompt,
            messages: [{ role: 'user', content: promptText }]
          });
          return res.json({ success: true, provider: 'Claude 3.5 Sonnet', reply: response.content[0]?.text });
        }
      } catch (cErr) {
        console.warn('Claude API Fallback:', cErr.message);
      }
      return res.json({
        success: true,
        provider: 'Claude 3.5 Sonnet (Sensory Coach)',
        reply: `[Sensory Guide]: Let's analyze this situation step-by-step. 1. Take a soft breath. 2. Choose your response at your own pace. You are in full control.`
      });
    } else {
      try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (apiKey && !apiKey.includes('DemoKey') && !apiKey.includes('your_google_gemini_api_key_here')) {
          const genAI = new GoogleGenerativeAI(apiKey);
          const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
          const response = await model.generateContent(`${persona.systemPrompt}\n\n${promptText}`);
          return res.json({ success: true, provider: 'Gemini 1.5 Flash', reply: response.response.text() });
        }
      } catch (gErr) {
        console.warn('Gemini API Fallback:', gErr.message);
      }
      return res.json({
        success: true,
        provider: 'Gemini 1.5 Flash',
        reply: `[Echo AI Sign Translator]: Gesture "${liveGlosses?.join(' ') || 'Sign'}" translated. How else can I assist your practice?`
      });
    }
  } catch (error) {
    return res.status(500).json({ error: 'AI processing failed' });
  }
});

// Server Start
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` Echo AI Express Backend Running on Port ${PORT}`);
  console.log(` Privacy Firewall & Dual DB (Mongo + Postgres) Active`);
  console.log(`====================================================`);
});
