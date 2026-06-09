/**
 * Core types for migration-validator
 */

export type Severity ***REMOVED*** 'critical' | 'warning' | 'info';

export type Framework ***REMOVED*** 'prisma' | 'django' | 'flyway' | 'raw-sql' | 'unknown';

export interface Issue {
  id: string;
  severity: Severity;
  category: Category;
  message: string;
  file: string;
  line?: number;
  code?: string;
  framework: Framework;
}

export type Category ***REMOVED***
  | 'destructive'
  | 'lock-risk'
  | 'rollback'
  | 'data-integrity'
  | 'index-impact'
  | 'schema-drift'
  | 'breaking-change'
  | 'performance';

export interface MigrationFile {
  path: string;
  framework: Framework;
  content: string;
  parsed?: ParsedMigration;
}

export interface ParsedMigration {
  up: string[];
  down: string[];
  metadata?: Record<string, unknown>;
}

export interface ScanResult {
  framework: Framework;
  files: MigrationFile[];
  issues: Issue[];
  summary: ScanSummary;
  timestamp: string;
}

export interface ScanSummary {
  total: number;
  critical: number;
  warning: number;
  info: number;
  byCategory: Record<Category, number>;
}

export interface Config {
  severity: {
    critical: string[];
    warning: string[];
    info: string[];
  };
  ignore: string[];
  framework?: Framework;
  paths?: string[];
}

export const DEFAULT_CONFIG: Config ***REMOVED*** {
  severity: {
    critical: ['destructive', 'breaking-change'],
    warning: ['lock-risk', 'rollback', 'data-integrity'],
    info: ['index-impact', 'performance']
  },
  ignore: [],
  framework: undefined,
  paths: ['./migrations', './prisma/migrations', './database/migrations']
};

export interface Validator {
  name: string;
  category: Category;
  check: (migration: MigrationFile) ***REMOVED***> Issue[];
}
