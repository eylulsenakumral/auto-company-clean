/**
 * Output formatting with color support
 */
import type { FlakyReport } from './types.js';
/**
 * Print report to console
 */
export declare function printReport(report: FlakyReport): void;
/**
 * Print verbose report with all tests
 */
export declare function printVerboseReport(report: FlakyReport): void;
/**
 * Export report as JSON
 */
export declare function exportJSON(report: FlakyReport): string;
/**
 * Print analysis details
 */
export declare function printAnalysis(report: FlakyReport): Promise<void>;
//# sourceMappingURL***REMOVED***output.d.ts.map