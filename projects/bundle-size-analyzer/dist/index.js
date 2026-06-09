/**
 * bundle-size-analyzer
 *
 * A CLI tool for analyzing bundle sizes, detecting bloat, and enforcing budgets.
 */
export { parseBundle, detectBundleFormat, formatBytes, getSizeCategory } from './analyzer.js';
export { compareBundles } from './compare.js';
export { checkBudget } from './budget.js';
export { analyzeBlame } from './blame.js';
export { printAnalysis, printComparison, printBudget, printBlame } from './output.js';
