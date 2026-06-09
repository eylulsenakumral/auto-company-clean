import { parseBundle } from './analyzer.js';
/**
 * Compare two bundles and return differences
 */
export function compareBundles(oldPath, newPath) {
    const oldBundle ***REMOVED*** parseBundle(oldPath);
    const newBundle ***REMOVED*** parseBundle(newPath);
    // Create maps for efficient lookup
    const oldModules ***REMOVED*** new Map(oldBundle.modules.map(m ***REMOVED***> [m.name, m]));
    const newModules ***REMOVED*** new Map(newBundle.modules.map(m ***REMOVED***> [m.name, m]));
    const added ***REMOVED*** [];
    const removed ***REMOVED*** [];
    const changed ***REMOVED*** [];
    // Find added modules
    for (const [name, module] of newModules) {
        if (!oldModules.has(name)) {
            added.push(module);
        }
    }
    // Find removed modules
    for (const [name, module] of oldModules) {
        if (!newModules.has(name)) {
            removed.push(module);
        }
    }
    // Find changed modules
    for (const [name, oldModule] of oldModules) {
        const newModule ***REMOVED*** newModules.get(name);
        if (newModule && oldModule.size !***REMOVED******REMOVED*** newModule.size) {
            const diff ***REMOVED*** newModule.size - oldModule.size;
            changed.push({
                name,
                oldSize: oldModule.size,
                newSize: newModule.size,
                diff,
                diffPercentage: (Math.abs(diff) / oldModule.size) * 100,
            });
        }
    }
    const totalSizeDiff ***REMOVED*** newBundle.totalSize - oldBundle.totalSize;
    const hasRegression ***REMOVED*** totalSizeDiff > 1000; // Regression if > 1KB increase
    return {
        added,
        removed,
        changed,
        totalSizeDiff,
        hasRegression,
    };
}
