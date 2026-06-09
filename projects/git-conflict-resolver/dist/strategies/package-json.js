export class PackageJsonStrategy {
    name ***REMOVED*** 'package.json';
    canHandle(file, _conflict) {
        return file.endsWith('package.json');
    }
    resolve(file, conflict, lines) {
        const changes ***REMOVED*** [];
        try {
            const ours ***REMOVED*** JSON.parse(conflict.ours);
            const theirs ***REMOVED*** JSON.parse(conflict.theirs);
            const merged ***REMOVED*** { ...ours };
            // Merge dependencies
            if (theirs.dependencies) {
                if (!merged.dependencies)
                    merged.dependencies ***REMOVED*** {};
                for (const [pkg, ver] of Object.entries(theirs.dependencies)) {
                    const ourVer ***REMOVED*** merged.dependencies[pkg];
                    const theirVer ***REMOVED*** ver;
                    if (!ourVer) {
                        merged.dependencies[pkg] ***REMOVED*** theirVer;
                        changes.push(`+ ${pkg}@${theirVer}`);
                    }
                    else if (ourVer !***REMOVED******REMOVED*** theirVer) {
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
                if (!merged.devDependencies)
                    merged.devDependencies ***REMOVED*** {};
                for (const [pkg, ver] of Object.entries(theirs.devDependencies)) {
                    const ourVer ***REMOVED*** merged.devDependencies[pkg];
                    const theirVer ***REMOVED*** ver;
                    if (!ourVer) {
                        merged.devDependencies[pkg] ***REMOVED*** theirVer;
                        changes.push(`+ ${pkg}@${theirVer} (dev)`);
                    }
                    else if (ourVer !***REMOVED******REMOVED*** theirVer) {
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
                if (!merged.scripts)
                    merged.scripts ***REMOVED*** {};
                for (const [name, script] of Object.entries(theirs.scripts)) {
                    if (!merged.scripts[name]) {
                        merged.scripts[name] ***REMOVED*** script;
                        changes.push(`+ script: ${name}`);
                    }
                }
            }
            const resolved ***REMOVED*** JSON.stringify(merged, null, 2);
            return { content: resolved, changes };
        }
        catch {
            // Fallback: keep ours if JSON parsing fails
            return { content: conflict.ours, changes: ['Fallback: kept ours (parse error)'] };
        }
    }
    selectVersion(ours, theirs) {
        // Simple version comparison - prefer higher, non-prerelease version
        const cleanVer ***REMOVED*** (v) ***REMOVED***> v.replace(/^[\^~]/, '').split(/[-+]/)[0];
        const parse ***REMOVED*** (v) ***REMOVED***> {
            const parts ***REMOVED*** cleanVer(v).split('.').map(Number);
            return { major: parts[0] || 0, minor: parts[1] || 0, patch: parts[2] || 0 };
        };
        const ourParsed ***REMOVED*** parse(ours);
        const theirParsed ***REMOVED*** parse(theirs);
        // Compare versions
        if (theirParsed.major > ourParsed.major)
            return theirs;
        if (theirParsed.major < ourParsed.major)
            return ours;
        if (theirParsed.minor > ourParsed.minor)
            return theirs;
        if (theirParsed.minor < ourParsed.minor)
            return ours;
        if (theirParsed.patch > ourParsed.patch)
            return theirs;
        return ours; // Tie goes to ours
    }
}
//# sourceMappingURL***REMOVED***package-json.js.map