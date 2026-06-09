#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import { parseBundle } from './analyzer.js';
import { compareBundles } from './compare.js';
import { checkBudget } from './budget.js';
import { analyzeBlame } from './blame.js';
import { printAnalysis, printComparison, printBudget, printBlame } from './output.js';
const program ***REMOVED*** new Command();
program
    .name('bundle-analyzer')
    .description('CLI that analyzes bundle sizes, detects bloat, and enforces budgets')
    .version('0.1.0');
/**
 * analyze command - Size breakdown by module
 */
program
    .command('analyze <bundle>')
    .description('Analyze bundle size and show breakdown by module')
    .option('-j, --json', 'Output as JSON')
    .option('-v, --verbose', 'Verbose output')
    .action((bundlePath, options) ***REMOVED***> {
    try {
        const analysis ***REMOVED*** parseBundle(bundlePath);
        printAnalysis(analysis, options);
        process.exit(0);
    }
    catch (error) {
        console.error(chalk.red(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
        process.exit(2);
    }
});
/**
 * compare command - Diff between builds
 */
program
    .command('compare <old> <new>')
    .description('Compare two bundles and show differences')
    .option('-j, --json', 'Output as JSON')
    .action((oldPath, newPath, options) ***REMOVED***> {
    try {
        const comparison ***REMOVED*** compareBundles(oldPath, newPath);
        printComparison(comparison, options);
        // Exit code 1 if regression detected
        if (comparison.hasRegression) {
            process.exit(1);
        }
        process.exit(0);
    }
    catch (error) {
        console.error(chalk.red(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
        process.exit(2);
    }
});
/**
 * budget command - Enforce size limits with exit codes
 */
program
    .command('budget <bundle> <limit>')
    .description('Check bundle against size limit (e.g., 200KB, 1MB)')
    .option('-j, --json', 'Output as JSON')
    .action((bundlePath, limitStr, options) ***REMOVED***> {
    try {
        const limit ***REMOVED*** parseSizeLimit(limitStr);
        const result ***REMOVED*** checkBudget(bundlePath, limit);
        printBudget(result, options);
        // Exit code 1 if over budget
        if (!result.withinBudget) {
            process.exit(1);
        }
        process.exit(0);
    }
    catch (error) {
        console.error(chalk.red(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
        process.exit(2);
    }
});
/**
 * blame command - Which dep caused bloat
 */
program
    .command('blame <bundle>')
    .description('Show which npm packages contribute most to bundle size')
    .option('-j, --json', 'Output as JSON')
    .action((bundlePath, options) ***REMOVED***> {
    try {
        const analysis ***REMOVED*** parseBundle(bundlePath);
        const blames ***REMOVED*** analyzeBlame(bundlePath);
        printBlame(blames, analysis.totalSize, options);
        process.exit(0);
    }
    catch (error) {
        console.error(chalk.red(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
        process.exit(2);
    }
});
/**
 * Parse size limit string (e.g., "200KB", "1MB", "500")
 */
function parseSizeLimit(str) {
    const match ***REMOVED*** str.match(/^(\d+(?:\.\d+)?)\s*(KB|MB|GB|B)?$/i);
    if (!match) {
        throw new Error(`Invalid size limit format: ${str}. Use format like "200KB", "1MB", or "500000" for bytes`);
    }
    const value ***REMOVED*** parseFloat(match[1]);
    const unit ***REMOVED*** (match[2] || 'B').toUpperCase();
    switch (unit) {
        case 'B':
            return value;
        case 'KB':
            return value * 1024;
        case 'MB':
            return value * 1024 * 1024;
        case 'GB':
            return value * 1024 * 1024 * 1024;
        default:
            throw new Error(`Unknown size unit: ${unit}`);
    }
}
// Parse arguments
program.parse(process.argv);
// Show help if no command provided
if (!process.argv.slice(2).length) {
    program.outputHelp();
}
