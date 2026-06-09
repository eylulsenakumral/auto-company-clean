// Generate PR comment markdown

import { analyzeLockfileDiff } from './diff-analyzer.js';

export function generatePRComment(basePath, headPath) {
  const analysis ***REMOVED*** analyzeLockfileDiff(basePath, headPath);
  const { changes, summary } ***REMOVED*** analysis;

  let markdown ***REMOVED*** '## 🔒 Lockfile Changes\n\n';

  if (summary.changed ***REMOVED******REMOVED******REMOVED*** 0 && summary.added ***REMOVED******REMOVED******REMOVED*** 0 && summary.removed ***REMOVED******REMOVED******REMOVED*** 0) {
    markdown +***REMOVED*** 'No dependency changes detected.\n';
    return markdown;
  }

  // Build table rows
  const rows ***REMOVED*** [];

  for (const dep of changes.changed) {
    rows.push({
      dependency: dep.name,
      type: dep.type,
      change: `${dep.oldVersion} → ${dep.newVersion}`
    });
  }

  for (const dep of changes.added) {
    rows.push({
      dependency: dep.name,
      type: dep.type,
      change: `Added (${dep.version})`
    });
  }

  for (const dep of changes.removed) {
    rows.push({
      dependency: dep.name,
      type: dep.type,
      change: `Removed (${dep.version})`
    });
  }

  if (rows.length > 0) {
    markdown +***REMOVED*** '| Dependency | Type | Change |\n';
    markdown +***REMOVED*** '|-------------|------|--------|\n';
    for (const row of rows) {
      markdown +***REMOVED*** `| ${row.dependency} | ${row.type} | ${row.change} |\n`;
    }
  }

  // Summary
  markdown +***REMOVED*** `\n**Summary:** `;
  const parts ***REMOVED*** [];
  if (summary.changed > 0) parts.push(`${summary.changed} changed`);
  if (summary.added > 0) parts.push(`${summary.added} added`);
  if (summary.removed > 0) parts.push(`${summary.removed} removed`);
  markdown +***REMOVED*** parts.join(', ') + '\n';

  // Security warnings
  if (changes.integrityChanged.length > 0) {
    markdown +***REMOVED*** '\n⚠️ **Security Warning:** Integrity hashes changed for:\n';
    for (const dep of changes.integrityChanged) {
      markdown +***REMOVED*** `- ${dep.name} (${dep.type})\n`;
    }
  }

  return markdown;
}
