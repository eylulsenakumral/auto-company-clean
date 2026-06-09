/**
 * Bundle module information
 */
export interface BundleModule {
    name: string;
    size: number;
    percentage: number;
}
/**
 * Complete bundle analysis result
 */
export interface BundleAnalysis {
    totalSize: number;
    modules: BundleModule[];
    format: BundleFormat;
}
/**
 * Supported bundle formats
 */
export type BundleFormat ***REMOVED*** 'js' | 'css' | 'json';
/**
 * Comparison result between two bundles
 */
export interface BundleComparison {
    added: BundleModule[];
    removed: BundleModule[];
    changed: ModuleChange[];
    totalSizeDiff: number;
    hasRegression: boolean;
}
/**
 * Module change information
 */
export interface ModuleChange {
    name: string;
    oldSize: number;
    newSize: number;
    diff: number;
    diffPercentage: number;
}
/**
 * Budget check result
 */
export interface BudgetResult {
    withinBudget: boolean;
    totalSize: number;
    budget: number;
    overage: number;
    overagePercentage: number;
}
/**
 * Package blame information
 */
export interface PackageBlame {
    packageName: string;
    size: number;
    percentage: number;
    modules: string[];
}
/**
 * Analyzer options
 */
export interface AnalyzerOptions {
    json?: boolean;
    verbose?: boolean;
}
