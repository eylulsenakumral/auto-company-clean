import { Strategy, ConflictMarker } from '../types.js';
export declare class ConfigStrategy implements Strategy {
    name: string;
    canHandle(file: string, _conflict: ConflictMarker): boolean;
    resolve(file: string, conflict: ConflictMarker, lines: string[]): {
        content: string;
        changes: string[];
    };
    private mergeLines;
    private extractKey;
}
//# sourceMappingURL***REMOVED***config.d.ts.map