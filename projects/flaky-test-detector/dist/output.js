/**
 * Output formatting with color support
 */
import chalk from 'chalk';
import { getSuspectedCause, getSuggestedFix } from './analyzer.js';
/**
 * Format a percentage with color
 */
function formatPercentage(value, threshold) {
    if (value >***REMOVED*** threshold) {
        return chalk.red(`${value.toFixed(1)}%`);
    }
    else if (value >***REMOVED*** threshold / 2) {
        return chalk.yellow(`${value.toFixed(1)}%`);
    }
    return chalk.green(`${value.toFixed(1)}%`);
}
/**
 * Format a single test result row
 */
function formatTestRow(result, threshold) {
    const name ***REMOVED*** result.name.length > 50 ? result.name.slice(0, 47) + '...' : result.name.padEnd(50);
    const failCount ***REMOVED*** chalk.red(result.failCount.toString().padStart(3));
    const totalRuns ***REMOVED*** result.totalRuns.toString().padStart(3);
    const flakiness ***REMOVED*** formatPercentage(result.flakinessRate, threshold).padStart(7);
    const status ***REMOVED*** result.isFlaky ? chalk.red('FLAKY') : 'OK';
    return `${name} | ${failCount}/${totalRuns} | ${flakiness} | ${status}`;
}
/**
 * Print report to console
 */
export function printReport(report) {
    console.log('\n' + chalk.bold.blue('═══════════════════════════════════════════════════════════════'));
    console.log(chalk.bold.blue('  Flaky Test Detector Report'));
    console.log(chalk.bold.blue('═══════════════════════════════════════════════════════════════'));
    console.log();
    console.log(chalk.gray(`Configuration:`));
    console.log(chalk.gray(`  Iterations: ${report.config.iterations}`));
    console.log(chalk.gray(`  Threshold: ${report.config.threshold}%`));
    console.log(chalk.gray(`  Test Command: ${report.config.testCommand}`));
    console.log();
    console.log(chalk.gray(`Summary:`));
    console.log(chalk.gray(`  Total Runs: ${report.totalRuns}`));
    console.log(chalk.gray(`  Total Duration: ${(report.totalDuration / 1000).toFixed(2)}s`));
    console.log(chalk.gray(`  Tests Analyzed: ${report.results.length}`));
    console.log(chalk.gray(`  Flaky Tests: ${chalk.red(report.flakyTests.length.toString())}`));
    console.log();
    if (report.flakyTests.length ***REMOVED******REMOVED******REMOVED*** 0) {
        console.log(chalk.green.bold('✓ No flaky tests detected!'));
        console.log();
        return;
    }
    console.log(chalk.bold.red('Flaky Tests:'));
    console.log();
    console.log(chalk.gray(`${'Test Name'.padEnd(50)} | Fail/Total | Flakiness | Status`));
    console.log(chalk.gray('─'.repeat(78)));
    for (const result of report.flakyTests) {
        console.log(formatTestRow(result, report.config.threshold));
    }
    console.log();
    // Print suspected causes
    if (report.flakyTests.length > 0) {
        console.log(chalk.bold.yellow('Suspected Causes:'));
        console.log();
        for (const result of report.flakyTests.slice(0, 5)) {
            console.log(chalk.red(`  ${result.name}`));
            const cause ***REMOVED*** getSuspectedCause(result);
            const fix ***REMOVED*** getSuggestedFix(result);
            console.log(chalk.gray(`    Cause: ${cause}`));
            console.log(chalk.gray(`    Fix: ${fix}`));
            console.log();
        }
        if (report.flakyTests.length > 5) {
            console.log(chalk.gray(`  ... and ${report.flakyTests.length - 5} more`));
        }
    }
}
/**
 * Print verbose report with all tests
 */
export function printVerboseReport(report) {
    printReport(report);
    if (report.results.length > report.flakyTests.length) {
        console.log();
        console.log(chalk.bold.gray('All Tests:'));
        console.log();
        console.log(chalk.gray(`${'Test Name'.padEnd(50)} | Fail/Total | Flakiness | Status`));
        console.log(chalk.gray('─'.repeat(78)));
        for (const result of report.results) {
            console.log(formatTestRow(result, report.config.threshold));
        }
        console.log();
    }
}
/**
 * Export report as JSON
 */
export function exportJSON(report) {
    return JSON.stringify(report, null, 2);
}
/**
 * Print analysis details
 */
export async function printAnalysis(report) {
    const { analyzePatterns } ***REMOVED*** await import('./analyzer.js');
    console.log(chalk.bold.blue('\n═══════════════════════════════════════════════════════════════'));
    console.log(chalk.bold.blue('  Pattern Analysis'));
    console.log(chalk.bold.blue('══════════════════════════════════════════════════════════════\n'));
    for (const result of report.flakyTests) {
        console.log(chalk.red.bold(result.name));
        console.log(chalk.gray(`  Pattern: ${result.pattern}`));
        console.log(chalk.gray(`  Flakiness: ${result.flakinessRate.toFixed(1)}%`));
        const analysis ***REMOVED*** analyzePatterns(result);
        console.log(chalk.yellow(`  Type: ${analysis.type}`));
        console.log(chalk.gray(`  Description: ${analysis.description}`));
        console.log(chalk.cyan(`  Suggestion: ${analysis.suggestion}`));
        if (result.lastError) {
            const errorLines ***REMOVED*** result.lastError.split('\n').slice(0, 3);
            console.log(chalk.gray(`  Last Error:`));
            for (const line of errorLines) {
                console.log(chalk.gray(`    ${line}`));
            }
        }
        console.log();
    }
}
//# sourceMappingURL***REMOVED***output.js.map