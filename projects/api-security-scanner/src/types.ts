export interface SecurityIssue {
  route: string;
  file: string;
  line: number;
  issue: string;
  severity: 'critical' | 'warning' | 'info';
  fix: string;
  checkType: CheckType;
}

export type CheckType ***REMOVED***
  | 'auth-required'
  | 'open-endpoints'
  | 'rate-limiting'
  | 'cors-config'
  | 'security-headers'
  | 'input-validation'
  | 'sql-injection'
  | 'secret-exposure';

export interface ScanResult {
  issues: SecurityIssue[];
  summary: {
    critical: number;
    warning: number;
    info: number;
    totalRoutes: number;
    filesScanned: number;
  };
  timestamp: string;
}

export interface ScannerConfig {
  severity?: 'critical' | 'warning' | 'info';
  ignore?: string[];
  framework?: 'express' | 'auto';
  customChecks?: string[];
}

export interface RouteInfo {
  path: string;
  file: string;
  line: number;
  method: string;
  middleware: string[];
  hasAuth: boolean;
  hasRateLimit: boolean;
}
