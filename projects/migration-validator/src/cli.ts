#!/usr/bin/env node

/**
 * migration-validator CLI
 */

import { Command } from 'commander';
import { writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';

import { scan, reportFromJson } from './scanner.js';
import { formatScanResult, writeOutput, getExitCode, formatTable } from './output.js';
import { generateConfigTemplate } from './config.js';
// Version will be injected by build script
const version ***REMOVED*** '0.1.0';

const program ***REMOVED*** new Command();

program
  .name('migration-validator')
  .description('Static analysis tool for database migrations')
  .version(version);

program
  .command('scan')
  .description('Scan migration files for issues')
  .argument('[paths...]', 'Paths to migration directories', [])
  .option('-j, --json', 'Output as JSON')
  .option('-o, --output <file>', 'Write output to file')
  .option('-q, --quiet', 'Quiet mode - only show issues')
  .option('-t, --table', 'Output as table')
  .action((paths, options) ***REMOVED***> {
    try {
      const result ***REMOVED*** scan(paths);

      if (options.table) {
        console.log(formatTable(result.issues));
      } else {
        console.log(formatScanResult(result, { json: options.json, output: options.output, quiet: options.quiet }));
      }

      if (options.output) {
        writeOutput(result, { json: options.json, output: options.output });
      }

      process.exit(getExitCode(result));
    } catch (error) {
      console.error(`Error: ${error instanceof Error ? error.message : error}`);
      process.exit(2);
    }
  });

program
  .command('report')
  .description('Generate detailed report from JSON scan result')
  .argument('<file>', 'JSON file from scan command')
  .option('-t, --table', 'Output as table')
  .action((file, options) ***REMOVED***> {
    try {
      const result ***REMOVED*** reportFromJson(resolve(process.cwd(), file));

      if (options.table) {
        console.log(formatTable(result.issues));
      } else {
        console.log(formatScanResult(result));
      }

      process.exit(getExitCode(result));
    } catch (error) {
      console.error(`Error reading report: ${error instanceof Error ? error.message : error}`);
      process.exit(2);
    }
  });

program
  .command('init')
  .description('Initialize .migration-validatorrc config file')
  .option('-f, --force', 'Overwrite existing config')
  .action((options) ***REMOVED***> {
    const configPath ***REMOVED*** resolve(process.cwd(), '.migration-validatorrc');

    if (existsSync(configPath) && !options.force) {
      console.log(`Config file already exists at ${configPath}`);
      console.log('Use --force to overwrite.');
      process.exit(1);
    }

    try {
      writeFileSync(configPath, generateConfigTemplate(), 'utf-8');
      console.log(`✓ Config file created at ${configPath}`);
      console.log('\nEdit .migration-validatorrc to customize:');
      console.log('  - Severity levels for each category');
      console.log('  - Ignore patterns');
      console.log('  - Default framework detection');
      console.log('  - Migration file paths');
    } catch (error) {
      console.error(`Error creating config: ${error instanceof Error ? error.message : error}`);
      process.exit(2);
    }
  });

program.parse();
