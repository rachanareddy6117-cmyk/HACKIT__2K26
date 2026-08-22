// ─────────────────────────────────────────────────────────────
// EchoSign — Simple Console Logger
// ─────────────────────────────────────────────────────────────

const LEVELS = { DEBUG: 'DEBUG', INFO: 'INFO', WARN: 'WARN', ERROR: 'ERROR' };

/**
 * Format a log line with ISO timestamp, level, and optional context tag.
 */
function format(level, message, context = '') {
  const ts = new Date().toISOString();
  const ctx = context ? ` [${context}]` : '';
  return `${ts} [${level}]${ctx} ${message}`;
}

const logger = {
  debug(message, context) {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(format(LEVELS.DEBUG, message, context));
    }
  },
  info(message, context) {
    console.info(format(LEVELS.INFO, message, context));
  },
  warn(message, context) {
    console.warn(format(LEVELS.WARN, message, context));
  },
  error(message, context) {
    console.error(format(LEVELS.ERROR, message, context));
  },
};

module.exports = logger;
