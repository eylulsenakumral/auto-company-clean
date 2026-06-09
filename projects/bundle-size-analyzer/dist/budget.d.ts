import { BudgetResult } from './types.js';
/**
 * Check if bundle is within size budget
 */
export declare function checkBudget(bundlePath: string, limitBytes: number): BudgetResult;
