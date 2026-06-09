import { Strategy, ConflictMarker } from '../types.js';
export declare class TestStrategy implements Strategy {
    name: string;
    canHandle(file: string, _conflict: ConflictMarker): boolean;
    resolve(file: string, conflict: ConflictMarker, lines: string[]): {
        content: string;
        changes: string[];
    };
    private extractTestBlocks;
    private extractTestName;
}
//# sourceMappingURL***REMOVED***test.d.ts.map