// Version comparison utilities

export function compareVersions(a, b) {
  if (!a || !b) return 0;

  // Handle semver comparison
  const partsA ***REMOVED*** parseSemver(a);
  const partsB ***REMOVED*** parseSemver(b);

  for (let i ***REMOVED*** 0; i < 3; i++) {
    if (partsA[i] !***REMOVED******REMOVED*** partsB[i]) {
      return partsA[i] - partsB[i];
    }
  }

  // Compare prerelease and build
  const prereleaseA ***REMOVED*** a.split('-')[1] || '';
  const prereleaseB ***REMOVED*** b.split('-')[1] || '';

  if (prereleaseA && !prereleaseB) return -1;
  if (!prereleaseA && prereleaseB) return 1;
  if (prereleaseA !***REMOVED******REMOVED*** prereleaseB) return prereleaseA.localeCompare(prereleaseB);

  return 0;
}

function parseSemver(version) {
  const match ***REMOVED*** version.match(/^(\d+)\.(\d+)\.(\d+)/);
  if (!match) return [0, 0, 0];
  return [parseInt(match[1], 10), parseInt(match[2], 10), parseInt(match[3], 10)];
}

export function formatVersionChange(oldVer, newVer) {
  if (!oldVer) return `Added (${newVer})`;
  if (!newVer) return 'Removed';
  if (oldVer ***REMOVED******REMOVED******REMOVED*** newVer) return oldVer;
  return `${oldVer} → ${newVer}`;
}
