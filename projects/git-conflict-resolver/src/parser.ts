import { ConflictMarker } from './types.js';

const MARKER_START ***REMOVED*** '<<<<<<<';
const MARKER_MID ***REMOVED*** '***REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED***';
const MARKER_END ***REMOVED*** '>>>>>>>';

export function detectConflictMarkers(content: string): boolean {
  return content.includes(MARKER_START) && content.includes(MARKER_MID) && content.includes(MARKER_END);
}

export function findConflicts(content: string): ConflictMarker[] {
  const lines ***REMOVED*** content.split('\n');
  const conflicts: ConflictMarker[] ***REMOVED*** [];
  let start ***REMOVED*** -1;
  let mid ***REMOVED*** -1;

  for (let i ***REMOVED*** 0; i < lines.length; i++) {
    const line ***REMOVED*** lines[i];

    if (line.startsWith(MARKER_START)) {
      start ***REMOVED*** i;
    } else if (line.startsWith(MARKER_MID) && start >***REMOVED*** 0) {
      mid ***REMOVED*** i;
    } else if (line.startsWith(MARKER_END) && start >***REMOVED*** 0 && mid >***REMOVED*** 0) {
      conflicts.push({
        start,
        mid,
        end: i,
        ours: lines.slice(start + 1, mid).join('\n'),
        theirs: lines.slice(mid + 1, i).join('\n'),
      });
      start ***REMOVED*** -1;
      mid ***REMOVED*** -1;
    }
  }

  return conflicts;
}

export function applyResolution(content: string, conflict: ConflictMarker, resolution: string): string {
  const lines ***REMOVED*** content.split('\n');
  const before ***REMOVED*** lines.slice(0, conflict.start);
  const after ***REMOVED*** lines.slice(conflict.end + 1);
  const resolutionLines ***REMOVED*** resolution.split('\n');

  return [...before, ...resolutionLines, ...after].join('\n');
}

export function getFileType(filename: string): string {
  const ext ***REMOVED*** filename.split('.').pop()?.toLowerCase() || '';

  const typeMap: Record<string, string> ***REMOVED*** {
    'json': 'package.json',
    'js': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'jsx': 'javascript',
    'py': 'python',
    'go': 'go',
    'rs': 'rust',
    'java': 'java',
    'c': 'c',
    'cpp': 'cpp',
    'h': 'c',
    'hpp': 'cpp',
    'cs': 'csharp',
    'php': 'php',
    'rb': 'ruby',
    'sh': 'shell',
    'yaml': 'yaml',
    'yml': 'yaml',
    'xml': 'xml',
    'md': 'markdown',
    'txt': 'text',
    'css': 'css',
    'scss': 'css',
    'less': 'css',
    'html': 'html',
    'htm': 'html',
  };

  if (filename.endsWith('package.json')) return 'package.json';
  if (filename.includes('config') || filename.endsWith('.config.js') || filename.endsWith('.config.ts')) {
    return 'config';
  }
  if (filename.endsWith('.test.js') || filename.endsWith('.test.ts') ||
      filename.endsWith('.spec.js') || filename.endsWith('.spec.ts')) {
    return 'test';
  }

  return typeMap[ext] || 'text';
}
