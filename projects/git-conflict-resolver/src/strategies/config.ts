import { Strategy, ConflictMarker } from '../types.js';

export class ConfigStrategy implements Strategy {
  name ***REMOVED*** 'config';

  canHandle(file: string, _conflict: ConflictMarker): boolean {
    return file.includes('config') ||
           file.endsWith('.config.js') ||
           file.endsWith('.config.ts') ||
           file.endsWith('.config.json') ||
           ['tsconfig.json', 'eslintrc', 'prettierrc', '.babelrc'].some(n ***REMOVED***> file.endsWith(n));
  }

  resolve(file: string, conflict: ConflictMarker, lines: string[]): { content: string; changes: string[] } {
    const changes: string[] ***REMOVED*** [];

    try {
      const ours ***REMOVED*** JSON.parse(conflict.ours);
      const theirs ***REMOVED*** JSON.parse(conflict.theirs);
      const merged ***REMOVED*** { ...ours };

      // Key-value merge: ours wins on conflicts
      for (const [key, value] of Object.entries(theirs)) {
        if (!(key in merged)) {
          merged[key] ***REMOVED*** value;
          changes.push(`+ ${key}`);
        }
      }

      const resolved ***REMOVED*** JSON.stringify(merged, null, 2);
      return { content: resolved, changes };
    } catch {
      // Not valid JSON - try line-by-line merge
      return this.mergeLines(conflict.ours, conflict.theirs);
    }
  }

  private mergeLines(ours: string, theirs: string): { content: string; changes: string[] } {
    const ourLines ***REMOVED*** ours.split('\n').filter(Boolean);
    const theirLines ***REMOVED*** theirs.split('\n').filter(Boolean);
    const changes: string[] ***REMOVED*** [];
    const merged ***REMOVED*** new Set<string>();

    // Add all our lines
    for (const line of ourLines) {
      const key ***REMOVED*** this.extractKey(line);
      if (key) merged.add(key);
    }

    // Add their keys that we don't have
    for (const line of theirLines) {
      const key ***REMOVED*** this.extractKey(line);
      if (key && !merged.has(key)) {
        merged.add(key);
        changes.push(`+ ${key}`);
      }
    }

    // Rebuild with ours first, then new theirs
    const result ***REMOVED*** [...ourLines];
    for (const line of theirLines) {
      const key ***REMOVED*** this.extractKey(line);
      if (key && !merged.has(key)) {
        result.push(line);
      }
    }

    return { content: result.join('\n'), changes };
  }

  private extractKey(line: string): string | null {
    const match ***REMOVED*** line.match(/^(\w+):/);
    return match ? match[1] : null;
  }
}
