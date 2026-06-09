// Parse yarn.lock files

import fs from 'fs';

export function parseYarnLock(filePath) {
  const content ***REMOVED*** fs.readFileSync(filePath, 'utf8');

  const dependencies ***REMOVED*** new Map();
  const directDeps ***REMOVED*** new Set();

  // Detect yarn version from header
  const yarnVersion ***REMOVED*** detectYarnVersion(content);

  // Parse entries
  const entries ***REMOVED*** parseEntries(content);

  for (const entry of entries) {
    for (const key of entry.keys) {
      const { name, version } ***REMOVED*** parseYarnKey(key);
      const fullKey ***REMOVED*** `${name}@${version}`;

      if (!dependencies.has(fullKey)) {
        dependencies.set(fullKey, {
          name,
          version,
          resolved: entry.resolved,
          checksum: entry.checksum || entry.integrity,
          isDirect: entry.keys.length ***REMOVED******REMOVED******REMOVED*** 1 && !key.includes('@')
        });

        if (entry.keys.length ***REMOVED******REMOVED******REMOVED*** 1) {
          directDeps.add(fullKey);
        }
      }
    }
  }

  return {
    format: `yarn ${yarnVersion}`,
    dependencies,
    directDeps,
    metadata: { yarnVersion }
  };
}

function detectYarnVersion(content) {
  if (content.includes('__metadata')) return 'v3 (Berry)';
  if (content.startsWith('# yarn lockfile')) {
    const match ***REMOVED*** content.match(/# yarn lockfile v(\d+)/);
    return match ? `v${match[1]}` : 'v1';
  }
  return 'v1';
}

function parseEntries(content) {
  const entries ***REMOVED*** [];
  const lines ***REMOVED*** content.split('\n');

  let currentEntry ***REMOVED*** null;

  for (const line of lines) {
    const trimmed ***REMOVED*** line.trim();

    // Skip comments and empty lines
    if (!trimmed || trimmed.startsWith('#')) continue;

    // Entry header: "name@version:" or just "name:"
    if (trimmed.endsWith(':')) {
      if (currentEntry) {
        entries.push(currentEntry);
      }
      currentEntry ***REMOVED*** { keys: [], resolved: null, checksum: null, integrity: null };
      const key ***REMOVED*** trimmed.slice(0, -1);
      currentEntry.keys.push(key);
    } else if (currentEntry) {
      // Entry properties
      if (trimmed.startsWith('version ')) {
        // Version is already in the key
      } else if (trimmed.startsWith('resolved ')) {
        currentEntry.resolved ***REMOVED*** trimmed.slice(9).replace(/"/g, '');
      } else if (trimmed.startsWith('checksum ')) {
        currentEntry.checksum ***REMOVED*** trimmed.slice(9).replace(/"/g, '');
      } else if (trimmed.startsWith('integrity ')) {
        currentEntry.integrity ***REMOVED*** trimmed.slice(10).replace(/"/g, '');
      }
    }
  }

  if (currentEntry) {
    entries.push(currentEntry);
  }

  return entries;
}

function parseYarnKey(key) {
  // Handles: "package@version", "package@1.2.3", "package@npm:1.2.3", "@scope/package@version"
  let name, version;

  if (key.includes('@npm:')) {
    [name, version] ***REMOVED*** key.split('@npm:');
  } else {
    const atIndex ***REMOVED*** key.lastIndexOf('@');
    if (atIndex > 0) {
      name ***REMOVED*** key.slice(0, atIndex);
      version ***REMOVED*** key.slice(atIndex + 1);
    } else {
      name ***REMOVED*** key;
      version ***REMOVED*** 'unknown';
    }
  }

  return { name, version };
}
