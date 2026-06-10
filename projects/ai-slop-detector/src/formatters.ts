import chalk from 'chalk';
import { FileResult, ScanResult } from './types/index.js';

/**
 * Calculate average score (shared utility)
 */
function calculateAverageScore(results: FileResult[]): number {
  return results.length > 0
    ? results.reduce((sum, r) => sum + r.score, 0) / results.length
    : 0;
}

/**
 * Filter and sort results by score (shared utility)
 */
function filterAndSortResults(results: FileResult[], threshold: number): FileResult[] {
  return results
    .filter(r => r.score >= threshold)
    .sort((a, b) => b.score - a.score);
}

/**
 * Format single file result for console output
 */
export function formatFileResult(result: FileResult, verbose: boolean = false): string {
  const lines: string[] = [];

  // File path and score
  const scoreColor = result.score >= 60 ? 'red' : result.score >= 30 ? 'yellow' : 'green';
  lines.push(chalk.bold(`${result.filePath}`));
  lines.push(chalk[scoreColor](`Score: ${result.score}/100 (${result.confidence} confidence)`));

  // Indicators
  if (result.indicators.length > 0) {
    lines.push(chalk.gray('─'.repeat(50)));

    for (const indicator of result.indicators) {
      const severityColor = indicator.severity === 'high' ? 'red' : indicator.severity === 'medium' ? 'yellow' : 'gray';
      lines.push(chalk[severityColor](`  [${indicator.severity.toUpperCase()}] ${indicator.type}`));

      if (verbose) {
        lines.push(chalk.gray(`    → ${indicator.description}`));
        lines.push(chalk.gray(`    Evidence: ${indicator.evidence}`));
      } else {
        lines.push(chalk.gray(`    ${indicator.description}`));
      }
    }
  } else {
    lines.push(chalk.gray('No indicators found - appears authentic'));
  }

  lines.push('');
  return lines.join('\n');
}

/**
 * Format scan summary for console output
 */
export function formatScanSummary(results: FileResult[]): string {
  const suspiciousFiles = results.filter(r => r.score > 0);
  const avgScore = calculateAverageScore(results);

  const lines: string[] = [
    chalk.bold('\n📊 Scan Summary'),
    chalk.gray('─'.repeat(30)),
    `Total files scanned: ${chalk.cyan(results.length)}`,
    `Suspicious files: ${chalk.yellow(suspiciousFiles.length)}`,
    `Average score: ${chalk.cyan(avgScore.toFixed(1) + '/100')}`
  ];

  if (suspiciousFiles.length > 0) {
    const highRisk = suspiciousFiles.filter(r => r.score >= 60);
    const mediumRisk = suspiciousFiles.filter(r => r.score >= 30 && r.score < 60);

    lines.push('');
    lines.push(chalk.bold('Risk Distribution:'));
    lines.push(`  High risk (60+): ${chalk.red(highRisk.length)}`);
    lines.push(`  Medium risk (30-59): ${chalk.yellow(mediumRisk.length)}`);
  }

  lines.push('');
  return lines.join('\n');
}

/**
 * Format as JSON
 */
export function formatJSON(results: FileResult[] | FileResult, pretty: boolean = true): string {
  return JSON.stringify(results, null, pretty ? 2 : 0);
}

/**
 * Format scan result as JSON with summary
 */
export function formatScanJSON(results: FileResult[]): string {
  const suspiciousFiles = results.filter(r => r.score > 0);
  const avgScore = calculateAverageScore(results);

  const scanResult: ScanResult = {
    totalFiles: results.length,
    suspiciousFiles: suspiciousFiles.length,
    averageScore: Math.round(avgScore * 10) / 10,
    files: results
  };

  return JSON.stringify(scanResult, null, 2);
}

/**
 * Export shared utilities for CLI reuse
 */
export { filterAndSortResults };
