/**
 * Tests for analyzer module
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import {
  analyzeFlakiness,
  analyzePatterns,
  getSuspectedCause,
  getSuggestedFix,
} from '../dist/analyzer.js';
import type { FlakyConfig, TestRunResult } from '../dist/types.js';

describe('analyzeFlakiness', () ***REMOVED***> {
  it('should aggregate test results across runs', () ***REMOVED***> {
    const runs: TestRunResult[] ***REMOVED*** [
      {
        run: 1,
        passed: false,
        tests: new Map([
          ['test-a', true],
          ['test-b', false],
        ]),
        duration: 100,
      },
      {
        run: 2,
        passed: true,
        tests: new Map([
          ['test-a', true],
          ['test-b', true],
        ]),
        duration: 100,
      },
    ];

    const config: FlakyConfig ***REMOVED*** {
      iterations: 2,
      threshold: 30,
      testCommand: 'npm test',
      runner: 'jest',
    };

    const report ***REMOVED*** analyzeFlakiness(runs, config);

    assert.equal(report.results.length, 2);
    assert.equal(report.flakyTests.length, 1);
    assert.equal(report.totalRuns, 2);
  });

  it('should calculate flakiness rate correctly', () ***REMOVED***> {
    const runs: TestRunResult[] ***REMOVED*** [
      {
        run: 1,
        passed: false,
        tests: new Map([['test-a', false]]),
        duration: 100,
      },
      {
        run: 2,
        passed: false,
        tests: new Map([['test-a', true]]),
        duration: 100,
      },
      {
        run: 3,
        passed: false,
        tests: new Map([['test-a', true]]),
        duration: 100,
      },
      {
        run: 4,
        passed: false,
        tests: new Map([['test-a', false]]),
        duration: 100,
      },
    ];

    const config: FlakyConfig ***REMOVED*** {
      iterations: 4,
      threshold: 30,
      testCommand: 'npm test',
      runner: 'jest',
    };

    const report ***REMOVED*** analyzeFlakiness(runs, config);

    const testA ***REMOVED*** report.results.find((r) ***REMOVED***> r.name ***REMOVED******REMOVED******REMOVED*** 'test-a');
    assert(testA);
    assert.equal(testA.failCount, 2);
    assert.equal(testA.passCount, 2);
    assert.equal(testA.flakinessRate, 50);
  });

  it('should sort results by flakiness rate descending', () ***REMOVED***> {
    const runs: TestRunResult[] ***REMOVED*** [
      {
        run: 1,
        passed: false,
        tests: new Map([
          ['test-low', false],
          ['test-high', false],
          ['test-med', false],
        ]),
        duration: 100,
      },
      {
        run: 2,
        passed: false,
        tests: new Map([
          ['test-low', true], // 50% flakiness
          ['test-high', false], // 100% flakiness
          ['test-med', false], // 100% flakiness
        ]),
        duration: 100,
      },
      {
        run: 3,
        passed: false,
        tests: new Map([
          ['test-low', true],
          ['test-high', false],
          ['test-med', true], // 66% flakiness
        ]),
        duration: 100,
      },
    ];

    const config: FlakyConfig ***REMOVED*** {
      iterations: 3,
      threshold: 30,
      testCommand: 'npm test',
      runner: 'jest',
    };

    const report ***REMOVED*** analyzeFlakiness(runs, config);

    // Verify sorting by flakiness rate (descending)
    const rates ***REMOVED*** report.results.map(r ***REMOVED***> ({ name: r.name, rate: r.flakinessRate }));
    assert(rates[0].rate >***REMOVED*** rates[1].rate);
    assert(rates[1].rate >***REMOVED*** rates[2].rate);

    // test-high should have 100% (3/3 failures)
    assert.equal(rates[0].name, 'test-high');
    assert.equal(rates[0].rate, 100);
  });

  it('should not flag tests below threshold as flaky', () ***REMOVED***> {
    const runs: TestRunResult[] ***REMOVED*** [
      {
        run: 1,
        passed: true,
        tests: new Map([['stable-test', true]]),
        duration: 100,
      },
      {
        run: 2,
        passed: true,
        tests: new Map([['stable-test', true]]),
        duration: 100,
      },
    ];

    const config: FlakyConfig ***REMOVED*** {
      iterations: 2,
      threshold: 30,
      testCommand: 'npm test',
      runner: 'jest',
    };

    const report ***REMOVED*** analyzeFlakiness(runs, config);

    assert.equal(report.flakyTests.length, 0);
  });
});

describe('analyzePatterns', () ***REMOVED***> {
  it('should detect timing-related patterns', () ***REMOVED***> {
    const result ***REMOVED*** {
      name: 'timing-test',
      file: 'test.spec.ts',
      passCount: 5,
      failCount: 5,
      totalRuns: 10,
      flakinessRate: 50,
      isFlaky: true,
      pattern: 'FPFPFPFPFP',
    };

    const analysis ***REMOVED*** analyzePatterns(result);

    assert.equal(analysis.type, 'timing');
    assert(analysis.description.includes('race condition'));
  });

  it('should detect order-dependent patterns', () ***REMOVED***> {
    const result ***REMOVED*** {
      name: 'order-test',
      file: 'test.spec.ts',
      passCount: 5,
      failCount: 5,
      totalRuns: 10,
      flakinessRate: 50,
      isFlaky: true,
      pattern: 'FFFFFFPPPP',
    };

    const analysis ***REMOVED*** analyzePatterns(result);

    assert.equal(analysis.type, 'order');
    assert(analysis.description.includes('order'));
  });

  it('should detect resource leakage patterns', () ***REMOVED***> {
    const result ***REMOVED*** {
      name: 'resource-test',
      file: 'test.spec.ts',
      passCount: 8,
      failCount: 2,
      totalRuns: 10,
      flakinessRate: 20,
      isFlaky: false, // below threshold for this test case
      pattern: 'PPPPPPPPFF', // Contains PPPPFFFFP pattern after many passes
    };

    const analysis ***REMOVED*** analyzePatterns(result);

    assert.equal(analysis.type, 'resource');
    assert(analysis.description.includes('resource'));
  });

  it('should detect async issues for high flakiness', () ***REMOVED***> {
    const result ***REMOVED*** {
      name: 'async-test',
      file: 'test.spec.ts',
      passCount: 2,
      failCount: 8,
      totalRuns: 10,
      flakinessRate: 80,
      isFlaky: true,
      pattern: 'FPFPFPFPFP', // Alternating pattern but high flakiness rate
    };

    const analysis ***REMOVED*** analyzePatterns(result);

    assert.equal(analysis.type, 'async');
    assert(analysis.description.includes('async'));
  });
});

describe('getSuspectedCause', () ***REMOVED***> {
  it('should return cause with type', () ***REMOVED***> {
    const result ***REMOVED*** {
      name: 'test',
      file: 'test.ts',
      passCount: 5,
      failCount: 5,
      totalRuns: 10,
      flakinessRate: 50,
      isFlaky: true,
      pattern: 'FPFPFPFPFP',
    };

    const cause ***REMOVED*** getSuspectedCause(result);

    assert(cause.includes('timing'));
  });
});

describe('getSuggestedFix', () ***REMOVED***> {
  it('should return actionable suggestion', () ***REMOVED***> {
    const result ***REMOVED*** {
      name: 'test',
      file: 'test.ts',
      passCount: 5,
      failCount: 5,
      totalRuns: 10,
      flakinessRate: 50,
      isFlaky: true,
      pattern: 'FPFPFPFPFP',
    };

    const fix ***REMOVED*** getSuggestedFix(result);

    assert(typeof fix ***REMOVED******REMOVED******REMOVED*** 'string');
    assert(fix.length > 0);
  });
});
