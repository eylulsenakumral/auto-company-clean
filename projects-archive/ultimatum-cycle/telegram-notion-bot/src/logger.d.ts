export declare enum LogLevel {
    DEBUG  "debug",
    INFO  "info",
    WARN  "warn",
    ERROR  "error"
}
declare class Logger {
    private level;
    constructor(level?: LogLevel);
    private shouldLog;
    private formatMessage;
    debug(message: string, meta?: any): void;
    info(message: string, meta?: any): void;
    warn(message: string, meta?: any): void;
    error(message: string, meta?: any): void;
}
export declare const logger: Logger;
export {};
