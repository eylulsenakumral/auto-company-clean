/**
 * Core types for pool leak detection
 */

export interface LeakIssue {
  /** File path where leak was detected */
  file: string;
  /** Line number (1-indexed) */
  line: number;
  /** Column number (1-indexed) */
  column: number;
  /** Severity level */
  severity: 'error' | 'warning';
  /** Type of leak */
  type: 'missing-release' | 'loop-leak' | 'transaction-leak' | 'exception-path';
  /** Database library */
  library: 'pg' | 'mysql2' | 'prisma' | 'unknown';
  /** Human-readable description */
  message: string;
  /** Code snippet showing the issue */
  code: string;
  /** Suggested fix */
  suggestion: string;
}

export interface DetectionResult {
  /** File analyzed */
  file: string;
  /** All issues found */
  issues: LeakIssue[];
  /** Analysis duration in ms */
  duration: number;
}

export interface DetectorOptions {
  /** Directories to scan */
  directories: string[];
  /** File patterns to include */
  include?: string[];
  /** File patterns to exclude */
  exclude?: string[];
  /** Output format */
  format?: 'pretty' | 'json';
  /** Minimum severity level */
  severity?: 'error' | 'warning';
}

export interface AcquiredResource {
  /** Variable name holding the resource */
  varName: string;
  /** Node location */
  line: number;
  column: number;
  /** Resource type */
  type: 'connection' | 'transaction';
  /** Whether resource was released */
  released: boolean;
  /** Release location if any */
  releaseLocation?: { line: number; column: number };
  /** Scope information */
  scopeId: string;
  /** Parent scope if in loop */
  inLoop: boolean;
  /** Try-catch wrapped */
  inTryBlock: boolean;
}
