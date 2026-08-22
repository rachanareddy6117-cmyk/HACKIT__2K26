/**
 * Local Storage Helper Utilities for EchoSign
 */

export const STORAGE_KEYS = {
  USER: 'echosign_user',
  AUTH_METHOD: 'echosign_auth_method',
  PERSONA: 'echosign_persona',
  CONVERSATION: 'echosign_conversation',
  SETTINGS: 'echosign_settings'
};

export const getStoredItem = (key, fallback = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (err) {
    console.error(`Error reading ${key} from localStorage:`, err);
    return fallback;
  }
};

export const setStoredItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error writing ${key} to localStorage:`, err);
  }
};

export const removeStoredItem = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.error(`Error removing ${key} from localStorage:`, err);
  }
};

export const clearSession = () => {
  removeStoredItem(STORAGE_KEYS.USER);
  removeStoredItem(STORAGE_KEYS.AUTH_METHOD);
  removeStoredItem(STORAGE_KEYS.PERSONA);
  removeStoredItem(STORAGE_KEYS.CONVERSATION);
};
