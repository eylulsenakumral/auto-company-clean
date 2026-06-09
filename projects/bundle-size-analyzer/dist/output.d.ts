import { BundleAnalysis, BundleComparison, BudgetResult, PackageBlame, AnalyzerOptions } from './types.js';
/**
 * Print bundle analysis results
 */
export declare function printAnalysis(analysis: BundleAnalysis, options?: AnalyzerOptions): void;
/**
 * Print bundle comparison results
 */
export declare function printComparison(comparison: BundleComparison, options?: AnalyzerOptions): void;
/**
 * Print budget check results
 */
export declare function printBudget(result: BudgetResult, options?: AnalyzerOptions): void;
/**
 * Print package blame results
 */
export declare function printBlame(blames: PackageBlame[], totalSize: number, options?: AnalyzerOptions): void;
