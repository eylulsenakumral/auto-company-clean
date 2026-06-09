import { Strategy, ConflictMarker } from '../types.js';
export declare class PackageJsonStrategy implements Strategy {
    name: string;
    canHandle(file: string, _conflict: ConflictMarker): boolean;
    resolve(file: string, conflict: ConflictMarker, lines: string[]): {
        content: string;
        changes: string[];
    };
    private selectVersion;
}
//# sourceMappingURL***REMOVED***package-json.d.ts.map