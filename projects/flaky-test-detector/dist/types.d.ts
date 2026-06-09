/**
 * Core types for flaky test detector
 */
export interface FlakyConfig {
    /** Number of times to run the test suite */
    iterations: number;
    /** Failure rate threshold to flag a test as flaky (0-100) */
    threshold: number;
    /** Test command to execute */
    testCommand: string;
    /** Test runner type */
    runner: 'jest' | 'vitest' | 'pytest' | 'custom';
    /** Working directory for running tests */
    cwd?: string;
    /** Timeout per test run in milliseconds */
    timeout?: number;
    /** Verbose output */
    verbose?: boolean;
}
export interface TestResult {
    /** Test name/identifier */
    name: string;
    /** File path */
    file: string;
    /** Number of times it passed */
    passCount: number;
    /** Number of times it failed */
    failCount: number;
    /** Total runs */
    totalRuns: number;
    /** Flakiness percentage (failCount / totalRuns * 100) */
    flakinessRate: number;
    /** Whether it's considered flaky based on threshold */
    isFlaky: boolean;
    /** Pattern of pass/fail (e.g., "PPFPF") */
    pattern: string;
    /** Last failure message (if any) */
    lastError?: string;
}
export interface TestRunResult {
    /** Run number (1-based) */
    run: number;
    /** Whether this run passed overall */
    passed: boolean;
    /** Individual test results */
    tests: Map<string, boolean>;
    /** Duration in milliseconds */
    duration: number;
    /** Error output if failed */
    error?: string;
}
export interface FlakyReport {
    /** Configuration used */
    config: FlakyConfig;
    /** All tracked test results */
    results: TestResult[];
    /** Total runs executed */
    totalRuns: number;
    /** Total duration in milliseconds */
    totalDuration: number;
    /** Tests flagged as flaky */
    flakyTests: TestResult[];
    /** Timestamp of report */
    timestamp: Date;
}
export interface PatternAnalysis {
    /** Pattern type */
    type: 'timing' | 'order' | 'resource' | 'async' | 'unknown';
    /** Description of suspected cause */
    description: string;
    /** Suggested fix */
    suggestion: string;
}
export type { FlakyConfig as Config };
//# sourceMappingURL***REMOVED***types.d.ts.map