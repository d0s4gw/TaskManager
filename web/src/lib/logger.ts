/**
 * Simple structured logger for the web tier.
 * In development, it logs to the console with colors.
 * In production, it could be extended to send logs to a centralized service.
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class WebLogger {
  private service = 'task-manager-web';

  private log(level: LogLevel, message: string, meta?: any) {
    const timestamp = new Date().toISOString();
    const structuredLog = {
      timestamp,
      level,
      message,
      service: this.service,
      ...meta,
    };

    if (process.env.NODE_ENV === 'development') {
      const colors = {
        info: '\x1b[32m',
        warn: '\x1b[33m',
        error: '\x1b[31m',
        debug: '\x1b[34m',
      };
      const reset = '\x1b[0m';
      console.log(
        `${colors[level]}[${level.toUpperCase()}]${reset} ${message}`,
        meta || ''
      );
    } else {
      // In production, we log as JSON for easier parsing by log aggregators
      console.log(JSON.stringify(structuredLog));
    }
  }

  info(message: string, meta?: any) { this.log('info', message, meta); }
  warn(message: string, meta?: any) { this.log('warn', message, meta); }
  error(message: string, meta?: any) { this.log('error', message, meta); }
  debug(message: string, meta?: any) { this.log('debug', message, meta); }
}

export const logger = new WebLogger();
