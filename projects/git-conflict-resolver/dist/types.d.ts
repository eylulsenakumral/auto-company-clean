export interface ConflictMarker {
    start: number;
    mid: number;
    end: number;
    ours: string;
    theirs: string;
}
export interface ResolveResult {
    file: string;
    strategy: string;
    resolved: boolean;
    changes: string[];
    preview: string;
}
export interface ResolveOptions {
    preview: boolean;
    force: boolean;
    verbose: boolean;
}
export interface Strategy {
    name: string;
    canHandle: (file: string, conflict: ConflictMarker) ***REMOVED***> boolean;
    resolve: (file: string, conflict: ConflictMarker, lines: string[]) ***REMOVED***> {
        content: string;
        changes: string[];
    };
}
//# sourceMappingURL***REMOVED***types.d.ts.map