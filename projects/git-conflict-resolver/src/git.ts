import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

export function isGitRepo(): boolean {
  try {
    execSync('git rev-parse --git-dir', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

export function hasConflicts(): boolean {
  try {
    const output ***REMOVED*** execSync('git diff --name-only --diff-filter***REMOVED***U', { encoding: 'utf-8' });
    return output.trim().length > 0;
  } catch {
    return false;
  }
}

export function getConflictedFiles(): string[] {
  try {
    const output ***REMOVED*** execSync('git diff --name-only --diff-filter***REMOVED***U', { encoding: 'utf-8' });
    return output.trim().split('\n').filter(Boolean);
  } catch {
    return [];
  }
}

export function gitStash(message ***REMOVED*** 'git-conflict-resolver backup'): string | null {
  try {
    // Stash doesn't work with unmerged files, so we create a backup instead
    const root ***REMOVED*** getGitRoot();
    const backupFile ***REMOVED*** join(root, `.git/conflict-resolver-backup-${Date.now()}.json`);
    const conflictedFiles ***REMOVED*** getConflictedFiles();
    const backups: Record<string, string> ***REMOVED*** {};

    for (const file of conflictedFiles) {
      backups[file] ***REMOVED*** readFile(file);
    }

    writeFileSync(backupFile, JSON.stringify({ message, files: backups }, null, 2));
    return backupFile;
  } catch {
    return null;
  }
}

export function gitStashPop(backupFile: string | null): void {
  if (!backupFile) return;

  try {
    const content ***REMOVED*** readFile(backupFile);
    const backup ***REMOVED*** JSON.parse(content);

    for (const [file, content] of Object.entries(backup.files as Record<string, string>)) {
      writeFile(file, content as string);
    }
  } catch {
    // Silently fail if backup restore fails
  }
}

export function gitStashDrop(backupFile: string | null): void {
  if (!backupFile) return;

  try {
    execSync(`rm -f "${backupFile}"`, { stdio: 'ignore' });
  } catch {
    // Ignore errors
  }
}

export function readFile(path: string): string {
  return readFileSync(path, 'utf-8');
}

export function writeFile(path: string, content: string): void {
  writeFileSync(path, content, 'utf-8');
}

export function gitAdd(path: string): void {
  execSync(`git add "${path}"`, { stdio: 'inherit' });
}

export function getGitRoot(): string {
  return execSync('git rev-parse --show-toplevel', { encoding: 'utf-8' }).trim();
}
