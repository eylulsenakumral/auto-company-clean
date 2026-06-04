export enum LogLevel {
  DEBUG ***REMOVED*** 'debug',
  INFO ***REMOVED*** 'info',
  WARN ***REMOVED*** 'warn',
  ERROR ***REMOVED*** 'error'
}

class Logger {
  private level: LogLevel;

  constructor(level: LogLevel ***REMOVED*** LogLevel.INFO) {
    this.level ***REMOVED*** level;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels ***REMOVED*** [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    return levels.indexOf(level) >***REMOVED*** levels.indexOf(this.level);
  }

  private formatMessage(level: LogLevel, message: string, meta?: any): string {
    const timestamp ***REMOVED*** new Date().toISOString();
    const metaStr ***REMOVED*** meta ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
  }

  debug(message: string, meta?: any) {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(this.formatMessage(LogLevel.DEBUG, message, meta));
    }
  }

  info(message: string, meta?: any) {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(this.formatMessage(LogLevel.INFO, message, meta));
    }
  }

  warn(message: string, meta?: any) {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage(LogLevel.WARN, message, meta));
    }
  }

  error(message: string, meta?: any) {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(this.formatMessage(LogLevel.ERROR, message, meta));
    }
  }
}

export const logger ***REMOVED*** new Logger(
  (process.env.LOG_LEVEL as LogLevel) || LogLevel.INFO
);
