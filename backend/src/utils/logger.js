const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Logger utility
class Logger {
  static log(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...meta
    };

    // Console log in development
    if (process.env.NODE_ENV === 'development') {
      const colors = {
        INFO: '\x1b[36m',    // Cyan
        WARN: '\x1b[33m',    // Yellow
        ERROR: '\x1b[31m',   // Red
        AUTH: '\x1b[35m',    // Magenta
        SUCCESS: '\x1b[32m'  // Green
      };
      const color = colors[level] || '\x1b[0m';
      const reset = '\x1b[0m';
      console.log(`${color}[${timestamp}] ${level}:${reset} ${message}`);
    }

    // File log for errors and warnings
    if (level === 'ERROR' || level === 'WARN') {
      const dateStr = new Date().toISOString().split('T')[0];
      const logFile = path.join(logsDir, `erreurs-${dateStr}.log`);
      
      try {
        fs.appendFileSync(logFile, `${JSON.stringify(logEntry)  }\n`);
      } catch (error) {
        console.error('Failed to write to log file:', error);
      }
    }
  }

  static info(message, meta) {
    this.log('INFO', message, meta);
  }

  static warn(message, meta) {
    this.log('WARN', message, meta);
  }

  static error(message, meta) {
    this.log('ERROR', message, meta);
  }

  static auth(message, meta) {
    this.log('AUTH', message, meta);
  }

  static success(message, meta) {
    this.log('SUCCESS', message, meta);
  }
}

module.exports = Logger;
