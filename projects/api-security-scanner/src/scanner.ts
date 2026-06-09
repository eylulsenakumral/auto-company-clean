import { readdirSync, statSync, readFileSync } from 'fs';
import { join, extname } from 'path';
import { SecurityIssue, RouteInfo, CheckType, ScannerConfig } from './types';
import {
  IGNORED_PATTERNS,
  EXPRESS_AUTH_PATTERNS,
  EXPRESS_RATE_LIMIT_PATTERNS,
  SECURITY_HEADER_PATTERNS,
  SECRET_PATTERNS,
  SQL_INJECTION_PATTERNS
} from './config';

export class SecurityScanner {
  private issues: SecurityIssue[] ***REMOVED*** [];
  private routesScanned ***REMOVED*** 0;
  private filesScanned ***REMOVED*** 0;
  private config: ScannerConfig;

  constructor(config: ScannerConfig) {
    this.config ***REMOVED*** config;
  }

  scan(rootPath: string): SecurityIssue[] {
    this.issues ***REMOVED*** [];
    this.routesScanned ***REMOVED*** 0;
    this.filesScanned ***REMOVED*** 0;

    this.scanDirectory(rootPath);

    return this.issues;
  }

  private scanDirectory(dirPath: string): void {
    try {
      const entries ***REMOVED*** readdirSync(dirPath);

      for (const entry of entries) {
        const fullPath ***REMOVED*** join(dirPath, entry);
        const stat ***REMOVED*** statSync(fullPath);

        if (this.shouldIgnore(entry, fullPath)) {
          continue;
        }

        if (stat.isDirectory()) {
          this.scanDirectory(fullPath);
        } else if (this.isTypeScriptFile(entry)) {
          this.scanFile(fullPath);
        }
      }
    } catch (error) {
      // Skip directories we can't read
    }
  }

  private shouldIgnore(entry: string, fullPath: string): boolean {
    for (const pattern of IGNORED_PATTERNS) {
      if (pattern.test(entry) || pattern.test(fullPath)) {
        return true;
      }
    }

    if (this.config.ignore) {
      for (const ignore of this.config.ignore) {
        if (fullPath.includes(ignore)) {
          return true;
        }
      }
    }

    return false;
  }

  private isTypeScriptFile(filename: string): boolean {
    return extname(filename) ***REMOVED******REMOVED******REMOVED*** '.ts' || extname(filename) ***REMOVED******REMOVED******REMOVED*** '.js';
  }

  private scanFile(filePath: string): void {
    const content ***REMOVED*** readFileSync(filePath, 'utf-8');
    const lines ***REMOVED*** content.split('\n');

    this.filesScanned++;

    // Detect Express route definitions
    for (let i ***REMOVED*** 0; i < lines.length; i++) {
      const line ***REMOVED*** lines[i];
      const lineNumber ***REMOVED*** i + 1;

      // Check for route definitions
      const routeMatch ***REMOVED*** line.match(
        /(app|router)\.(get|post|put|delete|patch|use)\s*\(\s*['"`]([^'"`]+)['"`]/
      );

      if (routeMatch) {
        const [, , method, path] ***REMOVED*** routeMatch;
        this.routesScanned++;

        const routeInfo: RouteInfo ***REMOVED*** {
          path,
          file: filePath,
          line: lineNumber,
          method: method.toUpperCase(),
          middleware: this.extractMiddleware(lines, i),
          hasAuth: this.checkForAuthMiddleware(lines, i),
          hasRateLimit: this.checkForRateLimitMiddleware(lines, i)
        };

        this.checkRouteSecurity(routeInfo, content);
      }

      // Check for secret exposure
      this.checkSecretExposure(line, filePath, lineNumber);

      // Check for SQL injection
      this.checkSQLInjection(line, filePath, lineNumber);
    }

    // Check for security headers (global middleware)
    this.checkSecurityHeaders(content, filePath);
  }

  private extractMiddleware(lines: string[], routeLineIndex: number): string[] {
    const middleware: string[] ***REMOVED*** [];
    const line ***REMOVED*** lines[routeLineIndex];

    // Extract middleware from route definition
    const middlewareMatch ***REMOVED*** line.match(
      /\.(get|post|put|delete|patch|use)\s*\(\s*(?:\[([^)]+)\]|([^,]+))/,
    );

    if (middlewareMatch) {
      const mwString ***REMOVED*** middlewareMatch[1] || middlewareMatch[2] || '';
      if (mwString) {
        const mwList ***REMOVED*** mwString.split(',').map(m ***REMOVED***> m.trim().replace(/['"`]/g, ''));
        middleware.push(...mwList);
      }
    }

