// Single lockfile analysis

import { parsePackageLock } from '../parsers/package-lock-parser.js';
import { parseYarnLock } from '../parsers/yarn-lock-parser.js';
import fs from 'fs';

export function analyzeLockfile(filePath) {
  const content ***REMOVED*** fs.readFileSync(filePath, 'utf8');
  const stats ***REMOVED*** fs.statSync(filePath);

  let data;
  if (filePath.endsWith('package-lock.json') || JSON.parse(content)) {
    data ***REMOVED*** parsePackageLock(filePath);
  } else {
    data ***REMOVED*** parseYarnLock(filePath);
  }

  // Calculate stats
  const totalDeps ***REMOVED*** data.dependencies.size;
  const directDeps ***REMOVED*** data.directDeps.size;
  const transitiveDeps ***REMOVED*** totalDeps - directDeps;

  // Find largest dependencies (by version string length as proxy)
  const largest ***REMOVED*** [...data.dependencies.values()]
    .filter(dep ***REMOVED***> !dep.isDirect)
    .sort((a, b) ***REMOVED***> (b.version?.length || 0) - (a.version?.length || 0))
    .slice(0, 5)
    .map(dep ***REMOVED***> ({
      name: dep.name,
      version: dep.version
    }));

  return {
    format: data.format,
    stats: {
      total: totalDeps,
      direct: directDeps,
      transitive: transitiveDeps,
      fileSize: formatBytes(stats.size)
    },
    largest
  };
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
