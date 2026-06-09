import { Strategy, ConflictMarker } from '../types.js';
export declare class ImportsStrategy implements Strategy {
    name: string;
    canHandle(file: string, conflict: ConflictMarker): boolean;
    resolve(file: string, conflict: ConflictMarker, lines: string[]): {
        content: string;
        changes: string[];
    };
    private extractImports;
    private extractModule;
}
//# sourceMappingURL***REMOVED***imports.d.ts.map