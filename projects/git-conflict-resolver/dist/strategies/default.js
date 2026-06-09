export class DefaultStrategy {
    name ***REMOVED*** 'default';
    canHandle(file, conflict) {
        return true; // Always matches as fallback
    }
    resolve(file, conflict, lines) {
        // Default: keep "ours" version
        return {
            content: conflict.ours,
            changes: ['kept ours (default strategy)'],
        };
    }
}
//# sourceMappingURL***REMOVED***default.js.map