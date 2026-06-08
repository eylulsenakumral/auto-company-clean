/**
 * Resend API Wrapper with Rate Limiting and Retry Logic
 */

import { Resend } from 'resend';
import type { LogEntry } from './logger.js';

export interface SendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  attempt: number;
  durationMs: number;
}

export class EmailSender {
  private resend: Resend;
  private fromEmail: string;
  private fromName: string;
  private rateLimitMs: number;
  private maxRetries: number;
  private lastSendTime: number ***REMOVED*** 0;

  constructor(
    apiKey: string,
    fromEmail: string,
    fromName: string,
    rateLimitMs: number ***REMOVED*** 1000,
    maxRetries: number ***REMOVED*** 3
  ) {
    this.resend ***REMOVED*** new Resend(apiKey);
    this.fromEmail ***REMOVED*** fromEmail;
    this.fromName ***REMOVED*** fromName;
    this.rateLimitMs ***REMOVED*** rateLimitMs;
    this.maxRetries ***REMOVED*** maxRetries;
  }

  async send(
    to: string,
    toName: string,
    subject: string,
    html: string,
    logger: (entry: LogEntry) ***REMOVED***> void,
    dryRun: boolean ***REMOVED*** false
  ): Promise<SendResult> {
    const startTime ***REMOVED*** Date.now();
    let lastError: string | undefined;

    for (let attempt ***REMOVED*** 1; attempt <***REMOVED*** this.maxRetries; attempt++) {
      try {
        // Rate limiting
        await this.waitForRateLimit();

        if (dryRun) {
          logger({
            timestamp: new Date().toISOString(),
            recipient_email: to,
            recipient_name: toName,
            template_id: 0,
            subject,
            status: 'dry_run',
            attempt,
            duration_ms: Date.now() - startTime
          });

          return {
            success: true,
            messageId: `dry-run-${Date.now()}`,
            attempt,
            durationMs: Date.now() - startTime
          };
        }

        const result ***REMOVED*** await this.resend.emails.send({
          from: `"${this.fromName}" <${this.fromEmail}>`,
          to: [to],
          subject,
          html
        });

        const duration ***REMOVED*** Date.now() - startTime;

        logger({
          timestamp: new Date().toISOString(),
          recipient_email: to,
          recipient_name: toName,
          template_id: 0,
          subject,
          status: 'success',
          attempt,
          message_id: result.data?.id,
          duration_ms: duration
        });

        return {
          success: true,
          messageId: result.data?.id,
          attempt,
          durationMs: duration
        };

      } catch (error) {
        lastError ***REMOVED*** error instanceof Error ? error.message : String(error);

        // Log retry attempt
        logger({
          timestamp: new Date().toISOString(),
          recipient_email: to,
          recipient_name: toName,
          template_id: 0,
          subject,
          status: attempt < this.maxRetries ? 'retry' : 'failed',
          attempt,
          error: lastError,
          duration_ms: Date.now() - startTime
        });

        // Don't retry on certain errors
        if (this.isNonRetryableError(lastError)) {
          break;
        }

        // Exponential backoff
        if (attempt < this.maxRetries) {
          await this.sleep(this.getRetryDelay(attempt));
        }
      }
    }

    return {
      success: false,
      error: lastError,
      attempt: this.maxRetries,
      durationMs: Date.now() - startTime
    };
  }

  private async waitForRateLimit(): Promise<void> {
    const now ***REMOVED*** Date.now();
    const timeSinceLastSend ***REMOVED*** now - this.lastSendTime;

    if (timeSinceLastSend < this.rateLimitMs) {
      const waitTime ***REMOVED*** this.rateLimitMs - timeSinceLastSend;
      await this.sleep(waitTime);
    }

    this.lastSendTime ***REMOVED*** Date.now();
  }

  private getRetryDelay(attempt: number): number {
    // Exponential backoff: 2s, 4s, 8s...
    return 2000 * Math.pow(2, attempt - 1);
  }

  private isNonRetryableError(error: string): boolean {
    const nonRetryablePatterns ***REMOVED*** [
      'invalid api key',
      'unauthorized',
      'forbidden',
      'invalid email',
      'domain not verified'
    ];

    const lowerError ***REMOVED*** error.toLowerCase();
    return nonRetryablePatterns.some(pattern ***REMOVED***> lowerError.includes(pattern));
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve ***REMOVED***> setTimeout(resolve, ms));
  }
}
