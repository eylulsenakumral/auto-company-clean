import { analyzeFile, checkFile } from '../analyzer.js';
import * as path from 'path';
import * as fs from 'fs';

const fixturesDir = path.join(__dirname, 'fixtures');

describe('analyzeFile', () => {
  describe('with AI-generated sample', () => {
    const aiSamplePath = path.join(fixturesDir, 'ai-generated-sample.js');

    test('should detect AI-generated patterns', () => {
      const result = analyzeFile(aiSamplePath);

      expect(result).toBeDefined();
      expect(result.filePath).toBe(aiSamplePath);
      expect(result.score).toBeGreaterThan(0);
      expect(result.indicators.length).toBeGreaterThan(0);
    });

    test('should detect generic comments', () => {
      const result = analyzeFile(aiSamplePath);

      const genericCommentIndicator = result.indicators.find(
        i => i.type === 'generic-comments' || i.type === 'low-entropy-comments'
      );
      expect(genericCommentIndicator).toBeDefined();
    });

    test('should detect inconsistent naming', () => {
      const result = analyzeFile(aiSamplePath);

      const namingIndicator = result.indicators.find(
        i => i.type === 'generic-identifiers'
      );
      expect(namingIndicator).toBeDefined();
    });
  });

  describe('with human-written sample', () => {
    const humanSamplePath = path.join(fixturesDir, 'human-written-sample.js');

    test('should have lower slop score', () => {
      const aiResult = analyzeFile(path.join(fixturesDir, 'ai-generated-sample.js'));
      const humanResult = analyzeFile(humanSamplePath);

      expect(humanResult.score).toBeLessThan(aiResult.score);
    });

    test('should have fewer indicators', () => {
      const aiResult = analyzeFile(path.join(fixturesDir, 'ai-generated-sample.js'));
      const humanResult = analyzeFile(humanSamplePath);

      expect(humanResult.indicators.length).toBeLessThanOrEqual(aiResult.indicators.length);
    });
  });

  describe('error handling', () => {
    test('should throw error for non-existent file', () => {
      expect(() => analyzeFile('/non/existent/file.js')).toThrow();
    });
  });
});

describe('checkFile', () => {
  const aiSamplePath = path.join(fixturesDir, 'ai-generated-sample.js');
  const humanSamplePath = path.join(fixturesDir, 'human-written-sample.js');

  test('should return true for AI-generated file with default threshold', () => {
    const result = checkFile(aiSamplePath, 30);
    expect(result).toBe(true);
  });

  test('should return false for clean human-written file', () => {
    const result = checkFile(humanSamplePath, 30);
    expect(result).toBe(false);
  });

  test('should respect threshold parameter', () => {
    const result1 = checkFile(aiSamplePath, 0);
    const result2 = checkFile(aiSamplePath, 100);

    expect(result1).toBe(true);
    expect(result2).toBe(false);
  });
});
