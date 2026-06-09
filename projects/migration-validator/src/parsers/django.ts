/**
 * Django migration parser
 */

import type { ParsedMigration, Framework } from '../types.js';

const DJANGO_OPS ***REMOVED*** [
  'migrations.CreateModel',
  'migrations.DeleteModel',
  'migrations.AddField',
  'migrations.RemoveField',
  'migrations.AlterField',
  'migrations.RenameField',
  'migrations.RunSQL',
  'migrations.RunPython'
];

export function detectDjango(content: string): boolean {
  return DJANGO_OPS.some(op ***REMOVED***> content.includes(op)) ||
         (content.includes('class Migration') && content.includes('dependencies ***REMOVED***'));
}

export function parseDjango(content: string): ParsedMigration {
  const operations ***REMOVED*** extractOperations(content);
  const up: string[] ***REMOVED*** [];
  const down: string[] ***REMOVED*** [];

  for (const op of operations) {
    up.push(op);
    // Infer rollback
    down.push(inferDjangoRollback(op));
  }

  return { up, down };
}

function extractOperations(content: string): string[] {
  const ops: string[] ***REMOVED*** [];

  // Match migrations.operations ***REMOVED*** [ ... ]
  const opsMatch ***REMOVED*** content.match(/operations\s****REMOVED***\s*\[([\s\S]*?)\]/);
  if (!opsMatch) return ops;

  const operationsBlock ***REMOVED*** opsMatch[1];

  // Extract individual migration operations
  const opRegex ***REMOVED*** /migrations\.\w+\([^)]*\)/g;
  let match;
  while ((match ***REMOVED*** opRegex.exec(operationsBlock)) !***REMOVED******REMOVED*** null) {
    ops.push(match[0]);
  }

  // Also capture RunSQL and RunPython with multi-line content
  const runSqlMatch ***REMOVED*** content.match(/migrations\.RunSQL\(\s*["'`][\s\S]*?["'`](?:\s*,\s*["'`][\s\S]*?["'`])?\s*\)/g);
  if (runSqlMatch) {
    ops.push(...runSqlMatch);
  }

  return ops;
}

function inferDjangoRollback(operation: string): string {
  // Infer reverse operations
  if (operation.includes('CreateModel')) {
    const match ***REMOVED*** operation.match(/name\s****REMOVED***\s*['"`](\w+)['"`]/);
    if (match) {
      return `migrations.DeleteModel(name***REMOVED***'${match[1]}')`;
    }
  } else if (operation.includes('DeleteModel')) {
    const match ***REMOVED*** operation.match(/name\s****REMOVED***\s*['"`](\w+)['"`]/);
    if (match) {
      return `migrations.CreateModel(name***REMOVED***'${match[1]}')`;
    }
  } else if (operation.includes('AddField')) {
    const match ***REMOVED*** operation.match(/model_name\s****REMOVED***\s*['"`](\w+)['"`]\s*,\s*name\s****REMOVED***\s*['"`](\w+)['"`]/);
    if (match) {
      return `migrations.RemoveField(model_name***REMOVED***'${match[1]}', name***REMOVED***'${match[2]}')`;
    }
  } else if (operation.includes('RemoveField')) {
    const match ***REMOVED*** operation.match(/model_name\s****REMOVED***\s*['"`](\w+)['"`]\s*,\s*name\s****REMOVED***\s*['"`](\w+)['"`]/);
    if (match) {
      return `migrations.AddField(model_name***REMOVED***'${match[1]}', name***REMOVED***'${match[2]}')`;
    }
  }

  return `# Rollback for ${operation.split('(')[0]} requires manual definition`;
}

export const FRAMEWORK: Framework ***REMOVED*** 'django';

// Export aliases for ParserModule interface
export const detect ***REMOVED*** detectDjango;
export const parse ***REMOVED*** parseDjango;
