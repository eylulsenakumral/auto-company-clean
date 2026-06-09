#!/usr/bin/env node
import { resolveCommand } from '../dist/commands/resolve.js';
import { program } from 'commander';

program
  .name('git-conflict-resolver')
  .description('CLI tool that auto-resolves 80% of git merge conflicts using intelligent heuristics')
  .version('0.1.0');

program
  .command('resolve')
  .description('Auto-resolve git merge conflicts')
  .option('-p, --preview', 'Show what would change without applying')
  .option('-f, --force', 'Skip confirmation')
  .option('-v, --verbose', 'Show detailed output')
  .action(resolveCommand);

program.parse();
