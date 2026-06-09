export declare function isGitRepo(): boolean;
export declare function hasConflicts(): boolean;
export declare function getConflictedFiles(): string[];
export declare function gitStash(message?: string): string | null;
export declare function gitStashPop(backupFile: string | null): void;
export declare function gitStashDrop(backupFile: string | null): void;
export declare function readFile(path: string): string;
export declare function writeFile(path: string, content: string): void;
export declare function gitAdd(path: string): void;
export declare function getGitRoot(): string;
//# sourceMappingURL***REMOVED***git.d.ts.map