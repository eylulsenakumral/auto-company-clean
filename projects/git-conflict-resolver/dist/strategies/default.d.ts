import { Strategy, ConflictMarker } from '../types.js';
export declare class DefaultStrategy implements Strategy {
    name: string;
    canHandle(file: string, conflict: ConflictMarker): boolean;
    resolve(file: string, conflict: ConflictMarker, lines: string[]): {
        content: string;
        changes: string[];
    };
}
//# sourceMappingURL***REMOVED***default.d.ts.map