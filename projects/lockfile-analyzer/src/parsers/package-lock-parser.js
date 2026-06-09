// Parse package-lock.json files

import fs from 'fs';

export function parsePackageLock(filePath) {
  const content ***REMOVED*** fs.readFileSync(filePath, 'utf8');
  const lockfile ***REMOVED*** JSON.parse(content);

  const dependencies ***REMOVED*** new Map();
  const directDeps ***REMOVED*** new Set();

  // Detect format version
  const lockfileVersion ***REMOVED*** lockfile.lockfileVersion || 1;

  if (lockfileVersion ***REMOVED******REMOVED******REMOVED*** 1) {
    // npm v1 format: dependencies are nested
    parseV1Format(lockfile, dependencies, directDeps);
  } else {
    // npm v2/v3 format: flat packages object
    parseV2Format(lockfile, dependencies, directDeps);
  }

  return {
    format: `npm v${lockfileVersion}`,
    dependencies,
    directDeps,
    metadata: {
      version: lockfile.version,
      lockfileVersion
    }
  };
}

function parseV1Format(lockfile, dependencies, directDeps) {
  if (!lockfile.dependencies) return;

  const traverse ***REMOVED*** (deps, isDirect ***REMOVED*** false) ***REMOVED***> {
    for (const [name, info] of Object.entries(deps)) {
      const key ***REMOVED*** `${name}@${info.version}`;
      dependencies.set(key, {
        name,
        version: info.version,
        integrity: info.integrity,
        resolved: info.resolved,
        isDirect: isDirect
      });

      if (isDirect) directDeps.add(key);

      if (info.dependencies) {
        traverse(info.dependencies, false);
      }
    }
  };

  traverse(lockfile.dependencies, true);
}

function parseV2Format(lockfile, dependencies, directDeps) {
  if (!lockfile.packages) return;

  // Get direct dependencies from root package
  const rootPackage ***REMOVED*** lockfile.packages[''] || {};
  const directDepNames ***REMOVED*** new Set(Object.keys(rootPackage.dependencies || {}));

  for (const [path, info] of Object.entries(lockfile.packages)) {
    if (path ***REMOVED******REMOVED******REMOVED*** '') continue; // Root package

    const name ***REMOVED*** path.startsWith('node_modules/') ? path.slice(13) : path;
    const version ***REMOVED*** info.version;
    const key ***REMOVED*** `${name}@${version}`;
    const isDirect ***REMOVED*** directDepNames.has(name);

    dependencies.set(key, {
      name,
      version,
      integrity: info.integrity,
      resolved: info.resolved,
      isDirect
    });

    if (isDirect) {
      directDeps.add(key);
    }
  }
}
