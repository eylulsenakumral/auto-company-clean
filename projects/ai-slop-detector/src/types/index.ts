/**
 * Detection result for a single file
 */
export interface FileResult {
  filePath: string;
  score: number; // 0-100
  confidence: 'low' | 'medium' | 'high';
  indicators: Indicator[];
}

/**
 * Single detection indicator
 */
export interface Indicator {
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  evidence: string;
}

/**
 * Analysis options
 */
export interface AnalyzeOptions {
  json?: boolean;
  verbose?: boolean;
  threshold?: number; // Report only if score above this
}

/**
 * Scan result summary
 */
export interface ScanResult {
  totalFiles: number;
  suspiciousFiles: number;
  averageScore: number;
  files: FileResult[];
}

/**
 * Code metrics for analysis
 */
export interface CodeMetrics {
  totalLines: number;
  codeLines: number;
  commentLines: number;
  blankLines: number;
  commentRatio: number;
  functions: number;
  avgFunctionLength: number;
}

/**
 * Naming pattern metrics
 */
export interface NamingMetrics {
  camelCaseCount: number;
  snakeCaseCount: number;
  pascalCaseCount: number;
  inconsistentNames: string[];
  genericNames: string[];
}
