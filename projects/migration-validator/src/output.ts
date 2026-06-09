/**
 * Output formatters
 */

import type { ScanResult, Issue, Severity } from './types.js';
import { writeFileSync } from 'fs';

export interface OutputOptions {
  json?: boolean;
  output?: string;
  quiet?: boolean;
}

export function formatScanResult(result: ScanResult, options: OutputOptions ***REMOVED*** {}): string {
  if (options.json) {
    return JSON.stringify(result, null, 2);
  }

  const lines: string[] ***REMOVED*** [];

  if (!options.quiet) {
    lines.push(`\n🔍 Migration Scan Results`);
    lines.push(`Framework: ${result.framework}`);
    lines.push(`Files scanned: ${result.files.length}`);
    lines.push(`Issues found: ${result.issues.length}\n`);
  }

  if (result.issues.length ***REMOVED******REMOVED******REMOVED*** 0) {
    lines.push('✨ No issues found!');
    return lines.join('\n');
  }

  // Group by severity
  const bySeverity: Record<Severity, Issue[]> ***REMOVED*** {
    critical: [],
    warning: [],
    info: []
  };

  for (const issue of result.issues) {
    bySeverity[issue.severity].push(issue);
  }

  // Print critical first
  if (bySeverity.critical.length > 0) {
    lines.push(`🔴 CRITICAL (${bySeverity.critical.length})`);
    for (const issue of bySeverity.critical) {
      lines.push(formatIssue(issue));
    }
    lines.push('');
  }

  if (bySeverity.warning.length > 0) {
    lines.push(`🟡 WARNING (${bySeverity.warning.length})`);
    for (const issue of bySeverity.warning) {
      lines.push(formatIssue(issue));
    }
    lines.push('');
  }

  if (bySeverity.info.length > 0) {
    lines.push(`🟢 INFO (${bySeverity.info.length})`);
    for (const issue of bySeverity.info) {
      lines.push(formatIssue(issue));
    }
    lines.push('');
  }

  // Summary
  lines.push(`Summary: ${result.summary.critical} critical, ${result.summary.warning} warning, ${result.summary.info} info`);

  return lines.join('\n');
}

function formatIssue(issue: Issue): string {
  const parts: string[] ***REMOVED*** [
    `  [${issue.category}]`
  ];

  if (issue.line) {
    parts.push(`:${issue.line}`);
  }

  parts.push(` ${issue.message}`);

  if (issue.file) {
    parts.push(`\n    └─ ${issue.file}`);
  }

  if (issue.code) {
    const codePreview ***REMOVED*** issue.code.length > 50
      ? issue.code.substring(0, 50) + '...'
      : issue.code;
    parts.push(`\n    └─ Code: ${codePreview}`);
  }

  return parts.join('');
}

export function writeOutput(result: ScanResult, options: OutputOptions): void {
  if (options.output) {
    const content ***REMOVED*** options.json
      ? JSON.stringify(result, null, 2)
      : formatScanResult(result);

    writeFileSync(options.output, content, 'utf-8');
  }
}

export function getExitCode(result: ScanResult): number {
  if (result.issues.some(i ***REMOVED***> i.severity ***REMOVED******REMOVED******REMOVED*** 'critical')) {
    return 1;
  }
  return 0;
}

export function formatTable(issues: Issue[]): string {
  if (issues.length ***REMOVED******REMOVED******REMOVED*** 0) {
    return 'No issues found.';
  }

  // Create ASCII table
  const lines: string[] ***REMOVED*** [];

  // Header
  lines.push('');
  lines.push('┌─────────────────────┬───────────────────┬──────────────────────────────────────────┐');
  lines.push('│ Severity            │ Category           │ Message                                  │');
  lines.push('├─────────────────────┼───────────────────┼──────────────────────────────────────────┤');

  // Rows
  for (const issue of issues) {
    const severity ***REMOVED*** issue.severity.padEnd(19);
    const category ***REMOVED*** issue.category.padEnd(19);
    const message ***REMOVED*** (issue.message.length > 40 ? issue.message.substring(0, 37) + '...' : issue.message).padEnd(40);
    lines.push(`│ ${severity} │ ${category} │ ${message} │`);
  }

  lines.push('└─────────────────────┴───────────────────┴──────────────────────────────────────────┘');

  return lines.join('\n');
}
