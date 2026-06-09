/**
 * Raw SQL migration parser
 */

import type { ParsedMigration, Framework } from '../types.js';

const SQL_KEYWORDS ***REMOVED*** [
  'CREATE TABLE', 'ALTER TABLE', 'DROP TABLE', 'ADD COLUMN', 'DROP COLUMN',
  'CREATE INDEX', 'DROP INDEX', 'MODIFY COLUMN', 'CHANGE COLUMN'
];

export function detectRawSQL(content: string): boolean {
  const upperContent ***REMOVED*** content.toUpperCase();
  return SQL_KEYWORDS.some(kw ***REMOVED***> upperContent.includes(kw));
}

export function parseRawSQL(content: string): ParsedMigration {
  const statements ***REMOVED*** content
    .split(/;\s*\n/) // Split on semicolons followed by newline
    .map(s ***REMOVED***> s.trim())
    .filter(s ***REMOVED***> s && !s.toUpperCase().startsWith('--'));

  const up: string[] ***REMOVED*** [];
  const down: string[] ***REMOVED*** [];

  // Look for rollback comment patterns
  const rollbackMatch ***REMOVED*** content.match(/--\s*Rollback\s*:\s*([\s\S]+)/i);
  const undoMatch ***REMOVED*** content.match(/--\s*Undo\s*:\s*([\s\S]+)/i);
  const downMatch ***REMOVED*** content.match(/--\s*Down\s*:\s*([\s\S]+)/i);

  let rollbackContent: string | null;
  if (rollbackMatch) rollbackContent ***REMOVED*** rollbackMatch[1];
  else if (undoMatch) rollbackContent ***REMOVED*** undoMatch[1];
  else if (downMatch) rollbackContent ***REMOVED*** downMatch[1];
  else rollbackContent ***REMOVED*** null;

  if (rollbackContent) {
    const rollbackStatements ***REMOVED*** rollbackContent
      .split(/;\s*\n/)
      .map(s ***REMOVED***> s.trim())
      .filter(s ***REMOVED***> s && !s.toUpperCase().startsWith('--'));
    down.push(...rollbackStatements);
  }

  up.push(...statements);

  return { up, down };
}

export const FRAMEWORK: Framework ***REMOVED*** 'raw-sql';

// Export aliases for ParserModule interface
export const detect ***REMOVED*** detectRawSQL;
export const parse ***REMOVED*** parseRawSQL;
