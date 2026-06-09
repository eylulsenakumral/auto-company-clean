import { BundleAnalysis, BundleFormat } from './types.js';
/**
 * Detect bundle format from file extension
 */
export declare function detectBundleFormat(filePath: string): BundleFormat;
/**
 * Parse bundle file and extract module information
 * For MVP, we simulate module breakdown based on common patterns
 */
export declare function parseBundle(filePath: string): BundleAnalysis;
/**
 * Format bytes for human readable output
 */
export declare function formatBytes(bytes: number): string;
/**
 * Get size category for color coding
 */
export declare function getSizeCategory(size: number, totalSize: number): 'green' | 'yellow' | 'red';
