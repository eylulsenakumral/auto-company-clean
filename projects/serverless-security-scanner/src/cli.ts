#!/usr/bin/env node
/**
 * CLI entry point
 */

import { Command } from 'commander';
import { resolve } from 'node:path';
import { writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import ora from 'ora';
import chalk from 'chalk';

import { scanProject } from './scanner.js';
import { reportTable, reportJson, getExitCode, reportFromFile } from './reporter.js';
import { generateConfigContent } from './config.js';
import type { ScanOptions } from './types.js';

const program ***REMOVED*** new Command();

program
  .name('serverless-security')
  .description('Scan AWS Lambda functions for security issues')
  .version('0.1.0');

/**
 * Scan command
 */
program
  .command('scan')
  .description('Scan project for Lambda security issues')
  .argument('[path]', 'Project path', '.')
  .option('-s, --severity <level>', 'Minimum severity (critical|warning|info)', 'warning')
  .option('-o, --output <format>', 'Output format (table|json)', 'table')
  .option('-j, --json', 'Output as JSON (alias for --output json)')
  .option('-f, --file <path>', 'Save report to file')
  .option('--no-runtime', 'Skip runtime deprecation checks')
  .action(async (path, options) ***REMOVED***> {
    const projectPath ***REMOVED*** resolve(path);
    const spinner ***REMOVED*** ora('Initializing scan...').start();

    try {
      const scanOptions: ScanOptions ***REMOVED*** {
        path: projectPath,
        severity: options.severity,
        framework: 'auto',
        checkRuntime: options.runtime !***REMOVED******REMOVED*** false,
        output: options.json ? 'json' : options.output,
      };

      if (!existsSync(projectPath)) {
        spinner.fail(chalk.red(`Path not found: ${projectPath}`));
        process.exit(2);
      }

      spinner.text ***REMOVED*** 'Scanning for security issues...';

      const result ***REMOVED*** await scanProject(projectPath, scanOptions);

      spinner.stop();

      const output ***REMOVED*** scanOptions.output ***REMOVED******REMOVED******REMOVED*** 'json' ? reportJson(result) : reportTable(result);
      console.log(output);

      // Save to file if requested
      if (options.file) {
        const content ***REMOVED*** scanOptions.output ***REMOVED******REMOVED******REMOVED*** 'json' ? output : JSON.stringify(result, null, 2);
        await writeFile(options.file, content, 'utf-8');
        console.log(chalk.gray(`Report saved to ${options.file}`));
      }

      process.exit(getExitCode(result));
    } catch (error) {
      spinner.fail(chalk.red('Scan failed'));
      console.error(chalk.red(error instanceof Error ? error.message : String(error)));
      process.exit(2);
    }
  });

/**
 * Report command
 */
program
  .command('report')
  .description('Show detailed report from JSON file')
  .argument('<file>', 'JSON report file')
  .option('-o, --output <format>', 'Output format (table|json)', 'table')
  .action(async (file, options) ***REMOVED***> {
    const spinner ***REMOVED*** ora('Loading report...').start();

    try {
      if (!existsSync(file)) {
        spinner.fail(chalk.red(`File not found: ${file}`));
        process.exit(2);
      }

      const output ***REMOVED*** await reportFromFile(file, options.output as 'table' | 'json');

      spinner.stop();
      console.log(output);
    } catch (error) {
      spinner.fail(chalk.red('Failed to load report'));
      console.error(chalk.red(error instanceof Error ? error.message : String(error)));
      process.exit(2);
    }
  });

/**
 * Init command
 */
program
  .command('init')
  .description('Generate .serverless-securityrc config')
  .option('-s, --severity <level>', 'Minimum severity (critical|warning|info)', 'warning')
  .action(async (options) ***REMOVED***> {
    const spinner ***REMOVED*** ora('Creating config...').start();

    try {
      const configPath ***REMOVED*** '.serverless-securityrc';
      const content ***REMOVED*** generateConfigContent(options.severity);

      if (existsSync(configPath)) {
        spinner.warn(chalk.yellow('Config file already exists'));
        process.exit(0);
      }

      await writeFile(configPath, content, 'utf-8');

      spinner.succeed(chalk.green(`Created ${configPath}`));
      console.log(chalk.gray('Edit this file to customize scan settings'));
    } catch (error) {
      spinner.fail(chalk.red('Failed to create config'));
      console.error(chalk.red(error instanceof Error ? error.message : String(error)));
      process.exit(2);
    }
  });

program.parse();
