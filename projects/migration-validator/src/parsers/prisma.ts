/**
 * Prisma migration parser
 */

import type { ParsedMigration, Framework } from '../types.js';

const PRISMA_MIGRATION_HEADER ***REMOVED*** /^--\s*Migration\s*:(.+)/;
const PRISMA_APPLY ***REMOVED*** /^--\s*Apply/;
const PRISMA_ROLLBACK ***REMOVED*** /^--\s*Rollback/;

export function detectPrisma(content: string): boolean {
  return PRISMA_MIGRATION_HEADER.test(content) ||
         content.includes('-- CreateIndex') ||
         content.includes('-- AlterTable');
}

export function parsePrisma(content: string): ParsedMigration {
  const lines ***REMOVED*** content.split('\n');
  const up: string[] ***REMOVED*** [];
  const down: string[] ***REMOVED*** [];

  let currentSection: 'up' | 'down' | 'none' ***REMOVED*** 'none';

  for (const line of lines) {
    if (PRISMA_APPLY.test(line)) {
      currentSection ***REMOVED*** 'up';
      continue;
    }
    if (PRISMA_ROLLBACK.test(line)) {
      currentSection ***REMOVED*** 'down';
      continue;
    }

    if (currentSection ***REMOVED******REMOVED******REMOVED*** 'up' && line.trim()) {
      up.push(line);
    } else if (currentSection ***REMOVED******REMOVED******REMOVED*** 'down' && line.trim()) {
      down.push(line);
    }
  }

  // If no rollback section found, down is empty
  if (down.length ***REMOVED******REMOVED******REMOVED*** 0) {
    // Try to infer down from up (reverse operations)
    down.push(...inferRollback(up));
  }

  return { up, down };
}

function inferRollback(up: string[]): string[] {
  const down: string[] ***REMOVED*** [];

  for (const stmt of up.reverse()) {
    // Simple inference for common patterns
    if (stmt.includes('-- CreateTable')) {
      const match ***REMOVED*** stmt.match(/CreateTable\("(\w+)"/);
      if (match) {
        down.push(`-- DropTable("${match[1]}")`);
      }
    } else if (stmt.includes('-- AlterTable')) {
      // Can't safely infer rollback for ALTER without more context
      down.push('-- Rollback for ALTER requires manual definition');
    } else if (stmt.includes('-- CreateIndex')) {
      const match ***REMOVED*** stmt.match(/CreateIndex\(.+?"name"\s*:\s*"(\w+)"/);
      if (match) {
        down.push(`-- DropIndex("${match[1]}")`);
      }
    }
  }

  return down;
}

export const FRAMEWORK: Framework ***REMOVED*** 'prisma';

// Export aliases for ParserModule interface
export const detect ***REMOVED*** detectPrisma;
export const parse ***REMOVED*** parsePrisma;
