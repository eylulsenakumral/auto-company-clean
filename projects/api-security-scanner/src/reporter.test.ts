import { Reporter } from './reporter';
import { SecurityIssue, ScanResult } from './types';

describe('Reporter', () ***REMOVED***> {
  const mockIssues: SecurityIssue[] ***REMOVED*** [
    {
      route: '/api/users',
      file: '/src/routes.ts',
      line: 10,
      issue: 'Route without authentication',
      severity: 'critical',
      fix: 'Add auth middleware',
      checkType: 'auth-required'
    },
    {
      route: '/api/data',
      file: '/src/routes.ts',
      line: 20,
      issue: 'Missing rate limiting',
      severity: 'warning',
      fix: 'Add rate limiting',
      checkType: 'rate-limiting'
    },
    {
      route: '/health',
      file: '/src/routes.ts',
      line: 5,
      issue: 'Public endpoint',
      severity: 'info',
      fix: 'Consider auth',
      checkType: 'open-endpoints'
    }
  ];

  const mockStats ***REMOVED*** {
    routesScanned: 10,
    filesScanned: 2,
    criticalIssues: 1,
    warningIssues: 1,
    infoIssues: 1
  };

  describe('generateJson', () ***REMOVED***> {
    it('should generate valid JSON result', () ***REMOVED***> {
      const result ***REMOVED*** Reporter.generateJson(mockIssues, mockStats);

      expect(result).toHaveProperty('issues');
      expect(result).toHaveProperty('summary');
      expect(result).toHaveProperty('timestamp');
      expect(result.issues).toEqual(mockIssues);
    });

    it('should include correct summary', () ***REMOVED***> {
      const result ***REMOVED*** Reporter.generateJson(mockIssues, mockStats);

      expect(result.summary.critical).toBe(1);
      expect(result.summary.warning).toBe(1);
      expect(result.summary.info).toBe(1);
      expect(result.summary.totalRoutes).toBe(10);
      expect(result.summary.filesScanned).toBe(2);
    });

    it('should include ISO timestamp', () ***REMOVED***> {
      const result ***REMOVED*** Reporter.generateJson(mockIssues, mockStats);

      expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });
  });

  describe('getExitCode', () ***REMOVED***> {
    it('should return 1 for critical issues', () ***REMOVED***> {
      const code ***REMOVED*** Reporter.getExitCode(mockIssues);
      expect(code).toBe(1);
    });

    it('should return 0 for only warnings', () ***REMOVED***> {
      const warningsOnly ***REMOVED*** mockIssues.filter(i ***REMOVED***> i.severity !***REMOVED******REMOVED*** 'critical');
      const code ***REMOVED*** Reporter.getExitCode(warningsOnly);
      expect(code).toBe(0);
    });

    it('should return 0 for no issues', () ***REMOVED***> {
      const code ***REMOVED*** Reporter.getExitCode([]);
      expect(code).toBe(0);
    });
  });

  describe('printTable', () ***REMOVED***> {
    it('should handle empty issues', () ***REMOVED***> {
      // Should not throw
      Reporter.printTable([]);
    });

    it('should handle issues with all severities', () ***REMOVED***> {
      // Should not throw
      Reporter.printTable(mockIssues);
    });
  });

  describe('printSummary', () ***REMOVED***> {
    it('should handle valid result', () ***REMOVED***> {
      const result: ScanResult ***REMOVED*** {
        issues: mockIssues,
        summary: {
          critical: 1,
          warning: 1,
          info: 1,
          totalRoutes: 10,
          filesScanned: 2
        },
        timestamp: '2024-01-01T00:00:00.000Z'
      };

      // Should not throw
      Reporter.printSummary(result);
    });
  });
});
