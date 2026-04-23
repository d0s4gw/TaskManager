const pino = require('pino');

const isProduction = process.env.NODE_ENV === 'production';

// In production (Cloud Run), we use JSON format for Cloud Logging
// In development, we use pino-pretty for human-readable logs
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => {
      // Map pino levels to Google Cloud Logging severities
      const levels = {
        trace: 'DEBUG',
        debug: 'DEBUG',
        info: 'INFO',
        warn: 'WARNING',
        error: 'ERROR',
        fatal: 'CRITICAL',
      };
      return { severity: levels[label] || 'INFO' };
    },
  },
  // Ensure timestamps are in a format GCP likes
  timestamp: pino.stdTimeFunctions.isoTime,
  transport: !isProduction ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      ignore: 'pid,hostname',
    }
  } : undefined
});

module.exports = logger;
