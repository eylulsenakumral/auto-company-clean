// Diff analysis for lockfiles

import { parsePackageLock } from '../parsers/package-lock-parser.js';
import { parseYarnLock } from '../parsers/yarn-lock-parser.js';
import { formatVersionChange } from '../utils/version.js';
import fs from 'fs';

export function analyzeLockfileDiff(basePath, headPath) {
  const baseData ***REMOVED*** parseLockfile(basePath);
  const headData ***REMOVED*** parseLockfile(headPath);

  const changes ***REMOVED*** {
    added: [],
    removed: [],
    changed: [],
    integrityChanged: []
  };

  // Group dependencies by name (not name@version)
  const baseByName ***REMOVED*** new Map();
  for (const [key, dep] of baseData.dependencies) {
    if (!baseByName.has(dep.name)) {
      baseByName.set(dep.name, []);
    }
    baseByName.get(dep.name).push({ key, dep, isDirect: baseData.directDeps.has(key) });
  }

  const headByName ***REMOVED*** new Map();
  for (const [key, dep] of headData.dependencies) {
    if (!headByName.has(dep.name)) {
      headByName.set(dep.name, []);
    }
    headByName.get(dep.name).push({ key, dep, isDirect: headData.directDeps.has(key) });
  }

  // Track all dependency names
  const allNames ***REMOVED*** new Set([
    ...baseByName.keys(),
    ...headByName.keys()
  ]);

  for (const name of allNames) {
    const baseVersions ***REMOVED*** baseByName.get(name) || [];
    const headVersions ***REMOVED*** headByName.get(name) || [];

    // Determine type based on direct dependency status
    const isDirect ***REMOVED*** [...baseVersions, ...headVersions].some(v ***REMOVED***> v.isDirect);
    const type ***REMOVED*** isDirect ? 'Direct' : 'Transitive';

    if (baseVersions.length ***REMOVED******REMOVED******REMOVED*** 0 && headVersions.length > 0) {
      // Added
      for (const { dep } of headVersions) {
        changes.added.push({
          name: dep.name,
          version: dep.version,
          type
        });
      }
    } else if (baseVersions.length > 0 && headVersions.length ***REMOVED******REMOVED******REMOVED*** 0) {
      // Removed
      for (const { dep } of baseVersions) {
        changes.removed.push({
          name: dep.name,
          version: dep.version,
          type
        });
      }
    } else {
      // Both exist - check for version changes
      const baseVersionsSet ***REMOVED*** new Set(baseVersions.map(v ***REMOVED***> v.dep.version));
      const headVersionsSet ***REMOVED*** new Set(headVersions.map(v ***REMOVED***> v.dep.version));

      // Find added versions (in head but not base)
      for (const { dep } of headVersions) {
        if (!baseVersionsSet.has(dep.version)) {
          changes.added.push({
            name: dep.name,
            version: dep.version,
            type
          });
        }
      }

      // Find removed versions (in base but not head)
      for (const { dep } of baseVersions) {
        if (!headVersionsSet.has(dep.version)) {
          changes.removed.push({
            name: dep.name,
            version: dep.version,
            type
          });
        }
      }

      // Find version changes (same name, different version)
      for (const { dep: baseDep } of baseVersions) {
        for (const { dep: headDep } of headVersions) {
          if (baseDep.version !***REMOVED******REMOVED*** headDep.version) {
            // Check if this specific version was replaced
            const baseKey ***REMOVED*** `${name}@${baseDep.version}`;
            const headKey ***REMOVED*** `${name}@${headDep.version}`;

            // Mark as changed if the old version is gone and new exists
            if (!headVersionsSet.has(baseDep.version) && !baseVersionsSet.has(headDep.version)) {
              changes.changed.push({
                name,
                oldVersion: baseDep.version,
                newVersion: headDep.version,
                type,
                change: formatVersionChange(baseDep.version, headDep.version)
              });

              // Remove from added/removed since we counted as changed
              const addedIdx ***REMOVED*** changes.added.findIndex(a ***REMOVED***> a.name ***REMOVED******REMOVED******REMOVED*** name && a.version ***REMOVED******REMOVED******REMOVED*** headDep.version);
              const removedIdx ***REMOVED*** changes.removed.findIndex(r ***REMOVED***> r.name ***REMOVED******REMOVED******REMOVED*** name && r.version ***REMOVED******REMOVED******REMOVED*** baseDep.version);

              if (addedIdx >***REMOVED*** 0) changes.added.splice(addedIdx, 1);
              if (removedIdx >***REMOVED*** 0) changes.removed.splice(removedIdx, 1);
            }
          }
        }
      }
    }
  }

  // Sort by name
  changes.added.sort((a, b) ***REMOVED***> a.name.localeCompare(b.name));
  changes.removed.sort((a, b) ***REMOVED***> a.name.localeCompare(b.name));
  changes.changed.sort((a, b) ***REMOVED***> a.name.localeCompare(b.name));

  return {
    changes,
    format: headData.format,
    summary: {
      added: changes.added.length,
      removed: changes.removed.length,
      changed: changes.changed.length,
      integrityChanged: changes.integrityChanged.length
    }
  };
}

function parseLockfile(filePath) {
  const content ***REMOVED*** fs.readFileSync(filePath, 'utf8');

  if (filePath.endsWith('package-lock.json')) {
    return parsePackageLock(filePath);
  } else if (filePath.endsWith('yarn.lock')) {
    return parseYarnLock(filePath);
  } else {
    // Detect by content
    try {
      JSON.parse(content);
      return parsePackageLock(filePath);
    } catch {
      return parseYarnLock(filePath);
    }
  }
}
