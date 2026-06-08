/**
 * JSONL Audit Logger
 * Every send attempt is logged with timestamp, status, and metadata
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname ***REMOVED*** path.dirname(fileURLToPath(import.meta.url));
const LOG_DIR ***REMOVED*** path.join(__dirname, '../logs');

export interface LogEntry {
  timestamp: string;
  recipient_email: string;
  recipient_name: string;
  template_id: number;
  subject: string;
  status: 'success' | 'failed' | 'retry' | 'dry_run';
  attempt: number;
  message_id?: string;
  error?: string;
  duration_ms?: number;
}

export class AuditLogger {
  private logPath: string;

  constructor(dateStr: string ***REMOVED*** new Date().toISOString().split('T')[0]) {
    if (!fs.existsSync(LOG_DIR)) {
      fs.mkdirSync(LOG_DIR, { recursive: true });
    }
    this.logPath ***REMOVED*** path.join(LOG_DIR, `send-${dateStr}.jsonl`);
  }

  log(entry: LogEntry): void {
    const line ***REMOVED*** JSON.stringify(entry) + '\n';
    fs.appendFileSync(this.logPath, line, 'utf-8');
  }

  static getStats(dateStr: string ***REMOVED*** new Date().toISOString().split('T')[0]): LogStats {
    const logPath ***REMOVED*** path.join(LOG_DIR, `send-${dateStr}.jsonl`);

    if (!fs.existsSync(logPath)) {
      return { total: 0, success: 0, failed: 0, dry_run: 0 };
    }

    const content ***REMOVED*** fs.readFileSync(logPath, 'utf-8');
    const lines ***REMOVED*** content.trim().split('\n').filter(Boolean);

    const stats: LogStats ***REMOVED*** {
      total: lines.length,
      success: 0,
      failed: 0,
      dry_run: 0
    };

    for (const line of lines) {
      try {
        const entry: LogEntry ***REMOVED*** JSON.parse(line);
        if (entry.status ***REMOVED******REMOVED******REMOVED*** 'success') stats.success++;
        else if (entry.status ***REMOVED******REMOVED******REMOVED*** 'failed') stats.failed++;
        else if (entry.status ***REMOVED******REMOVED******REMOVED*** 'dry_run') stats.dry_run++;
      } catch {
        // Skip malformed lines
      }
    }

    return stats;
  }
}

export interface LogStats {
  total: number;
  success: number;
  failed: number;
  dry_run: number;
}
