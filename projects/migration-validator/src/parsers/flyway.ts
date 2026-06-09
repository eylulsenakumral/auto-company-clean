/**
 * Flyway migration parser
 */

import type { ParsedMigration, Framework } from '../types.js';

const FLYWAY_VERSION_PATTERN ***REMOVED*** /^V\d+__|V\d+\.?\d*?__/;

export function detectFlyway(filename: string, content: string): boolean {
  return FLYWAY_VERSION_PATTERN.test(filename) ||
         (content.includes('-- Flyway') && (content.includes('-- V') || /^\s*V\d+/.test(content)));
}

export function parseFlyway(content: string): ParsedMigration {
  const statements ***REMOVED*** content
    .split(/^;\s*$/m) // Split on semicolons at line start
    .map(s ***REMOVED***> s.trim())
    .filter(s ***REMOVED***> s && !s.startsWith('--'));

  const up: string[] ***REMOVED*** [];
  const down: string[] ***REMOVED*** [];

  // Look for undo section (Flyway Teams undo migrations)
  const undoMatch ***REMOVED*** content.match(/--\s*Undo\s*:\s*([\s\S]+)/i);
  if (undoMatch) {
    const undoStatements ***REMOVED*** undoMatch[1]
      .split(/^;\s*$/m)
      .map(s ***REMOVED***> s.trim())
      .filter(s ***REMOVED***> s && !s.startsWith('--'));
    down.push(...undoStatements);
  }

  up.push(...statements);

  return { up, down };
}

export const FRAMEWORK: Framework ***REMOVED*** 'flyway';

// Export aliases for ParserModule interface
export const detect ***REMOVED*** detectFlyway;
export const parse ***REMOVED*** parseFlyway;
