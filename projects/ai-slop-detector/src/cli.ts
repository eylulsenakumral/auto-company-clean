#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import * as fs from 'fs';
import { analyzeFile, analyzeDirectory, scanRepository, checkFile } from './analyzer.js';
import { FileResult } from './types/index.js';
import {
  formatFileResult,
  formatScanSummary,
  formatScanJSON,
  filterAndSortResults
} from './formatters.js';

const program = new Command();

program
  .name('ai-slop-detector')
  .description('Heuristic-based CLI tool to detect AI-generated code slop')
  .version('0.1.0');

/**
 * Shared output handler (eliminates duplicate command logic)
 */
async function handleOutput(results: FileResult[], options: any, spinner: any) {
  const threshold = parseInt(options.threshold, 10);
  const filtered = filterAndSortResults(results, threshold);

  spinner.succeed(chalk.green('Analysis complete'));

  if (options.json) {
    console.log(formatScanJSON(filtered));
  } else {
    for (const result of filtered) {
      console.log(formatFileResult(result, options.verbose));
    }
    console.log(formatScanSummary(results));
  }
}

/**
 * Analyze command - analyze a file or directory
 */
program
  .command('analyze')
  .argument('<target>', 'File or directory to analyze')
  .option('-j, --json', 'Output as JSON')
  .option('-v, --verbose', 'Verbose output with detailed evidence')
  .option('-t, --threshold <number>', 'Only show results above this score', '0')
  .action(async (target, options) => {
    const spinner = ora('Analyzing...').start();

    try {
      if (!fs.existsSync(target)) {
        spinner.fail(chalk.red(`Error: Target not found: ${target}`));
        process.exit(1);
      }

      const stat = fs.statSync(target);
      let results: import('./types').FileResult[] = [];

      spinner.text = stat.isFile()
        ? `Analyzing file: ${target}`
        : `Analyzing directory: ${target}`;

      results = stat.isFile()
        ? [analyzeFile(target)]
        : analyzeDirectory(target);

      await handleOutput(results, options, spinner);
    } catch (error) {
      spinner.fail(chalk.red('Analysis failed'));
      console.error(chalk.red((error as Error).message));
      process.exit(1);
    }
  });

/**
 * Scan command - scan a git repository
 */
program
  .command('scan')
  .argument('<repo>', 'Path to git repository')
  .option('-j, --json', 'Output as JSON')
  .option('-v, --verbose', 'Verbose output with detailed evidence')
  .option('-t, --threshold <number>', 'Only show results above this score', '0')
  .action(async (repo, options) => {
    const spinner = ora('Scanning repository...').start();

    try {
      spinner.text = `Scanning repository: ${repo}`;
      const results = scanRepository(repo);
      await handleOutput(results, options, spinner);
    } catch (error) {
      spinner.fail(chalk.red('Scan failed'));
      console.error(chalk.red((error as Error).message));
      process.exit(1);
    }
  });

/**
 * Check command - quick check with exit code
 */
program
  .command('check')
  .argument('<file>', 'File to check')
  .option('-t, --threshold <number>', 'Score threshold for exit code', '30')
  .action(async (file, options) => {
    const threshold = parseInt(options.threshold, 30);

    try {
      const isSuspicious = checkFile(file, threshold);

      if (isSuspicious) {
        const result = analyzeFile(file);
        console.log(chalk.red(`❌ Suspicious: ${file} (score: ${result.score}/100)`));
        process.exit(1);
      } else {
        console.log(chalk.green(`✅ Clean: ${file}`));
        process.exit(0);
      }
    } catch (error) {
      console.error(chalk.red((error as Error).message));
      process.exit(2);
    }
  });

program.parse();
