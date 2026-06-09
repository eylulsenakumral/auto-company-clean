/**
 * Core scanner - orchestrates all security checks
 */

import { readdir, readFile, stat } from 'node:fs/promises';
import { join, relative, extname } from 'node:path';
import { existsSync } from 'node:fs';
import { loadConfig } from './config.js';
import {
  SecurityIssue,
  ScanResult,
  ScanOptions,
  LambdaFunction,
  ServerlessConfig,
  SamConfig,
  Summary,
  IssueType,
  Severity,
} from './types.js';
import {
  SECRET_PATTERNS,
  IAM_PATTERNS,
  DEPRECATED_RUNTIMES,
  SUSPICIOUS_ENV_VARS,
  TIMEOUT_THRESHOLDS,
  PUBLIC_AUTH_TYPES,
  HANDLER_PATTERNS,
  DEFAULT_IGNORE_PATTERNS,
} from './patterns.js';

/**
 * Main scanner class
 */
export class ServerlessSecurityScanner {
  private projectPath: string;
  private config!: Awaited<ReturnType<typeof loadConfig>>;
  private options: ScanOptions;
  private issues: SecurityIssue[] ***REMOVED*** [];
  private lambdas: LambdaFunction[] ***REMOVED*** [];
  private scanned ***REMOVED*** new Set<string>();

  constructor(projectPath: string, options: ScanOptions ***REMOVED*** {}) {
    this.projectPath ***REMOVED*** projectPath;
    this.options ***REMOVED*** { ...options };
    if (!this.options.path) {
      this.options.path ***REMOVED*** projectPath;
    }
  }

  /**
   * Initialize and load config
   */
  async init(): Promise<void> {
    this.config ***REMOVED*** await loadConfig(this.projectPath);

    // Merge ignore patterns
    const ignore ***REMOVED*** [...this.config.ignore, ...DEFAULT_IGNORE_PATTERNS];
    if (this.options.ignore) {
      ignore.push(...this.options.ignore);
    }
    this.options.ignore ***REMOVED*** ignore;
  }

  /**
   * Run full security scan
   */
  async scan(): Promise<ScanResult> {
    await this.init();

    // Detect and parse framework config
    await this.detectFramework();

    // Scan code files for secrets
    await this.scanCodeFiles();

    // Scan for security issues
    this.scanLambdaFunctions();

    // Scan dependencies (optional v0.1)
    // await this.scanDependencies();

    // Filter by severity
    let issues ***REMOVED*** this.issues;
    if (this.options.severity) {
      issues ***REMOVED*** this.filterBySeverity(issues, this.options.severity);
    }

    // Deduplicate issues
    issues ***REMOVED*** this.deduplicateIssues(issues);

    const summary ***REMOVED*** this.calculateSummary(issues);

    return {
      project: this.projectPath,
      scannedAt: new Date(),
      summary,
      issues,
    };
  }

  /**
   * Detect framework (Serverless/SAM) and parse config
   */
  private async detectFramework(): Promise<void> {
    const framework ***REMOVED*** this.options.framework || this.config.framework;

    if (framework ***REMOVED******REMOVED******REMOVED*** 'serverless' || framework ***REMOVED******REMOVED******REMOVED*** 'auto') {
      const serverlessPath ***REMOVED*** join(this.projectPath, 'serverless.yml');
      if (existsSync(serverlessPath)) {
        await this.parseServerlessConfig(serverlessPath);
        return;
      }
    }

    if (framework ***REMOVED******REMOVED******REMOVED*** 'sam' || framework ***REMOVED******REMOVED******REMOVED*** 'auto') {
      const samPath ***REMOVED*** join(this.projectPath, 'template.yaml');
      const samPathYml ***REMOVED*** join(this.projectPath, 'template.yml');
      const templatePath ***REMOVED*** existsSync(samPath) ? samPath : existsSync(samPathYml) ? samPathYml : null;
      if (templatePath) {
        await this.parseSamConfig(templatePath);
        return;
      }
    }
  }

  /**
   * Parse serverless.yml config
   */
  private async parseServerlessConfig(filePath: string): Promise<void> {
    try {
      const yaml ***REMOVED*** await import('js-yaml');
      const content ***REMOVED*** await readFile(filePath, 'utf-8');
      const config ***REMOVED*** yaml.load(content) as ServerlessConfig;

      if (!config) return;

      // Parse provider IAM statements
      if (config.provider?.iamRoleStatements) {
        this.checkIamStatements(config.provider.iamRoleStatements, filePath);
      }

      // Parse environment variables at provider level
      if (config.provider?.environment) {
        this.checkEnvironmentVariables(config.provider.environment, 'provider', filePath);
      }

      // Parse functions
      if (config.functions) {
        for (const [name, fn] of Object.entries(config.functions)) {
          this.lambdas.push({
            name,
            handler: fn.handler,
            runtime: fn.runtime || config.provider?.runtime,
            timeout: fn.timeout,
            memory: fn.memory,
            environment: fn.environment || config.provider?.environment,
            iamRole: fn.iamRole,
            events: this.normalizeEvents(fn.events),
            file: filePath,
          });
        }
      }
    } catch (error) {
      // Silently fail on parse errors
    }
  }

