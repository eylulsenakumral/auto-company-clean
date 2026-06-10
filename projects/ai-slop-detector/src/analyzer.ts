import * as fs from 'fs';
import * as path from 'path';
import { FileResult, Indicator, AnalyzeOptions } from './types';
import {
  analyzeComments,
  analyzeNaming,
  analyzeStructure,
  analyzeCommentRatio,
  detectLanguage
} from './utils/heuristics.js';

/**
 * Calculate overall score from indicators
 */
function calculateScore(indicators: Indicator[]): number {
  if (indicators.length === 0) return 0;

  let score = 0;
  for (const indicator of indicators) {
    const severityWeight = {
      low: 10,
      medium: 25,
      high: 50
    };
    score += severityWeight[indicator.severity];
  }

  // Cap at 100
  return Math.min(100, score);
}

/**
 * Determine confidence level from score and indicator count
 */
function getConfidence(score: number, indicatorCount: number): 'low' | 'medium' | 'high' {
  if (indicatorCount === 0) return 'low';
  if (indicatorCount >= 4 || score >= 60) return 'high';
  if (indicatorCount >= 2 || score >= 30) return 'medium';
  return 'low';
}

/**
 * Analyze a single file
 */
export function analyzeFile(filePath: string, options: AnalyzeOptions = {}): FileResult {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const language = detectLanguage(filePath);

  const indicators: Indicator[] = [];

  // Run all heuristic analyses
  indicators.push(...analyzeComments(content));
  indicators.push(...analyzeNaming(content, language));
  indicators.push(...analyzeStructure(content, language));
  indicators.push(...analyzeCommentRatio(content));

  // Calculate score
  const score = calculateScore(indicators);
  const confidence = getConfidence(score, indicators.length);

  const result: FileResult = {
    filePath,
    score,
    confidence,
    indicators
  };

  return result;
}

/**
 * Analyze a directory recursively
 */
export function analyzeDirectory(dirPath: string, options: AnalyzeOptions = {}): FileResult[] {
  const results: FileResult[] = [];

  function walk(currentPath: string) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);

      if (entry.isDirectory()) {
        // Skip node_modules, .git, dist, etc.
        if (!['node_modules', '.git', 'dist', 'build', 'coverage', '.next'].includes(entry.name)) {
          walk(fullPath);
        }
      } else if (entry.isFile()) {
        // Only analyze code files
        const ext = path.extname(entry.name).toLowerCase();
        const codeExts = ['.js', '.jsx', '.ts', '.tsx', '.py', '.rb', '.go', '.rs', '.java', '.c', '.cpp', '.cs', '.php'];

        if (codeExts.includes(ext)) {
          try {
            const result = analyzeFile(fullPath, options);
            results.push(result);
          } catch (error) {
            if (options.verbose) {
              console.error(`Error analyzing ${fullPath}:`, error);
            }
          }
        }
      }
    }
  }

  walk(dirPath);
  return results;
}

/**
 * Scan a git repository
 */
export function scanRepository(repoPath: string, options: AnalyzeOptions = {}): FileResult[] {
  const gitDir = path.join(repoPath, '.git');
  if (!fs.existsSync(gitDir)) {
    throw new Error(`Not a git repository: ${repoPath}`);
  }

  return analyzeDirectory(repoPath, options);
}

/**
 * Quick check for a single file (returns boolean if score exceeds threshold)
 */
export function checkFile(filePath: string, threshold: number = 30): boolean {
  const result = analyzeFile(filePath);
  return result.score >= threshold;
}