    return middleware;
  }

  private checkForAuthMiddleware(lines: string[], routeLineIndex: number): boolean {
    // Check the line and lines above for auth middleware
    const contextLines ***REMOVED*** lines.slice(Math.max(0, routeLineIndex - 5), routeLineIndex + 1).join(' ');

    for (const pattern of EXPRESS_AUTH_PATTERNS) {
      if (contextLines.includes(pattern)) {
        return true;
      }
    }

    // Check if route uses .all() with auth
    const routeLine ***REMOVED*** lines[routeLineIndex];
    if (routeLine.includes('authenticate') || routeLine.includes('auth')) {
      return true;
    }

    return false;
  }

  private checkForRateLimitMiddleware(lines: string[], routeLineIndex: number): boolean {
    // Check global middleware (look backwards)
    for (let i ***REMOVED*** Math.max(0, routeLineIndex - 20); i <***REMOVED*** routeLineIndex; i++) {
      const line ***REMOVED*** lines[i];

      for (const pattern of EXPRESS_RATE_LIMIT_PATTERNS) {
        if (line.includes(pattern)) {
          return true;
        }
      }
    }

    return false;
  }

  private checkRouteSecurity(route: RouteInfo, fileContent: string): void {
    // Check 1: Auth required
    if (!route.hasAuth && this.isSensitiveRoute(route.path)) {
      this.addIssue({
        route: route.path,
        file: route.file,
        line: route.line,
        issue: 'Route without authentication middleware',
        severity: 'critical',
        fix: 'Add authentication middleware (e.g., passport.authenticate, jwt middleware)',
        checkType: 'auth-required'
      });
    }

    // Check 2: Open endpoints
    if (route.path.includes('/') && !route.hasAuth) {
      this.addIssue({
        route: route.path,
        file: route.file,
        line: route.line,
        issue: 'Publicly accessible route - potential data exposure',
        severity: route.path.match(/\/api|\/admin|\/user/) ? 'warning' : 'info',
        fix: 'Consider adding authentication or rate limiting',
        checkType: 'open-endpoints'
      });
    }

    // Check 3: Rate limiting
    if (!route.hasRateLimit) {
      this.addIssue({
        route: route.path,
        file: route.file,
        line: route.line,
        issue: 'Route without rate limiting middleware',
        severity: 'warning',
        fix: 'Add rate limiting middleware (express-rate-limit)',
        checkType: 'rate-limiting'
      });
    }
  }

  private isSensitiveRoute(path: string): boolean {
    const sensitivePatterns ***REMOVED*** [
      /\/api/,
      /\/admin/,
      /\/user/,
      /\/auth/,
      /\/login/,
      /\/data/
    ];

    return sensitivePatterns.some(pattern ***REMOVED***> pattern.test(path));
  }

  private checkSecurityHeaders(content: string, filePath: string): void {
    const hasHelmet ***REMOVED*** SECURITY_HEADER_PATTERNS.some(p ***REMOVED***> content.includes(p));

    if (!hasHelmet) {
      this.addIssue({
        route: 'Global',
        file: filePath,
        line: 1,
        issue: 'Missing security headers middleware',
        severity: 'warning',
        fix: 'Add helmet middleware for security headers',
        checkType: 'security-headers'
      });
    }
  }

  private checkSecretExposure(line: string, filePath: string, lineNumber: number): void {
    // Skip if using environment variables
    if (line.includes('process.env')) {
      return;
    }

    for (const pattern of SECRET_PATTERNS) {
      if (pattern.test(line)) {
        this.addIssue({
          route: 'N/A',
          file: filePath,
          line: lineNumber,
          issue: 'Potential hardcoded secret/key',
          severity: 'critical',
          fix: 'Move to environment variables',
          checkType: 'secret-exposure'
        });
      }
    }
  }

  private checkSQLInjection(line: string, filePath: string, lineNumber: number): void {
    for (const pattern of SQL_INJECTION_PATTERNS) {
      if (pattern.test(line)) {
        this.addIssue({
          route: 'N/A',
          file: filePath,
          line: lineNumber,
          issue: 'Potential SQL injection vulnerability',
          severity: 'critical',
          fix: 'Use parameterized queries or ORM',
          checkType: 'sql-injection'
        });
      }
    }
  }

  private addIssue(issue: SecurityIssue): void {
    // Filter by severity
    if (this.config.severity ***REMOVED******REMOVED******REMOVED*** 'critical' && issue.severity !***REMOVED******REMOVED*** 'critical') {
      return;
    }
    if (this.config.severity ***REMOVED******REMOVED******REMOVED*** 'warning' && issue.severity ***REMOVED******REMOVED******REMOVED*** 'info') {
      return;
    }

    this.issues.push(issue);
  }

  getStats() {
    return {
      routesScanned: this.routesScanned,
      filesScanned: this.filesScanned,
      criticalIssues: this.issues.filter(i ***REMOVED***> i.severity ***REMOVED******REMOVED******REMOVED*** 'critical').length,
      warningIssues: this.issues.filter(i ***REMOVED***> i.severity ***REMOVED******REMOVED******REMOVED*** 'warning').length,
      infoIssues: this.issues.filter(i ***REMOVED***> i.severity ***REMOVED******REMOVED******REMOVED*** 'info').length
    };
  }
}