  /**
   * Parse SAM template.yaml
   */
  private async parseSamConfig(filePath: string): Promise<void> {
    try {
      const yaml ***REMOVED*** await import('js-yaml');
      const content ***REMOVED*** await readFile(filePath, 'utf-8');
      const config ***REMOVED*** yaml.load(content) as SamConfig;

      if (!config?.Resources) return;

      for (const [resourceName, resource] of Object.entries(config.Resources)) {
        if (resource.Type ***REMOVED******REMOVED******REMOVED*** 'AWS::Serverless::Function' || resource.Type ***REMOVED******REMOVED******REMOVED*** 'AWS::Lambda::Function') {
          const props ***REMOVED*** resource.Properties || {};
          const events: any[] ***REMOVED*** [];

          // Parse events
          if (props.Events) {
            for (const [eventName, event] of Object.entries(props.Events)) {
              const eventAny ***REMOVED*** event as any;
              if (eventAny.Type ***REMOVED******REMOVED******REMOVED*** 'HttpApi' || eventAny.Type ***REMOVED******REMOVED******REMOVED*** 'Api') {
                const props2 ***REMOVED*** eventAny.Properties || eventAny;
                events.push({
                  type: 'http',
                  http: {
                    path: props2.Path || '/',
                    method: props2.Method || 'ANY',
                    auth: props2.Auth?.Type,
                  },
                });
              }
            }
          }

          this.lambdas.push({
            name: resourceName,
            handler: props.Handler || '',
            runtime: props.Runtime,
            timeout: props.Timeout,
            memory: props.MemorySize,
            environment: props.Environment?.Variables,
            events,
            file: filePath,
          });

          // Check inline policies
          if (props.Policies) {
            this.checkIamStatements(props.Policies, filePath);
          }
        }
      }
    } catch (error) {
      // Silently fail on parse errors
    }
  }

  /**
   * Check IAM statements for over-permissive rules
   */
  private checkIamStatements(statements: any[], file: string): void {
    const statementsArray ***REMOVED*** Array.isArray(statements) ? statements : [];

    for (const stmt of statementsArray) {
      if (!stmt || stmt.Effect !***REMOVED******REMOVED*** 'Allow') continue;

      // Check wildcard actions
      if (IAM_PATTERNS.wildcardAction.pattern.test(JSON.stringify(stmt))) {
        this.addIssue({
          id: `iam-wildcard-${Date.now()}`,
          type: 'iam-wildcard',
          severity: 'critical',
          message: 'IAM policy allows all actions (Action: *)',
          fix: IAM_PATTERNS.wildcardAction.fix,
          file,
          evidence: JSON.stringify(stmt),
        });
      }

      // Check wildcard resources
      if (IAM_PATTERNS.wildcardResource.pattern.test(JSON.stringify(stmt))) {
        this.addIssue({
          id: `iam-wildcard-resource-${Date.now()}`,
          type: 'iam-wildcard',
          severity: 'critical',
          message: 'IAM policy allows all resources (Resource: *)',
          fix: IAM_PATTERNS.wildcardResource.fix,
          file,
          evidence: JSON.stringify(stmt),
        });
      }

      // Check admin access
      if (IAM_PATTERNS.adminAccess.pattern.test(JSON.stringify(stmt))) {
        this.addIssue({
          id: `iam-admin-${Date.now()}`,
          type: 'iam-admin',
          severity: 'critical',
          message: 'IAM policy has administrator access',
          fix: IAM_PATTERNS.adminAccess.fix,
          file,
          evidence: JSON.stringify(stmt),
        });
      }
    }
  }

