#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { analyzeLockfileDiff } from '../src/analyzers/diff-analyzer.js';
import { analyzeLockfile } from '../src/analyzers/explain-analyzer.js';
import { generatePRComment } from '../src/analyzers/comment-generator.js';

const program ***REMOVED*** new Command();

program
  .name('lockfile-analyzer')
  .description('Analyze package-lock.json and yarn.lock changes')
  .version('0.1.0');

// Diff command
program
  .command('diff')
  .description('Compare two lockfiles')
  .option('--base <path>', 'Base lockfile path')
  .option('--head <path>', 'Head lockfile path')
  .option('--format <format>', 'Output format (table or json)', 'table')
  .action(async (options) ***REMOVED***> {
    if (!options.base || !options.head) {
      console.error(chalk.red('Error: --base and --head are required'));
      process.exit(1);
    }

    try {
      const analysis ***REMOVED*** analyzeLockfileDiff(options.base, options.head);
      const { changes, summary, format } ***REMOVED*** analysis;

      if (options.format ***REMOVED******REMOVED******REMOVED*** 'json') {
        const output ***REMOVED*** {
          format,
          summary,
          added: changes.added,
          removed: changes.removed,
          changed: changes.changed,
          integrityChanged: changes.integrityChanged
        };
        console.log(JSON.stringify(output, null, 2));
        return;
      }

      // Table output
      console.log(chalk.bold(`\nLockfile format: ${format}\n`));

      if (changes.changed.length > 0) {
        console.log(chalk.yellow('Changed dependencies:'));
        console.log('─'.repeat(60));
        for (const dep of changes.changed) {
          const typeColor ***REMOVED*** dep.type ***REMOVED******REMOVED******REMOVED*** 'Direct' ? chalk.green : chalk.gray;
          console.log(`  ${chalk.cyan(dep.name.padEnd(30))} ${typeColor(dep.type.padEnd(12))} ${chalk.yellow(dep.change)}`);
        }
        console.log('');
      }

      if (changes.added.length > 0) {
        console.log(chalk.green('Added dependencies:'));
        console.log('─'.repeat(60));
        for (const dep of changes.added) {
          const typeColor ***REMOVED*** dep.type ***REMOVED******REMOVED******REMOVED*** 'Direct' ? chalk.green : chalk.gray;
          const changeText ***REMOVED*** `Added (${dep.version})`;
          console.log(`  ${chalk.cyan(dep.name.padEnd(30))} ${typeColor(dep.type.padEnd(12))} ${chalk.green(changeText)}`);
        }
        console.log('');
      }

      if (changes.removed.length > 0) {
        console.log(chalk.red('Removed dependencies:'));
        console.log('─'.repeat(60));
        for (const dep of changes.removed) {
          const typeColor ***REMOVED*** dep.type ***REMOVED******REMOVED******REMOVED*** 'Direct' ? chalk.green : chalk.gray;
          const changeText ***REMOVED*** `Removed (${dep.version})`;
          console.log(`  ${chalk.cyan(dep.name.padEnd(30))} ${typeColor(dep.type.padEnd(12))} ${chalk.red(changeText)}`);
        }
        console.log('');
      }

      if (changes.integrityChanged.length > 0) {
        console.log(chalk.red('⚠️  Integrity changed (version same):'));
        console.log('─'.repeat(60));
        for (const dep of changes.integrityChanged) {
          console.log(`  ${chalk.cyan(dep.name.padEnd(30))} ${chalk.gray(dep.type.padEnd(12))} hash changed`);
        }
        console.log('');
      }

      // Summary
      console.log(chalk.bold('Summary:'));
      const parts ***REMOVED*** [];
      if (summary.changed > 0) parts.push(chalk.yellow(`${summary.changed} changed`));
      if (summary.added > 0) parts.push(chalk.green(`${summary.added} added`));
      if (summary.removed > 0) parts.push(chalk.red(`${summary.removed} removed`));
      console.log('  ' + parts.join(', ') || '  No changes');

    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

// Explain command
program
  .command('explain')
  .description('Analyze a single lockfile')
  .option('--path <path>', 'Lockfile path')
  .action(async (options) ***REMOVED***> {
    if (!options.path) {
      console.error(chalk.red('Error: --path is required'));
      process.exit(1);
    }

    try {
      const analysis ***REMOVED*** analyzeLockfile(options.path);
      const { format, stats, largest } ***REMOVED*** analysis;

      console.log(chalk.bold(`\nLockfile Analysis\n`));
      console.log(`  Format:        ${chalk.cyan(format)}`);
      console.log(`  File size:     ${chalk.yellow(stats.fileSize)}`);
      console.log(`  Total deps:    ${chalk.bold(stats.total.toString())}`);
      console.log(`  Direct deps:   ${chalk.green(stats.direct.toString())}`);
      console.log(`  Transitive:    ${chalk.gray(stats.transitive.toString())}`);

      if (largest.length > 0) {
        console.log(chalk.bold(`\nTop 5 Largest Dependencies:\n`));
        for (const dep of largest) {
          console.log(`  ${chalk.cyan(dep.name.padEnd(30))} ${chalk.gray(dep.version)}`);
        }
      }

    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

// PR comment command
program
  .command('pr-comment')
  .description('Generate markdown for PR comments')
  .option('--base <path>', 'Base lockfile path')
  .option('--head <path>', 'Head lockfile path')
  .action(async (options) ***REMOVED***> {
    if (!options.base || !options.head) {
      console.error(chalk.red('Error: --base and --head are required'));
      process.exit(1);
    }

    try {
      const markdown ***REMOVED*** generatePRComment(options.base, options.head);
      console.log(markdown);
    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

program.parse();
