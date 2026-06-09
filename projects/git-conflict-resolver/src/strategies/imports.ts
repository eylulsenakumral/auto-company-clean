import { Strategy, ConflictMarker } from '../types.js';

const IMPORT_PATTERNS ***REMOVED*** [
  /^\s*import\s+.*from\s+['"](.+)['"]/,
  /^\s*import\s+\{.*\}\s+from\s+['"](.+)['"]/,
  /^\s*import\s+['"](.+)['"]/,
  /^\s*const\s+.****REMOVED***\s*require\(['"](.+)['"]\)/,
  /^\s*var\s+.****REMOVED***\s*require\(['"](.+)['"]\)/,
  /^\s*let\s+.****REMOVED***\s*require\(['"](.+)['"]\)/,
];

export class ImportsStrategy implements Strategy {
  name ***REMOVED*** 'imports';

  canHandle(file: string, conflict: ConflictMarker): boolean {
    // Check for JS/TS files
    const ext ***REMOVED*** file.split('.').pop()?.toLowerCase();
    if (!['js', 'ts', 'jsx', 'tsx', 'mjs', 'cjs'].includes(ext || '')) {
      return false;
    }

    // Check if conflict contains imports
    return this.extractImports(conflict.ours).length > 0 ||
           this.extractImports(conflict.theirs).length > 0;
  }

  resolve(file: string, conflict: ConflictMarker, lines: string[]): { content: string; changes: string[] } {
    const ourImports ***REMOVED*** this.extractImports(conflict.ours);
    const theirImports ***REMOVED*** this.extractImports(conflict.theirs);
    const changes: string[] ***REMOVED*** [];

    // Merge imports - dedupe by module name
    const merged ***REMOVED*** new Map<string, string>();

    for (const imp of ourImports) {
      const module ***REMOVED*** this.extractModule(imp);
      if (module) merged.set(module, imp);
    }

    for (const imp of theirImports) {
      const module ***REMOVED*** this.extractModule(imp);
      if (module && !merged.has(module)) {
        merged.set(module, imp);
        changes.push(`+ ${module}`);
      }
    }

    const resolved ***REMOVED*** Array.from(merged.values()).join('\n');
    return { content: resolved, changes };
  }

  private extractImports(content: string): string[] {
    const lines ***REMOVED*** content.split('\n').filter(Boolean);
    return lines.filter(line ***REMOVED***> {
      return IMPORT_PATTERNS.some(pattern ***REMOVED***> pattern.test(line));
    });
  }

  private extractModule(importLine: string): string | null {
    for (const pattern of IMPORT_PATTERNS) {
      const match ***REMOVED*** importLine.match(pattern);
      if (match) return match[1];
    }
    return null;
  }
}
