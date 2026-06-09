#!/usr/bin/env node
/**
 * CLI for pool-leak-detector
 */

import { Command } from 'commander';
import { readFileSync, existsSync } from 'fs';
import { glob } from 'glob';
import { relative, dirname } from 'path';
import { fileURLToPath } from 'url';
import { LeakDetector } from './detector.js';
import type { DetectorOptions, DetectionResult } from './types.js';

// Change to the script's directory for file resolution
const __filename ***REMOVED*** fileURLToPath(import.meta.url);
const scriptDir ***REMOVED*** dirname(__filename);
const projectRoot ***REMOVED*** dirname(scriptDir); // Go up from dist/ to project root
if (process.cwd() !***REMOVED******REMOVED*** projectRoot) {
  process.chdir(projectRoot);
}

// ANSI color codes for terminal output
const colors ***REMOVED*** {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
  bold: '\x1b[1m',
};

function colorize(text: string, color: keyof typeof colors): string {
  return `${colors[color]}${text}${colors.reset}`;
}

function formatIssue(result: DetectionResult, format: 'pretty' | 'json'): void {
  if (result.issues.length ***REMOVED******REMOVED******REMOVED*** 0) {
    if (format ***REMOVED******REMOVED******REMOVED*** 'pretty') {
      console.log(colorize('  ✓ No leaks detected', 'green'));
    }
    return;
  }

  for (const issue of result.issues) {
    if (format ***REMOVED******REMOVED******REMOVED*** 'pretty') {
      const severity ***REMOVED*** issue.severity ***REMOVED******REMOVED******REMOVED*** 'error' ? colorize('ERROR', 'red') : colorize('WARN', 'yellow');
      const relPath ***REMOVED*** relative(process.cwd(), issue.file);

      console.log(`\n  ${colorize('⚠', 'yellow')} ${relPath}:${issue.line}:${issue.column}`);
      console.log(`    ${severity}: ${issue.message}`);
      console.log(`    ${colorize('Type:', 'gray')} ${issue.type}`);
      console.log(`    ${colorize('Code:', 'gray')} ${issue.code}`);
      console.log(`    ${colorize('Fix:', 'blue')} ${issue.suggestion}`);
    }
  }
}

async function scanFiles(patterns: string[], options: DetectorOptions): Promise<void> {
  const detector ***REMOVED*** new LeakDetector();
  const results: DetectionResult[] ***REMOVED*** [];
  let totalFiles ***REMOVED*** 0;
  let totalIssues ***REMOVED*** 0;

  console.log(colorize('\n🔍 Scanning for pool leaks...', 'blue'));
  console.log(colorize('─'.repeat(50), 'gray'));

  for (const pattern of patterns) {
    const excludeList ***REMOVED*** Array.isArray(options.exclude) ? options.exclude : [];
    const ignorePatterns ***REMOVED*** excludeList.concat(['**/node_modules/**', '**/dist/**', '**/build/**']);

    // Handle both glob patterns and direct file paths
    let files: string[];
    if (pattern.includes('*') || pattern.includes('?')) {
      files ***REMOVED*** glob.sync(pattern, {
        cwd: process.cwd(),
        absolute: true,
        ignore: ignorePatterns,
      });
    } else {
      // Direct path - check if exists and is a file
      if (existsSync(pattern)) {
        files ***REMOVED*** [pattern];
      } else {
        // Try as glob anyway
        files ***REMOVED*** glob.sync(pattern, {
          cwd: process.cwd(),
          absolute: true,
          ignore: ignorePatterns,
        });
      }
    }

    for (const file of files) {
      if (!existsSync(file)) continue;

      totalFiles++;
      const source ***REMOVED*** readFileSync(file, 'utf-8');
      const result ***REMOVED*** detector.analyze(file, source);

      if (result.issues.length > 0) {
        results.push(result);
        totalIssues +***REMOVED*** result.issues.length;
      }
    }
  }

  console.log(colorize(`\nScanned ${totalFiles} files`, 'gray'));

  if (results.length ***REMOVED******REMOVED******REMOVED*** 0) {
    console.log(colorize('\n✅ No pool leaks detected!', 'green'));
    return;
  }

  if (options.format ***REMOVED******REMOVED******REMOVED*** 'json') {
    console.log(JSON.stringify(results, null, 2));
  } else {
    console.log(colorize(`\n⚠️  Found ${totalIssues} potential leak(s) in ${results.length} file(s)\n`, 'yellow'));

    for (const result of results) {
      formatIssue(result, options.format || 'pretty');
    }

    console.log(colorize('\n─'.repeat(50), 'gray'));
    console.log(colorize(`\n💡 Run with --json for machine-readable output\n`, 'blue'));
  }

  process.exitCode ***REMOVED*** 1;
}

const program ***REMOVED*** new Command();

program
  .name('pool-leak')
  .description('Detect database connection pool leaks in TypeScript/JavaScript code')
  .version('0.1.0');

program
  .argument('[patterns...]', 'File patterns to scan (default: **/*.{ts,js,tsx,jsx})', ['**/*.{ts,js,tsx,jsx}'])
  .option('-e, --exclude <patterns...>', 'Patterns to exclude')
  .option('-f, --format <format>', 'Output format (pretty|json)', 'pretty')
  .option('-s, --severity <level>', 'Minimum severity (error|warning)', 'warning')
  .action((patterns, options) ***REMOVED***> {
    scanFiles(patterns, options);
  });

program.parse();
