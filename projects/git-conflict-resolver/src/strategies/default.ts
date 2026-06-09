import { Strategy, ConflictMarker } from '../types.js';

export class DefaultStrategy implements Strategy {
  name ***REMOVED*** 'default';

  canHandle(file: string, conflict: ConflictMarker): boolean {
    return true; // Always matches as fallback
  }

  resolve(file: string, conflict: ConflictMarker, lines: string[]): { content: string; changes: string[] } {
    // Default: keep "ours" version
    return {
      content: conflict.ours,
      changes: ['kept ours (default strategy)'],
    };
  }
}
