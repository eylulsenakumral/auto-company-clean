/**
 * Reporter - format and display scan results
 */

import { ScanResult, Severity, SecurityIssue } from './types.js';
import chalk from 'chalk';
import Table from 'cli-table3';

/**
 * Color code for severity
 */
const SEVERITY_COLORS: Record<Severity, (str: string) ***REMOVED***> string> ***REMOVED*** {
  critical: chalk.red.bold,
  warning: chalk.yellow,
  info: chalk.green,
};

/**
 * Symbol for severity
 */
const SEVERITY_SYMBOLS: Record<Severity, string> ***REMOVED*** {
  critical: '!',
  warning: '⚠',
  info: '✓',
};

/**
 * Report scan results as table
 */
export function reportTable(result: ScanResult): string {
  const lines: string[] ***REMOVED*** [];

  // Header
  lines.push('');
  lines.push(chalk.bold('🔒 Serverless Security Scan Report'));
  lines.push(chalk.gray(`Project: ${result.project}`));
  lines.push(chalk.gray(`Scanned: ${result.scannedAt.toISOString()}`));
  lines.push('');

  // Summary
  const { summary } ***REMOVED*** result;
  lines.push(chalk.bold('Summary:'));
  lines.push(
    `  ${SEVERITY_SYMBOLS.critical} ${chalk.red.bold(summary.critical.toString().padStart(2))} Critical`
  );
  lines.push(
    `  ${SEVERITY_SYMBOLS.warning} ${chalk.yellow(summary.warning.toString().padStart(2))} Warning`
  );
  lines.push(
    `  ${SEVERITY_SYMBOLS.info} ${chalk.green(summary.info.toString().padStart(2))} Info`
  );
  lines.push(`  ${chalk.bold('—'.repeat(20))} ${chalk.bold(summary.total.toString())} Total`);
  lines.push('');

  if (result.issues.length ***REMOVED******REMOVED******REMOVED*** 0) {
    lines.push(chalk.green.bold('✓ No security issues found!'));
    lines.push('');
    return lines.join('\n');
  }

  // Issues table
  const table ***REMOVED*** new Table({
    head: [chalk.gray('Function'), chalk.gray('Issue'), chalk.gray('Severity'), chalk.gray('Fix')],
    colWidths: [20, 40, 12, 50],
    wordWrap: true,
  });

  for (const issue of result.issues) {
    const fn ***REMOVED*** issue.function || '—';
    const msg ***REMOVED*** issue.message;
    const sev ***REMOVED*** SEVERITY_COLORS[issue.severity](issue.severity.toUpperCase());
    const fix ***REMOVED*** issue.fix;

    table.push([fn, msg, sev, fix]);
  }

  lines.push(table.toString());
  lines.push('');

  return lines.join('\n');
}

/**
 * Report scan results as JSON
 */
export function reportJson(result: ScanResult): string {
  return JSON.stringify(result, null, 2);
}

/**
 * Get exit code based on results
 */
export function getExitCode(result: ScanResult): number {
  if (result.summary.critical > 0) return 1;
  return 0;
}

/**
 * Read and report from JSON file
 */
export async function reportFromFile(file: string, format: 'table' | 'json' ***REMOVED*** 'table'): Promise<string> {
  const { readFile } ***REMOVED*** await import('node:fs/promises');
  const content ***REMOVED*** await readFile(file, 'utf-8');
  const result ***REMOVED*** JSON.parse(content) as ScanResult;

  if (format ***REMOVED******REMOVED******REMOVED*** 'json') {
    return JSON.stringify(result, null, 2);
  }

  // Rehydrate Date
  result.scannedAt ***REMOVED*** new Date(result.scannedAt);

  return reportTable(result);
}
