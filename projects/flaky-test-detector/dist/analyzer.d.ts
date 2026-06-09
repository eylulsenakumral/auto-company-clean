/**
 * Core flakiness analysis logic
 */
import type { FlakyConfig, FlakyReport, TestResult, TestRunResult, PatternAnalysis } from './types.js';
/**
 * Analyze test runs and generate flaky report
 */
export declare function analyzeFlakiness(runs: TestRunResult[], config: FlakyConfig): FlakyReport;
/**
 * Analyze patterns and suggest causes
 */
export declare function analyzePatterns(result: TestResult): PatternAnalysis;
/**
 * Get suspected cause for a flaky test
 */
export declare function getSuspectedCause(result: TestResult): string;
/**
 * Get suggested fix for a flaky test
 */
export declare function getSuggestedFix(result: TestResult): string;
//# sourceMappingURL***REMOVED***analyzer.d.ts.map