  /**
   * Normalize Serverless Framework events to Event[] format
   */
  private normalizeEvents(events?: any[]): any[] {
    if (!events) return [];

    const normalized: any[] ***REMOVED*** [];

    for (const event of events) {
      if (!event) continue;

      // Serverless Framework shorthand: { httpApi: { path: ..., method: ... } }
      // or { http: { path: ..., method: ..., auth: ... } }
      if (typeof event ***REMOVED******REMOVED******REMOVED*** 'object') {
        if (event.httpApi) {
          const props ***REMOVED*** event.httpApi;
          normalized.push({
            type: 'http',
            http: {
              path: props.path || '/',
              method: props.method || 'ANY',
              auth: props.auth?.Type || props.auth,
            },
          });
        } else if (event.http) {
          const props ***REMOVED*** event.http;
          normalized.push({
            type: 'http',
            http: {
              path: props.path || '/',
              method: props.method || 'ANY',
              auth: props.auth?.type || props.authorizer ? 'configured' : undefined,
            },
          });
        } else if (event.type ***REMOVED******REMOVED******REMOVED*** 'http' || event.type ***REMOVED******REMOVED******REMOVED*** 'httpApi') {
          // Already normalized format
          normalized.push(event);
        }
      }
    }

    return normalized;
  }

  /**
   * Check environment variables for secrets
   */
  private checkEnvironmentVariables(env: Record<string, string>, context: string, file: string): void {
    for (const [key, value] of Object.entries(env)) {
      // Check if key name looks suspicious
      for (const pattern of SUSPICIOUS_ENV_VARS) {
        if (pattern.test(key) && value && value.length > 10) {
          this.addIssue({
            id: `env-secret-${Date.now()}-${key}`,
            type: 'env-secret',
            severity: 'warning',
            message: `Environment variable '${key}' may contain a secret`,
            fix: 'Use AWS Secrets Manager or Parameter Store',
            file,
            evidence: `${key}***REMOVED***${value.substring(0, 10)}...`,
          });
          break;
        }
      }

      // Check value patterns
      for (const secretPattern of SECRET_PATTERNS) {
        if (secretPattern.pattern.test(value)) {
          this.addIssue({
            id: `env-hardcoded-${Date.now()}-${key}`,
            type: 'hardcoded-secret',
            severity: secretPattern.severity,
            message: `Environment variable '${key}' contains a ${secretPattern.name}`,
            fix: secretPattern.fix,
            file,
            evidence: `${key}***REMOVED***<${secretPattern.name}>`,
          });
        }
      }
    }
  }

  /**
   * Scan all code files for secrets
   */
  private async scanCodeFiles(): Promise<void> {
    for await (const file of this.walkDirectory(this.projectPath)) {
      if (this.shouldIgnore(file)) continue;

      const ext ***REMOVED*** extname(file);
      if (!['.js', '.ts', '.py', '.yml', '.yaml', '.json', '.env'].includes(ext)) continue;

      try {
        const content ***REMOVED*** await readFile(file, 'utf-8');
        this.scanFileContent(content, file);
      } catch {
        // Skip unreadable files
      }
    }
  }

  /**
   * Scan file content for security issues
   */
  private scanFileContent(content: string, file: string): void {
    const lines ***REMOVED*** content.split('\n');

    for (let lineNum ***REMOVED*** 0; lineNum < lines.length; lineNum++) {
      const line ***REMOVED*** lines[lineNum];
      const lineNum1 ***REMOVED*** lineNum + 1;

      // Check for secrets
      for (const pattern of SECRET_PATTERNS) {
        const match ***REMOVED*** line.match(pattern.pattern);
        if (match) {
          this.addIssue({
            id: `secret-${Date.now()}-${lineNum}`,
            type: pattern.type,
            severity: pattern.severity,
            message: `${pattern.name} detected in code`,
            fix: pattern.fix,
            file,
            line: lineNum1,
            evidence: line.trim().substring(0, 80),
          });
        }
      }
    }
  }

