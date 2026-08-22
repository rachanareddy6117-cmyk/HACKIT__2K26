/**
 * EchoSign API Service Layer
 * All backend calls are routed through here — API keys stay server-side.
 */

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

async function post(path, body) {
  try {
    const res = await fetch(`${BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return null; // caller handles null → fallback
  }
}

/** POST /api/ai/chat  — Gemini or Claude depending on persona */
export async function sendChatMessage({ message, personaCategory, liveGlosses = [] }) {
  return post('/api/ai/chat', { message, personaCategory, liveGlosses });
}

/** POST /api/auth/login */
export async function loginUser({ authType, identifier }) {
  return post('/api/auth/login', { authType, identifier });
}

/** POST /api/user/persona */
export async function setPersona(category) {
  return post('/api/user/persona', { category });
}
