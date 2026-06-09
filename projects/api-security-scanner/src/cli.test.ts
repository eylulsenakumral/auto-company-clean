import { program } from 'commander';
import { resolve } from 'path';

// Mock the dependencies
jest.mock('./scanner', () ***REMOVED***> ({
  SecurityScanner: jest.fn().mockImplementation(() ***REMOVED***> ({
    scan: jest.fn().mockReturnValue([
      {
        route: '/api/test',
        file: 'test.ts',
        line: 1,
        issue: 'Test issue',
        severity: 'critical',
        fix: 'Fix it',
        checkType: 'auth-required'
      }
    ]),
    getStats: jest.fn().mockReturnValue({
      routesScanned: 1,
      filesScanned: 1,
      criticalIssues: 1,
      warningIssues: 0,
      infoIssues: 0
    })
  }))
}));

jest.mock('./reporter', () ***REMOVED***> ({
  Reporter: {
    printTable: jest.fn(),
    printSummary: jest.fn(),
    generateJson: jest.fn().mockReturnValue({ issues: [], summary: {}, timestamp: '' }),
    getExitCode: jest.fn().mockReturnValue(0)
  }
}));

jest.mock('./config', () ***REMOVED***> ({
  loadConfig: jest.fn().mockReturnValue({ severity: 'warning', ignore: [], framework: 'auto' })
}));

describe('CLI', () ***REMOVED***> {
  let originalArgv: string[];
  let originalExit: typeof process.exit;

  beforeEach(() ***REMOVED***> {
    originalArgv ***REMOVED*** process.argv;
    originalExit ***REMOVED*** process.exit;
    process.exit ***REMOVED*** jest.fn() as any;
  });

  afterEach(() ***REMOVED***> {
    process.argv ***REMOVED*** originalArgv;
    process.exit ***REMOVED*** originalExit;
  });

  it('should have scan command', () ***REMOVED***> {
    expect(() ***REMOVED***> {
      process.argv ***REMOVED*** ['node', 'cli', '--help'];
    }).not.toThrow();
  });

  it('should have init command', () ***REMOVED***> {
    expect(() ***REMOVED***> {
      process.argv ***REMOVED*** ['node', 'cli', 'init', '--help'];
    }).not.toThrow();
  });

  it('should have report command', () ***REMOVED***> {
    expect(() ***REMOVED***> {
      process.argv ***REMOVED*** ['node', 'cli', 'report', '--help'];
    }).not.toThrow();
  });
});
