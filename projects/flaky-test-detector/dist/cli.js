#!/usr/bin/env node
/**
 * CLI entry point for flaky-test-detector
 */
import { Command } from 'commander';
import chalk from 'chalk';
import { loadConfig, mergeConfig, validateConfig } from './config.js';
import { runTestSuite } from './runner.js';
import { analyzeFlakiness } from './analyzer.js';
import { printReport, printVerboseReport, exportJSON, printAnalysis } from './output.js';
const program ***REMOVED*** new Command();
program
    .name('flaky')
    .description('Detect flaky tests by running test suites multiple times')
    .version('0.1.0');
// Detect command - main detection workflow
program
    .command('detect')
    .description('Run tests N times and detect flaky tests')
    .option('-i, --iterations <number>', 'Number of iterations (default: 10)', '10')
    .option('-t, --threshold <percentage>', 'Flakiness threshold 0-100 (default: 30)', '30')
    .option('-c, --command <cmd>', 'Test command to run', 'npm test')
    .option('-r, --runner <type>', 'Test runner type: jest, vitest, pytest, custom', 'jest')
    .option('--cwd <path>', 'Working directory for running tests')
    .option('--timeout <ms>', 'Timeout per test run in milliseconds', '60000')
    .option('--json', 'Output results as JSON')
    .option('-v, --verbose', 'Verbose output')
    .action(async (options) ***REMOVED***> {
    try {
        // Load and merge configuration
        const baseConfig ***REMOVED*** await loadConfig(options.cwd);
        const config ***REMOVED*** mergeConfig(baseConfig, {
            iterations: parseInt(options.iterations, 10),
            threshold: parseFloat(options.threshold),
            testCommand: options.command,
            runner: options.runner,
            cwd: options.cwd,
            timeout: parseInt(options.timeout, 10),
            verbose: options.verbose,
        });
        validateConfig(config);
        console.log(chalk.blue('Starting flaky test detection...'));
        console.log(chalk.gray(`Running: ${config.testCommand}`));
        console.log(chalk.gray(`Iterations: ${config.iterations}`));
        console.log();
        // Run test suite
        const runs ***REMOVED*** await runTestSuite(config);
        // Analyze results
        const report ***REMOVED*** analyzeFlakiness(runs, config);
        // Output results
        if (options.json) {
            console.log(exportJSON(report));
        }
        else if (options.verbose) {
            printVerboseReport(report);
        }
        else {
            printReport(report);
        }
        // Set exit code
        if (report.flakyTests.length > 0) {
            process.exit(1);
        }
        process.exit(0);
    }
    catch (error) {
        console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
        process.exit(2);
    }
});
// Report command - show existing report
program
    .command('report')
    .description('Show flaky test report from JSON file')
    .argument('<file>', 'JSON report file')
    .option('-v, --verbose', 'Verbose output')
    .action(async (file, options) ***REMOVED***> {
    try {
        const { readFile } ***REMOVED*** await import('node:fs/promises');
        const content ***REMOVED*** await readFile(file, 'utf-8');
        const report ***REMOVED*** JSON.parse(content);
        if (options.verbose) {
            printVerboseReport(report);
        }
        else {
            printReport(report);
        }
        process.exit(report.flakyTests.length > 0 ? 1 : 0);
    }
    catch (error) {
        console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
        process.exit(2);
    }
});
// Analyze command - detailed pattern analysis
program
    .command('analyze')
    .description('Analyze flaky test patterns and suspected causes')
    .option('-i, --iterations <number>', 'Number of iterations (default: 10)', '10')
    .option('-t, --threshold <percentage>', 'Flakiness threshold 0-100 (default: 30)', '30')
    .option('-c, --command <cmd>', 'Test command to run', 'npm test')
    .option('-r, --runner <type>', 'Test runner type: jest, vitest, pytest, custom', 'jest')
    .option('--cwd <path>', 'Working directory for running tests')
    .option('--timeout <ms>', 'Timeout per test run in milliseconds', '60000')
    .option('--json', 'Output results as JSON')
    .action(async (options) ***REMOVED***> {
    try {
        const baseConfig ***REMOVED*** await loadConfig(options.cwd);
        const config ***REMOVED*** mergeConfig(baseConfig, {
            iterations: parseInt(options.iterations, 10),
            threshold: parseFloat(options.threshold),
            testCommand: options.command,
            runner: options.runner,
            cwd: options.cwd,
            timeout: parseInt(options.timeout, 10),
            verbose: true,
        });
        validateConfig(config);
        console.log(chalk.blue('Running test suite for analysis...'));
        console.log();
        const runs ***REMOVED*** await runTestSuite(config);
        const report ***REMOVED*** analyzeFlakiness(runs, config);
        if (options.json) {
            console.log(exportJSON(report));
        }
        else {
            printReport(report);
            await printAnalysis(report);
        }
        process.exit(report.flakyTests.length > 0 ? 1 : 0);
    }
    catch (error) {
        console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
        process.exit(2);
    }
});
// Config command - generate sample config
program
    .command('init')
    .description('Generate .flakyrc configuration file')
    .option('-f, --force', 'Overwrite existing config')
    .action(async (options) ***REMOVED***> {
    try {
        const { existsSync } ***REMOVED*** await import('node:fs');
        const { writeFile } ***REMOVED*** await import('node:fs/promises');
        const { join } ***REMOVED*** await import('node:path');
        const configPath ***REMOVED*** join(process.cwd(), '.flakyrc');
        if (existsSync(configPath) && !options.force) {
            console.error(chalk.red('Error: .flakyrc already exists. Use --force to overwrite.'));
            process.exit(2);
        }
        const sampleConfig ***REMOVED*** {
            iterations: 10,
            threshold: 30,
            testCommand: 'npm test',
            runner: 'jest',
            verbose: false,
            timeout: 60000,
        };
        await writeFile(configPath, JSON.stringify(sampleConfig, null, 2));
        console.log(chalk.green('Created .flakyrc configuration file'));
    }
    catch (error) {
        console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
        process.exit(2);
    }
});
program.parse();
//# sourceMappingURL***REMOVED***cli.js.map