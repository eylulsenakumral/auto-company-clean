/**
 * Library exports
 */

export { ServerlessSecurityScanner, scanProject } from './scanner.js';
export { loadConfig, generateConfigContent } from './config.js';
export { reportTable, reportJson, getExitCode, reportFromFile } from './reporter.js';

export type {
  SecurityIssue,
  ScanResult,
  ScanOptions,
  Config,
  LambdaFunction,
  IssueType,
  Severity,
  Summary,
} from './types.js';
