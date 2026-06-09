/**
 * Security detection patterns
 */

import { IssueType, Severity } from './types.js';

export interface SecretPattern {
  name: string;
  pattern: RegExp;
  type: IssueType;
  severity: Severity;
  fix: string;
}

/**
 * Common secret patterns - ordered by specificity
 * More specific patterns first to avoid false positives
 */
export const SECRET_PATTERNS: SecretPattern[] ***REMOVED*** [
  {
    name: 'AWS Access Key',
    pattern: /\b(AKIA[0-9A-Z]{16})\b/,
    type: 'hardcoded-secret',
    severity: 'critical',
    fix: 'Use AWS Secrets Manager or environment variables',
  },
  {
    name: 'AWS Secret Access Key',
    pattern: /\b([A-Za-z0-9/+***REMOVED***]{40})\b/,
    type: 'hardcoded-secret',
    severity: 'critical',
    fix: 'Use AWS Secrets Manager or environment variables',
  },
  {
    name: 'API Key Generic',
    pattern: /\b(api[_-]?key|apikey)\s*[:***REMOVED***]\s*['"]([A-Za-z0-9_-]{20,})['"]\b/i,
    type: 'hardcoded-secret',
    severity: 'critical',
    fix: 'Move to AWS Secrets Manager or parameter store',
  },
  {
    name: 'Bearer Token',
    pattern: /\b(authorization|bearer|token)\s*[:***REMOVED***]\s*['"]([A-Za-z0-9_-]{20,})['"]\b/i,
    type: 'hardcoded-secret',
    severity: 'critical',
    fix: 'Use AWS Secrets Manager or environment variables',
  },
  {
    name: 'JWT Secret',
    pattern: /\b(jwt[_-]?secret|jwt[_-]?key)\s*[:***REMOVED***]\s*['"]([A-Za-z0-9_-]{20,})['"]\b/i,
    type: 'hardcoded-secret',
    severity: 'critical',
    fix: 'Store in AWS Secrets Manager, never in code',
  },
  {
    name: 'Database URL',
    pattern: /\b(database[_-]?url|db[_-]?url|mongodb|postgres|mysql)\s*[:***REMOVED***]\s*['"]([^'"]{10,})['"]\b/i,
    type: 'hardcoded-secret',
    severity: 'critical',
    fix: 'Use RDS connection with Secrets Manager',
  },
  {
    name: 'GitHub Token',
    pattern: /\b(ghp_|gho_|ghu_|ghs_|ghr_)[A-Za-z0-9_]{36,255}\b/,
    type: 'hardcoded-secret',
    severity: 'critical',
    fix: 'Use GitHub Actions secrets or environment variables',
  },
  {
    name: 'Stripe API Key',
    pattern: /\b(sk_live_|sk_test_|pk_live_|pk_test_)[A-Za-z0-9]{24,}\b/,
    type: 'hardcoded-secret',
    severity: 'critical',
    fix: 'Use environment variables or AWS parameter store',
  },
  {
    name: 'Private Key',
    pattern: /-----BEGIN\s+(RSA\s+)?PRIVATE KEY-----/,
    type: 'hardcoded-secret',
    severity: 'critical',
    fix: 'Never commit private keys, use AWS KMS',
  },
  {
    name: 'Password Assignment',
    pattern: /\b(password|passwd|pwd)\s*[:***REMOVED***]\s*['"]([^'"]{4,})['"]\b/i,
    type: 'hardcoded-secret',
    severity: 'warning',
    fix: 'Use secure authentication, never hardcoded passwords',
  },
  {
    name: 'API Endpoint with Key',
    pattern: /\b(api\.openai\.com|api\.anthropic\.com|api\.stripe\.com)[^'"]*['"]?\s*[:***REMOVED***]\s*['"]?[^'"]*sk-[A-Za-z0-9_-]{20,}/i,
    type: 'hardcoded-secret',
    severity: 'critical',
    fix: 'Use environment variables for API credentials',
  },
];

/**
 * IAM permission patterns that indicate over-permissive roles
 */
export const IAM_PATTERNS ***REMOVED*** {
  wildcardAction: {
    pattern: /Action:\s*\*|\bAction:\s*['"]\*['"]/,
    type: 'iam-wildcard' as IssueType,
    severity: 'critical' as Severity,
    fix: 'Specify exact actions needed (e.g., s3:GetObject)',
  },
  wildcardResource: {
    pattern: /Resource:\s*\*|\bResource:\s*['"]\*['"]/,
    type: 'iam-wildcard' as IssueType,
    severity: 'critical' as Severity,
    fix: 'Limit resources to specific ARNs',
  },
  adminAccess: {
    pattern: /PolicyName:\s*['"]?AdministratorAccess['"]?|Effect:\s*Allow[\s\S]*Action:\s*\*/m,
    type: 'iam-admin' as IssueType,
    severity: 'critical' as Severity,
    fix: 'Use least-privilege roles with specific permissions',
  },
  powerUserAccess: {
    pattern: /PolicyName:\s*['"]?PowerUserAccess['"]?/,
    type: 'iam-admin' as IssueType,
    severity: 'warning' as Severity,
    fix: 'Use specific permissions instead of PowerUserAccess',
  },
};

/**
 * Deprecated AWS Lambda runtimes
 */
export const DEPRECATED_RUNTIMES: Record<string, string> ***REMOVED*** {
  'nodejs10.x': 'Ended 2021, use nodejs20.x or later',
  'nodejs12.x': 'Ended 2022, use nodejs20.x or later',
  'nodejs14.x': 'Ended 2023, use nodejs20.x or later',
  'python2.7': 'Ended 2021, use python3.11 or later',
  'python3.6': 'Ended 2022, use python3.11 or later',
  'python3.7': 'Ended 2023, use python3.11 or later',
  'python3.8': 'Ended 2024, use python3.11 or later',
  'ruby2.7': 'Ended 2023, use ruby3.2 or later',
  'go1.x': 'Ended 2023, use provided.al2 or later',
  'dotnetcore2.1': 'Ended 2021, use dotnet8 or later',
  'dotnetcore3.1': 'Ended 2022, use dotnet8 or later',
  'java8': 'Ended 2024, use java21 or later',
  'java11': 'Ended 2024, use java21 or later',
};

/**
 * Environment variable names that often contain secrets
 */
export const SUSPICIOUS_ENV_VARS ***REMOVED*** [
  /api[_-]?key/i,
  /secret/i,
  /password/i,
  /token/i,
  /aws[_-]?(access|secret)/i,
  /private[_-]?key/i,
  /db[_-]?url/i,
  /database[_-]?url/i,
  /jwt/i,
  /stripe/i,
  /github[_-]?token/i,
];

/**
 * Excessive timeout thresholds (seconds)
 */
export const TIMEOUT_THRESHOLDS ***REMOVED*** {
  warning: 60,
  critical: 300, // 5 minutes
};

/**
 * API Gateway auth types that indicate public exposure
 */
export const PUBLIC_AUTH_TYPES ***REMOVED*** ['none', 'NONE', 'undefined', null];

/**
 * Files to ignore during scan
 */
export const DEFAULT_IGNORE_PATTERNS ***REMOVED*** [
  'node_modules/**',
  '.git/**',
  'dist/**',
  'build/**',
  '.serverless/**',
  'coverage/**',
  '*.min.js',
  '*.min.css',
  '.package.json',
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml',
];

/**
 * Handler file patterns for Lambda functions
 */
export const HANDLER_PATTERNS ***REMOVED*** [
  '**/handler.{js,ts}',
  '**/index.{js,ts}',
  '**/lambda.{js,ts}',
  '**/app.{js,ts}',
  '**/main.{js,ts}',
  'src/**/*.ts',
  'src/**/*.js',
  'lib/**/*.ts',
  'lib/**/*.js',
];
