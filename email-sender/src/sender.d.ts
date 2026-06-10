/**
 * Resend API Wrapper with Rate Limiting and Retry Logic
 */
import type { LogEntry } from './logger.js';
export interface SendResult {
    success: boolean;
    messageId?: string;
    error?: string;
    attempt: number;
    durationMs: number;
}
export declare class EmailSender {
    private resend;
    private fromEmail;
    private fromName;
    private rateLimitMs;
    private maxRetries;
    private lastSendTime;
    constructor(apiKey: string, fromEmail: string, fromName: string, rateLimitMs?: number, maxRetries?: number);
    send(to: string, toName: string, subject: string, html: string, logger: (entry: LogEntry) > void, dryRun?: boolean): Promise<SendResult>;
    private waitForRateLimit;
    private getRetryDelay;
    private isNonRetryableError;
    private sleep;
}
