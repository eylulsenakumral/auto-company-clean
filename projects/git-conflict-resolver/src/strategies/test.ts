import { Strategy, ConflictMarker } from '../types.js';

export class TestStrategy implements Strategy {
  name ***REMOVED*** 'test';

  canHandle(file: string, _conflict: ConflictMarker): boolean {
    return file.endsWith('.test.js') ||
           file.endsWith('.test.ts') ||
           file.endsWith('.test.jsx') ||
           file.endsWith('.test.tsx') ||
           file.endsWith('.spec.js') ||
           file.endsWith('.spec.ts') ||
           file.endsWith('.spec.jsx') ||
           file.endsWith('.spec.tsx');
  }

  resolve(file: string, conflict: ConflictMarker, lines: string[]): { content: string; changes: string[] } {
    const changes: string[] ***REMOVED*** [];

    // Extract test blocks from both sides
    const ourTests ***REMOVED*** this.extractTestBlocks(conflict.ours);
    const theirTests ***REMOVED*** this.extractTestBlocks(conflict.theirs);

    // Keep both test blocks
    const merged ***REMOVED*** [...ourTests];

    for (const test of theirTests) {
      const ourTestName ***REMOVED*** this.extractTestName(test);
      const exists ***REMOVED*** ourTests.some(t ***REMOVED***> this.extractTestName(t) ***REMOVED******REMOVED******REMOVED*** ourTestName);

      if (!exists || !ourTestName) {
        merged.push(test);
        if (ourTestName) changes.push(`+ test: ${ourTestName}`);
      } else {
        changes.push(`~ test: ${ourTestName} (kept ours)`);
      }
    }

    const resolved ***REMOVED*** merged.join('\n\n');
    return { content: resolved, changes };
  }

  private extractTestBlocks(content: string): string[] {
    const blocks: string[] ***REMOVED*** [];
    const lines ***REMOVED*** content.split('\n');
    let current: string[] ***REMOVED*** [];
    let depth ***REMOVED*** 0;

    for (const line of lines) {
      const isTestStart ***REMOVED*** /^(test|it|describe)\s*\(/.test(line);
      const isFunctionStart ***REMOVED*** line.includes('{') || line.includes('***REMOVED***>');
      const isFunctionEnd ***REMOVED*** line.includes('}') && !line.includes('{');

      if (isTestStart) {
        if (current.length > 0) {
          blocks.push(current.join('\n'));
        }
        current ***REMOVED*** [line];
        depth +***REMOVED*** (line.match(/\{/g) || []).length;
        depth -***REMOVED*** (line.match(/\}/g) || []).length;
      } else if (current.length > 0) {
        current.push(line);
        depth +***REMOVED*** (line.match(/\{/g) || []).length;
        depth -***REMOVED*** (line.match(/\}/g) || []).length;

        if (depth <***REMOVED*** 0 && isFunctionEnd) {
          blocks.push(current.join('\n'));
          current ***REMOVED*** [];
        }
      }
    }

    if (current.length > 0) {
      blocks.push(current.join('\n'));
    }

    return blocks;
  }

  private extractTestName(block: string): string {
    const match ***REMOVED*** block.match(/(?:test|it|describe)\s*\(\s*['"](.+?)['"]/);
    return match ? match[1] : '';
  }
}