  /**
   * Scan Lambda functions for security issues
   */
  private scanLambdaFunctions(): void {
    for (const lambda of this.lambdas) {
      // Check timeout
      if (lambda.timeout && typeof lambda.timeout ***REMOVED******REMOVED******REMOVED*** 'number') {
        if (lambda.timeout > TIMEOUT_THRESHOLDS.critical) {
          this.addIssue({
            id: `timeout-critical-${lambda.name}`,
            function: lambda.name,
            type: 'excessive-timeout',
            severity: 'critical',
            message: `Timeout ${lambda.timeout}s exceeds safe limit (DoS risk, cost concern)`,
            fix: 'Reduce timeout below 60s for most use cases',
            file: lambda.file,
          });
        } else if (lambda.timeout > TIMEOUT_THRESHOLDS.warning) {
          this.addIssue({
            id: `timeout-warning-${lambda.name}`,
            function: lambda.name,
            type: 'excessive-timeout',
            severity: 'warning',
            message: `Timeout ${lambda.timeout}s is high (potential cost issue)`,
            fix: 'Consider reducing timeout or optimizing function',
            file: lambda.file,
          });
        }
      }

      // Check runtime deprecation
      if (this.config.checkRuntime && lambda.runtime) {
        const runtimeKey ***REMOVED*** lambda.runtime as string;
        if (DEPRECATED_RUNTIMES[runtimeKey]) {
          this.addIssue({
            id: `runtime-deprecated-${lambda.name}`,
            function: lambda.name,
            type: 'deprecated-runtime',
            severity: 'warning',
            message: `Runtime ${lambda.runtime} is deprecated: ${DEPRECATED_RUNTIMES[runtimeKey]}`,
            fix: `Update to latest stable runtime`,
            file: lambda.file,
          });
        }
      }

      // Check API Gateway auth
      if (lambda.events) {
        for (const event of lambda.events) {
          if (event.type ***REMOVED******REMOVED******REMOVED*** 'http' && event.http) {
            const auth ***REMOVED*** event.http.auth as any;
            // Check if auth is undefined, null, 'none', or 'NONE' (public endpoint)
            if (!auth || auth ***REMOVED******REMOVED******REMOVED*** 'none' || auth ***REMOVED******REMOVED******REMOVED*** 'NONE') {
              this.addIssue({
                id: `public-api-${lambda.name}`,
                function: lambda.name,
                type: 'public-exposure',
                severity: 'warning',
                message: `API endpoint ${event.http.path} ${event.http.method} has no authentication`,
                fix: 'Add API key, Cognito, or IAM authentication',
                file: lambda.file,
              });
            }
          }
        }
      }

      // Check function-level environment variables
      if (lambda.environment) {
        this.checkEnvironmentVariables(lambda.environment, lambda.name, lambda.file || '');
      }
    }
  }

  /**
   * Walk directory recursively
   */
  private async *walkDirectory(dir: string): AsyncGenerator<string> {
    const entries ***REMOVED*** await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath ***REMOVED*** join(dir, entry.name);

      if (entry.isDirectory()) {
        if (!this.shouldIgnore(fullPath)) {
          yield* this.walkDirectory(fullPath);
        }
      } else if (entry.isFile()) {
        yield fullPath;
      }
    }
  }

  /**
   * Check if path should be ignored
   */
  private shouldIgnore(path: string): boolean {
    const rel ***REMOVED*** relative(this.projectPath, path);

    for (const pattern of this.options.ignore || []) {
      if (pattern.includes('*')) {
        const regex ***REMOVED*** new RegExp('^' + pattern.replace(/\*/g, '.*').replace(/\//g, '\\/'));
        if (regex.test(rel)) return true;
      } else if (rel ***REMOVED******REMOVED******REMOVED*** pattern || rel.startsWith(pattern + '/')) {
        return true;
      }
    }
    return false;
  }

  /**
   * Add issue if not already tracked
   */
  private addIssue(issue: SecurityIssue): void {
    const key ***REMOVED*** `${issue.file}-${issue.line}-${issue.type}-${issue.message}`;
    if (!this.scanned.has(key)) {
      this.scanned.add(key);
      this.issues.push(issue);
    }
  }

  /**
   * Filter issues by severity
   */
  private filterBySeverity(issues: SecurityIssue[], minSeverity: Severity): SecurityIssue[] {
    const levels ***REMOVED*** { critical: 3, warning: 2, info: 1 };
    const min ***REMOVED*** levels[minSeverity];
    return issues.filter((issue) ***REMOVED***> levels[issue.severity] >***REMOVED*** min);
  }

  /**
   * Remove duplicate issues
   */
  private deduplicateIssues(issues: SecurityIssue[]): SecurityIssue[] {
    const seen ***REMOVED*** new Set<string>();
    return issues.filter((issue) ***REMOVED***> {
      const key ***REMOVED*** `${issue.file}:${issue.line}:${issue.type}:${issue.message}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  /**
   * Calculate summary stats
   */
  private calculateSummary(issues: SecurityIssue[]): Summary {
    const summary: Summary ***REMOVED*** { critical: 0, warning: 0, info: 0, total: issues.length };

    for (const issue of issues) {
      if (issue.severity ***REMOVED******REMOVED******REMOVED*** 'critical') summary.critical++;
      else if (issue.severity ***REMOVED******REMOVED******REMOVED*** 'warning') summary.warning++;
      else if (issue.severity ***REMOVED******REMOVED******REMOVED*** 'info') summary.info++;
    }

    return summary;
  }
}

/**
 * Convenience function to scan a project
 */
export async function scanProject(projectPath: string, options?: ScanOptions): Promise<ScanResult> {
  const scanner ***REMOVED*** new ServerlessSecurityScanner(projectPath, options);
  return scanner.scan();
}
