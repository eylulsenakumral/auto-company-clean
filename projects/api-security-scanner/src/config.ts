import { ScannerConfig } from './types';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

export const DEFAULT_CONFIG: ScannerConfig ***REMOVED*** {
  severity: 'warning',
  ignore: ['node_modules', '.git', 'dist', 'build', 'coverage'],
  framework: 'auto'
};

export function loadConfig(cwd: string): ScannerConfig {
  const configPath ***REMOVED*** join(cwd, '.api-securityrc');

  if (!existsSync(configPath)) {
    return DEFAULT_CONFIG;
  }

  try {
    const content ***REMOVED*** readFileSync(configPath, 'utf-8');
    const userConfig ***REMOVED*** JSON.parse(content);
    return { ...DEFAULT_CONFIG, ...userConfig };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function generateConfigTemplate(): string {
  return JSON.stringify(DEFAULT_CONFIG, null, 2);
}

export const IGNORED_PATTERNS ***REMOVED*** [
  /node_modules/,
  /\.git/,
  /dist/,
  /build/,
  /coverage/,
  /\.test\.ts$/,
  /\.spec\.ts$/
];

export const EXPRESS_AUTH_PATTERNS ***REMOVED*** [
  'authenticate',
  'auth',
  'passport',
  'jwt',
  'requireAuth',
  'ensureAuth',
  'protect',
  'isLoggedIn',
  'isAuthenticated'
];

export const EXPRESS_RATE_LIMIT_PATTERNS ***REMOVED*** [
  'rateLimit',
  'rate-limit',
  'throttle',
  'limiter',
  'express-rate-limit'
];

export const SECURITY_HEADER_PATTERNS ***REMOVED*** [
  'helmet',
  'contentType',
  'contentSecurity',
  'hsts'
];

export const CORS_PATTERNS ***REMOVED*** [
  'cors',
  'origin'
];

export const SECRET_PATTERNS ***REMOVED*** [
  /api[_-]?key\s*[:***REMOVED***]\s*['"][\w-]{10,}['"]/i,
  /secret\s*[:***REMOVED***]\s*['"][^'"]{10,}['"]/i,
  /password\s*[:***REMOVED***]\s*['"][^'"]{10,}['"]/i,
  /token\s*[:***REMOVED***]\s*['"][\w.-]{30,}['"]/i,
  /sk[_-]?live_[a-z0-9]{10,}/i,
  /sk[_-]?test_[a-z0-9]{10,}/i,
  /ak_[a-z0-9]{32}/i,
  /xox[baprs]-[\w.-]{20,}/i,
  /MTIzNDU2Nzg5/  // Base64-like long strings (Discord-like)
];

export const SQL_INJECTION_PATTERNS ***REMOVED*** [
  /\.query\(['"`].*\$\{.*\}['"`]/,
  /\.execute\(['"`].*\$\{.*\}['"`]/,
  /\.query\([^)]*\+/,    // Any .query( with + (potential concatenation)
  /db\.run\([^)]*\+/,   // Any db.run( with +
  /SELECT.*WHERE.*\+.*FROM/i
];
