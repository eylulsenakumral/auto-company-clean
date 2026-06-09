export class ConfigStrategy {
    name ***REMOVED*** 'config';
    canHandle(file, _conflict) {
        return file.includes('config') ||
            file.endsWith('.config.js') ||
            file.endsWith('.config.ts') ||
            file.endsWith('.config.json') ||
            ['tsconfig.json', 'eslintrc', 'prettierrc', '.babelrc'].some(n ***REMOVED***> file.endsWith(n));
    }
    resolve(file, conflict, lines) {
        const changes ***REMOVED*** [];
        try {
            const ours ***REMOVED*** JSON.parse(conflict.ours);
            const theirs ***REMOVED*** JSON.parse(conflict.theirs);
            const merged ***REMOVED*** { ...ours };
            // Key-value merge: ours wins on conflicts
            for (const [key, value] of Object.entries(theirs)) {
                if (!(key in merged)) {
                    merged[key] ***REMOVED*** value;
                    changes.push(`+ ${key}`);
                }
            }
            const resolved ***REMOVED*** JSON.stringify(merged, null, 2);
            return { content: resolved, changes };
        }
        catch {
            // Not valid JSON - try line-by-line merge
            return this.mergeLines(conflict.ours, conflict.theirs);
        }
    }
    mergeLines(ours, theirs) {
        const ourLines ***REMOVED*** ours.split('\n').filter(Boolean);
        const theirLines ***REMOVED*** theirs.split('\n').filter(Boolean);
        const changes ***REMOVED*** [];
        const merged ***REMOVED*** new Set();
        // Add all our lines
        for (const line of ourLines) {
            const key ***REMOVED*** this.extractKey(line);
            if (key)
                merged.add(key);
        }
        // Add their keys that we don't have
        for (const line of theirLines) {
            const key ***REMOVED*** this.extractKey(line);
            if (key && !merged.has(key)) {
                merged.add(key);
                changes.push(`+ ${key}`);
            }
        }
        // Rebuild with ours first, then new theirs
        const result ***REMOVED*** [...ourLines];
        for (const line of theirLines) {
            const key ***REMOVED*** this.extractKey(line);
            if (key && !merged.has(key)) {
                result.push(line);
            }
        }
        return { content: result.join('\n'), changes };
    }
    extractKey(line) {
        const match ***REMOVED*** line.match(/^(\w+):/);
        return match ? match[1] : null;
    }
}
//# sourceMappingURL***REMOVED***config.js.map