import { PackageBlame } from './types.js';
/**
 * Analyze which npm packages contribute most to bundle size
 * For MVP, we simulate package attribution based on common dependencies
 */
export declare function analyzeBlame(bundlePath: string): PackageBlame[];
