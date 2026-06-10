/**
 * AI Slop Detector - Main exports
 */
export { analyzeFile, analyzeDirectory, scanRepository, checkFile } from './analyzer.js';
export { formatFileResult, formatScanSummary, formatJSON, formatScanJSON } from './formatters.js';
export * from './types/index.js';
