import { SecurityScanner } from './scanner';
import { ScannerConfig, SecurityIssue } from './types';
import { writeFileSync, mkdirSync, rmSync, rmdirSync } from 'fs';
import { join } from 'path';

describe('SecurityScanner', () ***REMOVED***> {
  const testDir ***REMOVED*** join(__dirname, '../test-fixtures');
  const config: ScannerConfig ***REMOVED*** {
    severity: 'info',
    ignore: [],
    framework: 'express'
  };

  beforeEach(() ***REMOVED***> {
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() ***REMOVED***> {
    try {
      rmSync(testDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('route detection', () ***REMOVED***> {
    it('should detect Express GET routes', () ***REMOVED***> {
      const testFile ***REMOVED*** join(testDir, 'routes.ts');
      writeFileSync(testFile, "app.get('/api/users', (req, res) ***REMOVED***> {});");

      const scanner ***REMOVED*** new SecurityScanner(config);
      const issues ***REMOVED*** scanner.scan(testDir);

      expect(issues.length).toBeGreaterThan(0);
      expect(issues.some(i ***REMOVED***> i.route ***REMOVED******REMOVED******REMOVED*** '/api/users')).toBe(true);
    });

    it('should detect Express POST routes', () ***REMOVED***> {
      const testFile ***REMOVED*** join(testDir, 'routes.ts');
      writeFileSync(testFile, "app.post('/api/data', (req, res) ***REMOVED***> {});");

      const scanner ***REMOVED*** new SecurityScanner(config);
      const issues ***REMOVED*** scanner.scan(testDir);

      expect(issues.some(i ***REMOVED***> i.route ***REMOVED******REMOVED******REMOVED*** '/api/data')).toBe(true);
    });

    it('should detect router methods', () ***REMOVED***> {
      const testFile ***REMOVED*** join(testDir, 'routes.ts');
      writeFileSync(testFile, "router.delete('/api/items/:id', handler);");

      const scanner ***REMOVED*** new SecurityScanner(config);
      const issues ***REMOVED*** scanner.scan(testDir);

      expect(issues.some(i ***REMOVED***> i.route ***REMOVED******REMOVED******REMOVED*** '/api/items/:id')).toBe(true);
    });
  });

  describe('auth detection', () ***REMOVED***> {
    it('should flag routes without auth middleware', () ***REMOVED***> {
      const testFile ***REMOVED*** join(testDir, 'routes.ts');
      writeFileSync(testFile, "app.get('/api/users', (req, res) ***REMOVED***> {});");

      const scanner ***REMOVED*** new SecurityScanner(config);
      const issues ***REMOVED*** scanner.scan(testDir);

      const authIssues ***REMOVED*** issues.filter(i ***REMOVED***> i.checkType ***REMOVED******REMOVED******REMOVED*** 'auth-required');
      expect(authIssues.length).toBeGreaterThan(0);
      expect(authIssues[0].severity).toBe('critical');
    });

    it('should recognize passport authenticate middleware', () ***REMOVED***> {
      const testFile ***REMOVED*** join(testDir, 'routes.ts');
      writeFileSync(
        testFile,
        "app.get('/api/users', passport.authenticate('jwt', { session: false }), handler);",
      );

      const scanner ***REMOVED*** new SecurityScanner(config);
      const issues ***REMOVED*** scanner.scan(testDir);

      const authIssues ***REMOVED*** issues.filter(i ***REMOVED***> i.checkType ***REMOVED******REMOVED******REMOVED*** 'auth-required');
      expect(authIssues.length).toBe(0);
    });

    it('should recognize custom auth middleware', () ***REMOVED***> {
      const testFile ***REMOVED*** join(testDir, 'routes.ts');
      writeFileSync(
        testFile,
        "app.get('/api/users', requireAuth, (req, res) ***REMOVED***> {});",
      );

      const scanner ***REMOVED*** new SecurityScanner(config);
      const issues ***REMOVED*** scanner.scan(testDir);

      const authIssues ***REMOVED*** issues.filter(i ***REMOVED***> i.checkType ***REMOVED******REMOVED******REMOVED*** 'auth-required');
      expect(authIssues.length).toBe(0);
    });
  });

  describe('rate limiting detection', () ***REMOVED***> {
    it('should flag routes without rate limiting', () ***REMOVED***> {
      const testFile ***REMOVED*** join(testDir, 'routes.ts');
      writeFileSync(testFile, "app.get('/api/users', (req, res) ***REMOVED***> {});");

      const scanner ***REMOVED*** new SecurityScanner(config);
      const issues ***REMOVED*** scanner.scan(testDir);

      const rateLimitIssues ***REMOVED*** issues.filter(i ***REMOVED***> i.checkType ***REMOVED******REMOVED******REMOVED*** 'rate-limiting');
      expect(rateLimitIssues.length).toBeGreaterThan(0);
    });

    it('should recognize express-rate-limit middleware', () ***REMOVED***> {
      const testFile ***REMOVED*** join(testDir, 'routes.ts');
      writeFileSync(
        testFile,
        `const limiter ***REMOVED*** rateLimit({ windowMs: 60000, max: 100 });
         app.get('/api/users', limiter, handler);`,
      );

      const scanner ***REMOVED*** new SecurityScanner(config);
      const issues ***REMOVED*** scanner.scan(testDir);

      const rateLimitIssues ***REMOVED*** issues.filter(i ***REMOVED***> i.checkType ***REMOVED******REMOVED******REMOVED*** 'rate-limiting');
      expect(rateLimitIssues.length).toBe(0);
    });
  });

  describe('security headers detection', () ***REMOVED***> {
    it('should flag missing helmet middleware', () ***REMOVED***> {
      const testFile ***REMOVED*** join(testDir, 'app.ts');
      writeFileSync(testFile, "app.get('/api/users', handler);");

      const scanner ***REMOVED*** new SecurityScanner(config);
      const issues ***REMOVED*** scanner.scan(testDir);

      const headerIssues ***REMOVED*** issues.filter(i ***REMOVED***> i.checkType ***REMOVED******REMOVED******REMOVED*** 'security-headers');
      expect(headerIssues.length).toBeGreaterThan(0);
    });

    it('should recognize helmet middleware', () ***REMOVED***> {
      const testFile ***REMOVED*** join(testDir, 'app.ts');
      writeFileSync(
        testFile,
        "app.use(helmet()); app.get('/api/users', handler);",
      );

      const scanner ***REMOVED*** new SecurityScanner(config);
      const issues ***REMOVED*** scanner.scan(testDir);

      const headerIssues ***REMOVED*** issues.filter(i ***REMOVED***> i.checkType ***REMOVED******REMOVED******REMOVED*** 'security-headers');
      expect(headerIssues.length).toBe(0);
    });
  });

  describe('secret exposure detection', () ***REMOVED***> {
    it('should detect hardcoded API keys', () ***REMOVED***> {
      const testFile ***REMOVED*** join(testDir, 'config.ts');
      writeFileSync(testFile, "const apiKey ***REMOVED*** 'sk_live_1234567890abcdef';");

      const scanner ***REMOVED*** new SecurityScanner(config);
      const issues ***REMOVED*** scanner.scan(testDir);

      const secretIssues ***REMOVED*** issues.filter(i ***REMOVED***> i.checkType ***REMOVED******REMOVED******REMOVED*** 'secret-exposure');
      expect(secretIssues.length).toBeGreaterThan(0);
      expect(secretIssues[0].severity).toBe('critical');
    });

    it('should ignore environment variables', () ***REMOVED***> {
      const testFile ***REMOVED*** join(testDir, 'config.ts');
      writeFileSync(testFile, "const apiKey ***REMOVED*** process.env.API_KEY;");

      const scanner ***REMOVED*** new SecurityScanner(config);
      const issues ***REMOVED*** scanner.scan(testDir);

      const secretIssues ***REMOVED*** issues.filter(i ***REMOVED***> i.checkType ***REMOVED******REMOVED******REMOVED*** 'secret-exposure');
      expect(secretIssues.length).toBe(0);
    });

    it('should detect Discord tokens', () ***REMOVED***> {
      const testFile ***REMOVED*** join(testDir, 'bot.ts');
      writeFileSync(testFile, "const token ***REMOVED*** '***REMOVED***';");

      const scanner ***REMOVED*** new SecurityScanner(config);
      const issues ***REMOVED*** scanner.scan(testDir);

      const secretIssues ***REMOVED*** issues.filter(i ***REMOVED***> i.checkType ***REMOVED******REMOVED******REMOVED*** 'secret-exposure');
      expect(secretIssues.length).toBeGreaterThan(0);
    });
  });

  describe('SQL injection detection', () ***REMOVED***> {
    it('should detect template literal concatenation', () ***REMOVED***> {
      const testFile ***REMOVED*** join(testDir, 'db.ts');
      writeFileSync(testFile, "db.query(`SELECT * FROM users WHERE id ***REMOVED*** ${userId}`);");

      const scanner ***REMOVED*** new SecurityScanner(config);
      const issues ***REMOVED*** scanner.scan(testDir);

      const sqlIssues ***REMOVED*** issues.filter(i ***REMOVED***> i.checkType ***REMOVED******REMOVED******REMOVED*** 'sql-injection');
      expect(sqlIssues.length).toBeGreaterThan(0);
    });

    it('should detect string concatenation in queries', () ***REMOVED***> {
      const testFile ***REMOVED*** join(testDir, 'db.ts');
      writeFileSync(testFile, "db.query('SELECT * FROM users WHERE name ***REMOVED*** ' + userName);");

      const scanner ***REMOVED*** new SecurityScanner(config);
      const issues ***REMOVED*** scanner.scan(testDir);

      const sqlIssues ***REMOVED*** issues.filter(i ***REMOVED***> i.checkType ***REMOVED******REMOVED******REMOVED*** 'sql-injection');
      expect(sqlIssues.length).toBeGreaterThan(0);
    });
  });

  describe('open endpoints detection', () ***REMOVED***> {
    it('should flag public API endpoints', () ***REMOVED***> {
      const testFile ***REMOVED*** join(testDir, 'routes.ts');
      writeFileSync(testFile, "app.get('/api/data', (req, res) ***REMOVED***> {});");

      const scanner ***REMOVED*** new SecurityScanner(config);
      const issues ***REMOVED*** scanner.scan(testDir);

      const openIssues ***REMOVED*** issues.filter(i ***REMOVED***> i.checkType ***REMOVED******REMOVED******REMOVED*** 'open-endpoints');
      expect(openIssues.length).toBeGreaterThan(0);
    });
  });

  describe('config filtering', () ***REMOVED***> {
    it('should filter by severity level', () ***REMOVED***> {
      const testFile ***REMOVED*** join(testDir, 'routes.ts');
      writeFileSync(testFile, "app.get('/api/data', (req, res) ***REMOVED***> {});");

      const configCritical: ScannerConfig ***REMOVED*** { ...config, severity: 'critical' };
      const scanner ***REMOVED*** new SecurityScanner(configCritical);
      const issues ***REMOVED*** scanner.scan(testDir);

      // Only critical issues should remain
      expect(issues.every(i ***REMOVED***> i.severity ***REMOVED******REMOVED******REMOVED*** 'critical')).toBe(true);
    });

    it('should ignore specified directories', () ***REMOVED***> {
      const testFile ***REMOVED*** join(testDir, 'routes.ts');
      writeFileSync(testFile, "app.get('/test', handler);");

      const ignoredDir ***REMOVED*** join(testDir, 'dist');
      mkdirSync(ignoredDir, { recursive: true });
      writeFileSync(join(ignoredDir, 'ignored.ts'), "app.get('/ignored', handler);");

      const configIgnore: ScannerConfig ***REMOVED*** {
        ...config,
        ignore: ['dist']
      };

      const scanner ***REMOVED*** new SecurityScanner(configIgnore);
      scanner.scan(testDir);

      const stats ***REMOVED*** scanner.getStats();
      expect(stats.filesScanned).toBe(1); // Only routes.ts
    });
  });

  describe('statistics', () ***REMOVED***> {
    it('should track scanned files and routes', () ***REMOVED***> {
      const testFile ***REMOVED*** join(testDir, 'routes.ts');
      writeFileSync(
        testFile,
        "app.get('/api/users', handler);\napp.post('/api/data', handler);",
      );

      const scanner ***REMOVED*** new SecurityScanner(config);
      scanner.scan(testDir);
      const stats ***REMOVED*** scanner.getStats();

      expect(stats.filesScanned).toBe(1);
      expect(stats.routesScanned).toBe(2);
    });

    it('should count issues by severity', () ***REMOVED***> {
      const testFile ***REMOVED*** join(testDir, 'routes.ts');
      writeFileSync(
        testFile,
        "app.get('/api/users', handler);\nconst key ***REMOVED*** 'sk_live_12345';",
      );

      const scanner ***REMOVED*** new SecurityScanner(config);
      scanner.scan(testDir);
      const stats ***REMOVED*** scanner.getStats();

      expect(stats.criticalIssues).toBeGreaterThan(0);
    });
  });

  describe('edge cases', () ***REMOVED***> {
    it('should handle empty directory', () ***REMOVED***> {
      const scanner ***REMOVED*** new SecurityScanner(config);
      const issues ***REMOVED*** scanner.scan(testDir);

      expect(issues).toEqual([]);
    });

    it('should handle malformed TypeScript gracefully', () ***REMOVED***> {
      const testFile ***REMOVED*** join(testDir, 'bad-syntax.ts');
      writeFileSync(testFile, "this is not valid typescript {{{");

      const scanner ***REMOVED*** new SecurityScanner(config);
      const issues ***REMOVED*** scanner.scan(testDir);

      // Should not throw
      expect(Array.isArray(issues)).toBe(true);
    });

    it('should ignore test files', () ***REMOVED***> {
      const testFile ***REMOVED*** join(testDir, 'routes.test.ts');
      writeFileSync(testFile, "app.get('/test', handler);");

      const scanner ***REMOVED*** new SecurityScanner(config);
      const issues ***REMOVED*** scanner.scan(testDir);

      expect(issues.length).toBe(0);
    });
  });
});
