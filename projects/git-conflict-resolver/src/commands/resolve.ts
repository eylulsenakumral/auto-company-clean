import chalk from 'chalk';
import ora from 'ora';
import { readFileSync, writeFileSync } from 'fs';
import {
  isGitRepo,
  hasConflicts,
  getConflictedFiles,
  gitStash,
  gitStashPop,
  gitStashDrop,
  readFile,
  writeFile,
  gitAdd,
} from '../git.js';
import { detectConflictMarkers } from '../parser.js';
import { resolveAll } from '../resolver.js';
import type { ResolveOptions } from '../types.js';

export async function resolveCommand(options: ResolveOptions): Promise<void> {
  console.log(chalk.cyan.bold('\n  git-conflict-resolver v0.1.0\n'));

  // Check if we're in a git repo
  if (!isGitRepo()) {
    console.error(chalk.red('  Not a git repository'));
    process.exit(2);
  }

  // Check for conflicts
  if (!hasConflicts()) {
    console.log(chalk.green('  No merge conflicts detected'));
    process.exit(0);
  }

  const files ***REMOVED*** getConflictedFiles();

  if (files.length ***REMOVED******REMOVED******REMOVED*** 0) {
    console.log(chalk.green('  No conflicted files found'));
    process.exit(0);
  }

  console.log(chalk.yellow(`  Found ${files.length} conflicted file(s):\n`));

  for (const file of files) {
    console.log(`    ${chalk.gray('-')} ${file}`);
  }

  console.log();

  // Safety: stash before resolving
  let stashRef: string | null ***REMOVED*** null;
  if (!options.preview) {
    const spinner ***REMOVED*** ora('Creating safety backup...').start();
    try {
      stashRef ***REMOVED*** gitStash();
      spinner.succeed('Created safety backup');
    } catch {
      spinner.fail('Failed to create backup');
      process.exit(2);
    }
  }

  // Resolve conflicts
  const spinner ***REMOVED*** ora('Resolving conflicts...').start();

  try {
    const results ***REMOVED*** await resolveAll(files, options);
    spinner.stop();

    // Display results
    console.log(chalk.cyan('\n  Results:\n'));

    let resolvedCount ***REMOVED*** 0;
    let needsManualCount ***REMOVED*** 0;

    for (const result of results) {
      if (!result.resolved) {
        console.log(`    ${chalk.gray('-')} ${result.file}: ${chalk.yellow('no conflicts found')}`);
        continue;
      }

      if (result.changes.length ***REMOVED******REMOVED******REMOVED*** 0) {
        console.log(`    ${chalk.gray('-')} ${result.file}: ${chalk.gray('no changes')}`);
        needsManualCount++;
        continue;
      }

      resolvedCount++;
      console.log(`    ${chalk.green('✓')} ${result.file}: ${chalk.cyan(result.strategy)} (${result.changes.length} change(s))`);

      if (options.verbose && result.changes.length > 0) {
        for (const change of result.changes) {
          console.log(`        ${chalk.gray('•')} ${change}`);
        }
      }
    }

    console.log();

    // Preview mode
    if (options.preview) {
      console.log(chalk.yellow('  Preview mode - no changes applied\n'));
      if (resolvedCount > 0 && !options.force) {
        console.log(chalk.gray('  Run without --preview to apply changes'));
      }
      process.exit(0);
    }

    // Apply changes
    if (resolvedCount > 0) {
      if (!options.force) {
        console.log(chalk.yellow(`  About to resolve ${resolvedCount} file(s). Press Ctrl+C to cancel.`));
        await new Promise(resolve ***REMOVED***> setTimeout(resolve, 2000));
      }

      const applySpinner ***REMOVED*** ora('Applying changes...').start();

      for (const result of results) {
        if (result.resolved && result.changes.length > 0) {
          writeFile(result.file, result.preview);
          gitAdd(result.file);
        }
      }

      applySpinner.succeed('Changes applied');
    }

    // Clean up stash
    if (stashRef) {
      const cleanupSpinner ***REMOVED*** ora('Cleaning up stash...').start();
      gitStashDrop(stashRef);
      cleanupSpinner.succeed('Stash cleaned up');
    }

    console.log();

    if (needsManualCount ***REMOVED******REMOVED******REMOVED*** 0) {
      console.log(chalk.green.bold('  All conflicts resolved!'));
      process.exit(0);
    } else {
      console.log(chalk.yellow.bold(`  ${resolvedCount} file(s) resolved, ${needsManualCount} need manual intervention`));
      process.exit(1);
    }
  } catch (error) {
    spinner.fail('Failed to resolve conflicts');

    // Rollback on error
    if (stashRef) {
      console.error(chalk.red('\n  Rolling back due to error...'));
      try {
        gitStashPop(stashRef);
        console.log(chalk.red('  Rolled back to original state'));
      } catch {
        console.error(chalk.red('  Failed to rollback - stash ref: ' + stashRef));
      }
    }

    console.error(chalk.red(String(error)));
    process.exit(2);
  }
}
