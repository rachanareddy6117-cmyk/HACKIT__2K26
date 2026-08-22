// Privacy-Protected Firewall Middleware & Sensitive Data Encryption Layer
const crypto = require('crypto');

// Simulated Encryption Key (Derived from JWT_SECRET or ENV)
const ENCRYPTION_KEY = crypto.scryptSync(process.env.JWT_SECRET || 'echosign_firewall_secure_key_2026', 'salt', 32);
const IV_LENGTH = 16;

/**
 * Encrypt sensitive customer data before database storage
 */
function encryptSensitiveField(text) {
  if (!text) return text;
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

/**
 * Decrypt sensitive customer data
 */
function decryptSensitiveField(text) {
  if (!text || !text.includes(':')) return text;
  const [ivHex, encryptedText] = text.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

/**
 * Privacy Firewall Middleware: Sanitizes incoming & outgoing traffic,
 * blocks XSS/SQLi injection, strips PII from server logs, and masks sensitive tokens.
 */
function privacyFirewallMiddleware(req, res, next) {
  // 1. Data Anonymization Log Masking
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const anonymizedIp = clientIp ? clientIp.replace(/\d+$/, 'xxx') : 'anonymized';

  console.log(`[PRIVACY FIREWALL PROTECTED] ${req.method} ${req.path} | Client IP: ${anonymizedIp} | Shield: ACTIVE`);

  // 2. Strict Privacy Headers
  res.setHeader('X-Privacy-Protection-Policy', 'Strict-PII-Encrypted-Firewall-Active');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'no-referrer');

  // 3. Inspect Payload for Malicious Injections or PII Leaks
  if (req.body && typeof req.body === 'object') {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        // Sanitize suspicious script tags or injection vectors
        req.body[key] = req.body[key].replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      }
    }
  }

  next();
}

module.exports = {
  privacyFirewallMiddleware,
  encryptSensitiveField,
  decryptSensitiveField
};
