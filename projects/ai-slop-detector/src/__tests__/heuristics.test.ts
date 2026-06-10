import {
  calculateEntropy,
  analyzeComments,
  analyzeNaming,
  analyzeStructure,
  analyzeCommentRatio
} from '../utils/heuristics.js';

describe('calculateEntropy', () => {
  test('should return 0 for empty string', () => {
    expect(calculateEntropy('')).toBe(0);
  });

  test('should return 0 for single character', () => {
    expect(calculateEntropy('a')).toBe(0);
  });

  test('should calculate entropy for repetitive string', () => {
    const entropy = calculateEntropy('aaaa');
    expect(entropy).toBe(0);
  });

  test('should calculate entropy for diverse string', () => {
    const entropy = calculateEntropy('abc');
    expect(entropy).toBeGreaterThan(0);
    expect(entropy).toBeLessThanOrEqual(Math.log2(3));
  });

  test('should have higher entropy for more diverse strings', () => {
    const e1 = calculateEntropy('aa');
    const e2 = calculateEntropy('ab');
    expect(e2).toBeGreaterThan(e1);
  });
});

describe('analyzeComments', () => {
  test('should detect generic TODO comments', () => {
    const code = `
// TODO: Implement this
// FIXME: Fix that
// NOTE: Remember this
`;
    const indicators = analyzeComments(code);
    expect(indicators.length).toBeGreaterThan(0);
  });

  test('should detect low-entropy comments', () => {
    const code = `
// This is a comment
// This is another comment
// This handles data
// This processes data
`.repeat(5);
    const indicators = analyzeComments(code);
    const lowEntropy = indicators.find(i => i.type === 'low-entropy-comments');
    expect(lowEntropy).toBeDefined();
  });

  test('should return empty array for code without comments', () => {
    const code = 'function test() { return 42; }';
    const indicators = analyzeComments(code);
    expect(indicators).toEqual([]);
  });
});

describe('analyzeNaming', () => {
  test('should detect generic identifiers', () => {
    const code = `
const myData = processItem(tempValue);
const result = handleData();
const helper1 = () => {};
const util2 = () => {};
`;
    const indicators = analyzeNaming(code, 'javascript');
    expect(indicators.length).toBeGreaterThan(0);
  });

  test('should detect inconsistent naming patterns', () => {
    const code = `
const myVariable = 1;
const another_variable = 2;
const ThirdVariable = 3;
`;
    const indicators = analyzeNaming(code, 'javascript');
    const inconsistent = indicators.find(i => i.type === 'inconsistent-naming');
    expect(inconsistent).toBeDefined();
  });

  test('should not flag consistent naming', () => {
    const code = `
const userName = 'test';
const userEmail = 'test@example.com';
const userAge = 25;
`;
    const indicators = analyzeNaming(code, 'javascript');
    expect(indicators.length).toBe(0);
  });
});

describe('analyzeStructure', () => {
  test('should detect uniform line lengths', () => {
    const lines = Array(30).fill('const x = 123456789012;').join('\n');
    const indicators = analyzeStructure(lines, 'javascript');
    const uniform = indicators.find(i => i.type === 'uniform-formatting');
    expect(uniform).toBeDefined();
  });

  test('should detect repeated patterns', () => {
    const pattern = 'if (condition) {\n  return value;\n}';
    const code = pattern.repeat(10);
    const indicators = analyzeStructure(code, 'javascript');
    const repeated = indicators.find(i => i.type === 'repeated-patterns');
    expect(repeated).toBeDefined();
  });

  test('should detect excessive empty lines', () => {
    const code = '\n'.repeat(20) + 'const x = 1;' + '\n'.repeat(20);
    const indicators = analyzeStructure(code, 'javascript');
    const spacing = indicators.find(i => i.type === 'excessive-spacing');
    expect(spacing).toBeDefined();
  });
});

describe('analyzeCommentRatio', () => {
  test('should detect high comment ratio', () => {
    const code = `
// Comment 1
// Comment 2
// Comment 3
// Comment 4
const x = 1;
`.repeat(10);
    const indicators = analyzeCommentRatio(code);
    const highRatio = indicators.find(i => i.type === 'high-comment-ratio');
    expect(highRatio).toBeDefined();
  });

  test('should detect very low comment ratio', () => {
    const code = Array(100).fill('const x' + Math.random() + ' = ' + Math.random() + ';').join('\n');
    const indicators = analyzeCommentRatio(code);
    const lowRatio = indicators.find(i => i.type === 'low-comment-ratio');
    expect(lowRatio).toBeDefined();
  });

  test('should not flag balanced comment ratio', () => {
    const code = `
// Valid comment
const x = 1;
const y = 2;
const z = 3;
const w = 4;
`.repeat(5);
    const indicators = analyzeCommentRatio(code);
    expect(indicators.length).toBe(0);
  });
});
