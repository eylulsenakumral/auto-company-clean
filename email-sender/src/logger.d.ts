/**
 * JSONL Audit Logger
 * Every send attempt is logged with timestamp, status, and metadata
 */
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
export declare class AuditLogger {
    private logPath;
    constructor(dateStr?: string);
    log(entry: LogEntry): void;
    static getStats(dateStr?: string): LogStats;
}
export interface LogStats {
    total: number;
    success: number;
    failed: number;
    dry_run: number;
}
