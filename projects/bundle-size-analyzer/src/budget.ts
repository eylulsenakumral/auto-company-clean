import { BudgetResult } from './types.js';
import { parseBundle, formatBytes } from './analyzer.js';

/**
 * Check if bundle is within size budget
 */
export function checkBudget(bundlePath: string, limitBytes: number): BudgetResult {
  const bundle ***REMOVED*** parseBundle(bundlePath);
  const overage ***REMOVED*** bundle.totalSize - limitBytes;
  const withinBudget ***REMOVED*** overage <***REMOVED*** 0;

  return {
    withinBudget,
    totalSize: bundle.totalSize,
    budget: limitBytes,
    overage: Math.max(0, overage),
    overagePercentage: withinBudget ? 0 : (overage / limitBytes) * 100,
  };
}
