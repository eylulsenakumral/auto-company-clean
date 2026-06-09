/**
 * Test runner abstraction layer
 */
import type { FlakyConfig, TestRunResult } from './types.js';
/**
 * Run a single test iteration
 */
export declare function runTestIteration(config: FlakyConfig, runNumber: number): Promise<TestRunResult>;
/**
 * Run the test suite N times
 */
export declare function runTestSuite(config: FlakyConfig): Promise<TestRunResult[]>;
//# sourceMappingURL***REMOVED***runner.d.ts.map