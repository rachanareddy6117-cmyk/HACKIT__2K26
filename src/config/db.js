// ─────────────────────────────────────────────────────────────
// EchoSign — Global Prisma Client Instantiation
// ─────────────────────────────────────────────────────────────

const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');

const prisma = new PrismaClient({
  log: [
    { level: 'warn', emit: 'event' },
    { level: 'error', emit: 'event' },
  ],
});

// Attach event listeners for logging database warnings/errors
prisma.$on('warn', (e) => {
  logger.warn(e.message, 'Database');
});

prisma.$on('error', (e) => {
  logger.error(e.message, 'Database');
});

module.exports = prisma;
