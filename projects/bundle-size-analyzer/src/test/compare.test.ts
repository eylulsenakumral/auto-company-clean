import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { compareBundles } from '../compare.js';

const testDir ***REMOVED*** '/tmp/bundle-analyzer-compare-test';

describe('Compare', () ***REMOVED***> {
  beforeEach(() ***REMOVED***> {
    try {
      mkdirSync(testDir, { recursive: true });
    } catch (e) {
      // Directory exists
    }
  });

  it('should compare two bundles', () ***REMOVED***> {
    const oldPath ***REMOVED*** join(testDir, 'old.js');
    const newPath ***REMOVED*** join(testDir, 'new.js');
    writeFileSync(oldPath, 'console.log("old");');
    writeFileSync(newPath, 'console.log("new");');

    const result ***REMOVED*** compareBundles(oldPath, newPath);

    assert.ok(typeof result.totalSizeDiff ***REMOVED******REMOVED******REMOVED*** 'number');
    assert.ok(Array.isArray(result.added));
    assert.ok(Array.isArray(result.removed));
    assert.ok(Array.isArray(result.changed));
  });

  it('should detect size regression', () ***REMOVED***> {
    const oldPath ***REMOVED*** join(testDir, 'small.js');
    const newPath ***REMOVED*** join(testDir, 'large.js');
    writeFileSync(oldPath, 'x'.repeat(100));
    writeFileSync(newPath, 'x'.repeat(2000));

    const result ***REMOVED*** compareBundles(oldPath, newPath);

    assert.ok(result.totalSizeDiff > 1000);
    assert.strictEqual(result.hasRegression, true);
  });

  it('should not flag small increases as regression', () ***REMOVED***> {
    const oldPath ***REMOVED*** join(testDir, 'tiny-old.js');
    const newPath ***REMOVED*** join(testDir, 'tiny-new.js');
    writeFileSync(oldPath, 'x'.repeat(1000));
    writeFileSync(newPath, 'x'.repeat(1050));

    const result ***REMOVED*** compareBundles(oldPath, newPath);

    assert.ok(result.totalSizeDiff < 1000);
    assert.strictEqual(result.hasRegression, false);
  });
});
