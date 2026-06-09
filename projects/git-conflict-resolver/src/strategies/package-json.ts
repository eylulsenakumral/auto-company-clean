import { Strategy, ConflictMarker } from '../types.js';

export class PackageJsonStrategy implements Strategy {
  name ***REMOVED*** 'package.json';

  canHandle(file: string, _conflict: ConflictMarker): boolean {
    return file.endsWith('package.json');
  }

  resolve(file: string, conflict: ConflictMarker, lines: string[]): { content: string; changes: string[] } {
    const changes: string[] ***REMOVED*** [];

    try {
      const ours ***REMOVED*** JSON.parse(conflict.ours);
      const theirs ***REMOVED*** JSON.parse(conflict.theirs);
      const merged ***REMOVED*** { ...ours };

      // Merge dependencies
      if (theirs.dependencies) {
        if (!merged.dependencies) merged.dependencies ***REMOVED*** {};
        for (const [pkg, ver] of Object.entries(theirs.dependencies)) {
          const ourVer ***REMOVED*** merged.dependencies[pkg];
          const theirVer ***REMOVED*** ver as string;
          if (!ourVer) {
            merged.dependencies[pkg] ***REMOVED*** theirVer;
            changes.push(`+ ${pkg}@${theirVer}`);
          } else if (ourVer !***REMOVED******REMOVED*** theirVer) {
            // Keep the higher version
            const selected ***REMOVED*** this.selectVersion(ourVer, theirVer);
            if (selected !***REMOVED******REMOVED*** ourVer) {
              merged.dependencies[pkg] ***REMOVED*** selected;
              changes.push(`~ ${pkg}: ${ourVer} -> ${selected}`);
            }
          }
        }
      }

      // Merge devDependencies
      if (theirs.devDependencies) {
        if (!merged.devDependencies) merged.devDependencies ***REMOVED*** {};
        for (const [pkg, ver] of Object.entries(theirs.devDependencies)) {
          const ourVer ***REMOVED*** merged.devDependencies[pkg];
          const theirVer ***REMOVED*** ver as string;
          if (!ourVer) {
            merged.devDependencies[pkg] ***REMOVED*** theirVer;
            changes.push(`+ ${pkg}@${theirVer} (dev)`);
          } else if (ourVer !***REMOVED******REMOVED*** theirVer) {
            const selected ***REMOVED*** this.selectVersion(ourVer, theirVer);
            if (selected !***REMOVED******REMOVED*** ourVer) {
              merged.devDependencies[pkg] ***REMOVED*** selected;
              changes.push(`~ ${pkg}: ${ourVer} -> ${selected} (dev)`);
            }
          }
        }
      }

      // Merge scripts - ours wins
      if (theirs.scripts) {
        if (!merged.scripts) merged.scripts ***REMOVED*** {};
        for (const [name, script] of Object.entries(theirs.scripts)) {
          if (!merged.scripts[name]) {
            merged.scripts[name] ***REMOVED*** script;
            changes.push(`+ script: ${name}`);
          }
        }
      }

      const resolved ***REMOVED*** JSON.stringify(merged, null, 2);
      return { content: resolved, changes };
    } catch {
      // Fallback: keep ours if JSON parsing fails
      return { content: conflict.ours, changes: ['Fallback: kept ours (parse error)'] };
    }
  }

  private selectVersion(ours: string, theirs: string): string {
    // Simple version comparison - prefer higher, non-prerelease version
    const cleanVer ***REMOVED*** (v: string) ***REMOVED***> v.replace(/^[\^~]/, '').split(/[-+]/)[0];
    const parse ***REMOVED*** (v: string) ***REMOVED***> {
      const parts ***REMOVED*** cleanVer(v).split('.').map(Number);
      return { major: parts[0] || 0, minor: parts[1] || 0, patch: parts[2] || 0 };
    };

    const ourParsed ***REMOVED*** parse(ours);
    const theirParsed ***REMOVED*** parse(theirs);

    // Compare versions
    if (theirParsed.major > ourParsed.major) return theirs;
    if (theirParsed.major < ourParsed.major) return ours;
    if (theirParsed.minor > ourParsed.minor) return theirs;
    if (theirParsed.minor < ourParsed.minor) return ours;
    if (theirParsed.patch > ourParsed.patch) return theirs;
    return ours; // Tie goes to ours
  }
}
