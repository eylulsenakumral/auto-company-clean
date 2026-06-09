import { ConflictMarker } from './types.js';
export declare function detectConflictMarkers(content: string): boolean;
export declare function findConflicts(content: string): ConflictMarker[];
export declare function applyResolution(content: string, conflict: ConflictMarker, resolution: string): string;
export declare function getFileType(filename: string): string;
//# sourceMappingURL***REMOVED***parser.d.ts.map