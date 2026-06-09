import { readFile } from 'fs/promises';
import { detectConflictMarkers, findConflicts, applyResolution, getFileType } from './parser.js';
import { findStrategy } from './strategies/index.js';
export async function resolveFile(filePath, options) {
    const content ***REMOVED*** await readFile(filePath, 'utf-8').catch(() ***REMOVED***> '');
    const changes ***REMOVED*** [];
    if (!detectConflictMarkers(content)) {
        return {
            file: filePath,
            strategy: 'none',
            resolved: false,
            changes: [],
            preview: content,
        };
    }
    const conflicts ***REMOVED*** findConflicts(content);
    const fileType ***REMOVED*** getFileType(filePath);
    let currentContent ***REMOVED*** content;
    for (const conflict of conflicts) {
        const strategy ***REMOVED*** findStrategy(filePath, conflict);
        if (options.verbose) {
            console.log(`  Strategy: ${strategy.name} for ${filePath}`);
        }
        const result ***REMOVED*** strategy.resolve(filePath, conflict, currentContent.split('\n'));
        currentContent ***REMOVED*** applyResolution(currentContent, conflict, result.content);
        changes.push(...result.changes);
    }
    return {
        file: filePath,
        strategy: fileType,
        resolved: conflicts.length > 0,
        changes,
        preview: currentContent,
    };
}
export async function resolveAll(files, options) {
    const results ***REMOVED*** [];
    for (const file of files) {
        const result ***REMOVED*** await resolveFile(file, options);
        results.push(result);
    }
    return results;
}
//# sourceMappingURL***REMOVED***resolver.js.map