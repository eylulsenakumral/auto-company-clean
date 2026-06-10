import * as fs from 'fs';
import { CodeMetrics, NamingMetrics, Indicator } from '../types/index.js';

/**
 * Calculate Shannon entropy of a string
 * Lower entropy = more repetitive/predictable content
 */
export function calculateEntropy(text: string): number {
  if (!text || text.length === 0) return 0;

  const charCounts = new Map<string, number>();
  for (const char of text) {
    charCounts.set(char, (charCounts.get(char) || 0) + 1);
  }

  let entropy = 0;
  const len = text.length;
  for (const count of charCounts.values()) {
    const p = count / len;
    entropy -= p * Math.log2(p);
  }

  return entropy;
}

/**
 * Analyze comment patterns for AI-generated characteristics
 */
export function analyzeComments(content: string): Indicator[] {
  const indicators: Indicator[] = [];
  const lines = content.split('\n');

  // Extract comments (simple regex for //, /*, #, <!--)
  const commentRegex = /(\/\/.*|\/\*[\s\S]*?\*\/|#.*|<!--[\s\S]*?-->)/g;
  const comments = content.match(commentRegex) || [];

  if (comments.length === 0) {
    return indicators;
  }

  // Generic AI comment patterns
  const genericPatterns = [
    /^(\/\/|#)\s*(TODO|FIXME|NOTE|HACK|XXX):/i,
    /^(\/\/|#)\s*(implement|handle|add|create|update|delete|get|set)\s+\w+/i,
    /^(\/\/|#)\s*(this|this function|this method|this code)\s+(will|should|is used to)\s/i,
    /^(\/\/|#)\s*(please|kindly)\s/i,
    /^(\/\/\s*){3,}$/, // Triple slashes often auto-generated
    /^\s*\/\*\*[\s\S]*?\*\/\s*(public|private|protected|async|function|class)\s/, // JSDoc before every declaration
  ];

  let genericCount = 0;
  const lowEntropyComments: string[] = [];

  for (const comment of comments) {
    const trimmed = comment.trim();

    // Check for generic patterns
    for (const pattern of genericPatterns) {
      if (pattern.test(trimmed)) {
        genericCount++;
        break;
      }
    }

    // Check comment entropy (AI comments are often low entropy)
    const entropy = calculateEntropy(trimmed.replace(/\/\/|\/\*|\*\/|#|<!--|-->|@/g, '').trim());
    if (entropy < 3.6 && trimmed.length > 10) {
      lowEntropyComments.push(trimmed);
    }
  }

  if (genericCount > comments.length * 0.4) {
    indicators.push({
      type: 'generic-comments',
      description: `High proportion of generic comment patterns (${genericCount}/${comments.length})`,
      severity: 'medium',
      evidence: `Found ${genericCount} comments matching generic AI patterns`
    });
  }

  if (lowEntropyComments.length > comments.length * 0.5) {
    indicators.push({
      type: 'low-entropy-comments',
      description: 'Many comments have low entropy (repetitive/predictable)',
      severity: 'medium',
      evidence: `${lowEntropyComments.length} comments with entropy < 2.5`
    });
  }

  return indicators;
}

/**
 * Analyze naming consistency
 */
export function analyzeNaming(content: string, language: string): Indicator[] {
  const indicators: Indicator[] = [];

  // Extract identifiers based on language
  let identifierRegex: RegExp;
  if (language === 'javascript' || language === 'typescript') {
    identifierRegex = /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\b/g;
  } else if (language === 'python') {
    identifierRegex = /\b([a-zA-Z_][a-zA-Z0-9_]*)\b/g;
  } else {
    return indicators;
  }

  const matches = content.match(identifierRegex) || [];
  const identifiers = new Set(matches);

  // Skip keywords
  const keywords = new Set([
    'if', 'else', 'for', 'while', 'function', 'return', 'const', 'let', 'var',
    'class', 'import', 'export', 'from', 'default', 'async', 'await', 'try',
    'catch', 'finally', 'throw', 'new', 'this', 'super', 'extends', 'typeof',
    'def', 'class', 'if', 'else', 'elif', 'for', 'while', 'return', 'import',
    'from', 'as', 'try', 'except', 'finally', 'raise', 'with', 'True', 'False',
    'None', 'and', 'or', 'not', 'in', 'is', 'lambda', 'yield'
  ]);

  const names = Array.from(identifiers).filter(n => !keywords.has(n) && n.length > 2);

  // Analyze patterns
  const camelCase = names.filter(n => /^[a-z][a-zA-Z0-9]*$/.test(n));
  const snakeCase = names.filter(n => /^[a-z][a-z0-9_]*$/.test(n) && n.includes('_'));
  const pascalCase = names.filter(n => /^[A-Z][a-zA-Z0-9]*$/.test(n));

  // Generic AI-generated names
  const genericPatterns = [
    /^(my|temp|tmp|data|item|value|result|output|input|param|arg)(\d*)$/,
    /^(do|handle|process|get|set|create|update|delete)\w+$/,
    /^(helper|util|function|method|class)\d*$/,
  ];

  const genericNames = names.filter(n => genericPatterns.some(p => p.test(n)));

  // Check for inconsistency
  const patterns = [
    { name: 'camelCase', count: camelCase.length },
    { name: 'snake_case', count: snakeCase.length },
    { name: 'PascalCase', count: pascalCase.length }
  ].filter(p => p.count > 0);

  if (patterns.length > 1) {
    const dominant = Math.max(...patterns.map(p => p.count));
    const total = names.length;
    const consistency = dominant / total;

    if (consistency < 0.7 && total > 2) {
      indicators.push({
        type: 'inconsistent-naming',
        description: 'Multiple naming conventions detected without clear dominance',
        severity: 'low',
        evidence: patterns.map(p => `${p.name}: ${p.count}`).join(', ')
      });
    }
  }

  if (genericNames.length > names.length * 0.10) {
    indicators.push({
      type: 'generic-identifiers',
      description: 'High proportion of generic/generic identifiers',
      severity: 'medium',
      evidence: `Found ${genericNames.length} generic names out of ${names.length}`
    });
  }

  return indicators;
}

/**
 * Analyze code structure and patterns
 */
export function analyzeStructure(content: string, language: string): Indicator[] {
  const indicators: Indicator[] = [];
  const lines = content.split('\n');

  // Check for uniform line lengths (AI often generates consistent formatting)
  const lengths = lines.map(l => l.length).filter(l => l > 0);
  if (lengths.length > 20) {
    const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    const variance = lengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / lengths.length;
    const stdDev = Math.sqrt(variance);

    // Very low variance suggests auto-generated code
    if (stdDev < avgLength * 0.15) {
      indicators.push({
        type: 'uniform-formatting',
        description: 'Unusually uniform line lengths (possible auto-generation)',
        severity: 'low',
        evidence: `StdDev: ${stdDev.toFixed(1)}, Avg: ${avgLength.toFixed(1)}`
      });
    }
  }

  // Check for repeated patterns (AI often repeats structures)
  const lineChunks: string[] = [];
  for (let i = 0; i < lines.length - 2; i++) {
    lineChunks.push(lines[i] + lines[i + 1] + lines[i + 2]);
  }

  const chunkFreq = new Map<string, number>();
  for (const chunk of lineChunks) {
    const normalized = chunk.replace(/\s+/g, ' ').trim();
    if (normalized.length > 20) {
      chunkFreq.set(normalized, (chunkFreq.get(normalized) || 0) + 1);
    }
  }

  const repeats = Array.from(chunkFreq.values()).filter(c => c > 2);
  if (repeats.length > 1) {
    indicators.push({
      type: 'repeated-patterns',
      description: 'Multiple repeated code structures detected',
      severity: 'medium',
      evidence: `${repeats.length} patterns repeated 3+ times`
    });
  }

  // Check for excessive empty lines
  const emptyLines = lines.filter(l => l.trim() === '').length;
  const emptyRatio = emptyLines / lines.length;
  if (emptyRatio > 0.3) {
    indicators.push({
      type: 'excessive-spacing',
      description: 'Unusually high proportion of empty lines',
      severity: 'low',
      evidence: `${(emptyRatio * 100).toFixed(1)}% empty lines`
    });
  }

  return indicators;
}

/**
 * Analyze comment-to-code ratio
 */
export function analyzeCommentRatio(content: string): Indicator[] {
  const indicators: Indicator[] = [];
  const lines = content.split('\n');

  let codeLines = 0;
  let commentLines = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (/^(\/\/|#|\/\*|\*|<!--)/.test(trimmed)) {
      commentLines++;
    } else {
      codeLines++;
    }
  }

  const total = codeLines + commentLines;
  if (total === 0) return indicators;

  const ratio = commentLines / total;

  // AI often over-comments or under-comments consistently
  if (ratio > 0.4) {
    indicators.push({
      type: 'high-comment-ratio',
      description: 'Unusually high comment-to-code ratio',
      severity: 'low',
      evidence: `${(ratio * 100).toFixed(1)}% comments`
    });
  } else if (ratio < 0.05 && codeLines > 50) {
    indicators.push({
      type: 'low-comment-ratio',
      description: 'Very low comment-to-code ratio',
      severity: 'low',
      evidence: `${(ratio * 100).toFixed(1)}% comments`
    });
  }

  return indicators;
}

/**
 * Detect language from file extension
 */
export function detectLanguage(filePath: string): string {
  const ext = filePath.split('.').pop()?.toLowerCase();
  const langMap: Record<string, string> = {
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'py': 'python',
    'rb': 'ruby',
    'go': 'go',
    'rs': 'rust',
    'java': 'java',
    'c': 'c',
    'cpp': 'cpp',
    'cs': 'csharp',
    'php': 'php'
  };
  return langMap[ext || ''] || 'unknown';
}
