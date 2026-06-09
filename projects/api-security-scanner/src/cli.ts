#!/usr/bin/env node

import { Command } from 'commander';
import { readFileSync, writeFileSync } from 'fs';
import { resolve, join } from 'path';
import chalk from 'chalk';
import { SecurityScanner } from './scanner';
import { Reporter } from './reporter';
import { loadConfig, generateConfigTemplate } from './config';
import { ScannerConfig } from './types';

const program ***REMOVED*** new Command();

program
  .name('api-security')
  .description('API Security Scanner - Find security issues in Express/Fastify/NestJS routes')
  .version('0.1.0');

program
  .command('scan [path]')
  .description('Scan project for API security issues')
  .option('-j, --json', 'Output results as JSON')
  .option('-o, --output <file>', 'Write JSON output to file')
  .option('-s, --severity <level>', 'Minimum severity level (critical|warning|info)')
  .option('-c, --config <file>', 'Path to config file')
  .action((path ***REMOVED*** '.', options) ***REMOVED***> {
    const scanPath ***REMOVED*** resolve(path);

    console.log(chalk.bold(`\n🔒 Scanning ${scanPath}...\n`));

    let config: ScannerConfig;

    if (options.config) {
      const configPath ***REMOVED*** resolve(options.config);
      try {
        const configContent ***REMOVED*** readFileSync(configPath, 'utf-8');
        config ***REMOVED*** JSON.parse(configContent);
      } catch {
        console.error(chalk.red('Failed to load config file'));
        process.exit(2);
      }
    } else {
      config ***REMOVED*** loadConfig(scanPath);
    }

    if (options.severity) {
      config.severity ***REMOVED*** options.severity;
    }

    const scanner ***REMOVED*** new SecurityScanner(config);
    const issues ***REMOVED*** scanner.scan(scanPath);
    const stats ***REMOVED*** scanner.getStats();

    if (options.json || options.output) {
      const result ***REMOVED*** Reporter.generateJson(issues, stats);

      if (options.output) {
        writeFileSync(join(scanPath, options.output), JSON.stringify(result, null, 2));
        console.log(chalk.green(`Results written to ${options.output}`));
      } else {
        console.log(JSON.stringify(result, null, 2));
      }
    } else {
      Reporter.printTable(issues);
      Reporter.printSummary(Reporter.generateJson(issues, stats));
    }

    process.exit(Reporter.getExitCode(issues));
  });

program
  .command('report <file>')
  .description('Show detailed report from JSON file')
  .action(file ***REMOVED***> {
    try {
      const reportPath ***REMOVED*** resolve(file);
      const content ***REMOVED*** readFileSync(reportPath, 'utf-8');
      const result ***REMOVED*** JSON.parse(content) as any;

      Reporter.printTable(result.issues || []);
      Reporter.printSummary(result);
    } catch {
      console.error(chalk.red('Failed to read report file'));
      process.exit(2);
    }
  });

program
  .command('init')
  .description('Generate .api-securityrc config file')
  .action(() ***REMOVED***> {
    const configPath ***REMOVED*** join(process.cwd(), '.api-securityrc');

    try {
      writeFileSync(configPath, generateConfigTemplate());
      console.log(chalk.green(`✓ Created ${configPath}`));
      console.log('Edit this file to customize scan options.');
    } catch (e: any) {
      if (e.code ***REMOVED******REMOVED******REMOVED*** 'EEXIST') {
        console.log(chalk.yellow('Config file already exists'));
      } else {
        console.error(chalk.red('Failed to create config file'));
      }
    }
  });

program.parse();
