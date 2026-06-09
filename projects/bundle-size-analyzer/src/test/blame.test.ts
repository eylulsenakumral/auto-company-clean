import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { analyzeBlame } from '../blame.js';

const testDir ***REMOVED*** '/tmp/bundle-analyzer-blame-test';

describe('Blame', () ***REMOVED***> {
  beforeEach(() ***REMOVED***> {
    try {
      mkdirSync(testDir, { recursive: true });
    } catch (e) {
      // Directory exists
    }
  });

  it('should return package blame list', () ***REMOVED***> {
    const bundlePath ***REMOVED*** join(testDir, 'blame-test.js');
    writeFileSync(bundlePath, 'x'.repeat(100000));

    const result ***REMOVED*** analyzeBlame(bundlePath);

    assert.ok(Array.isArray(result));
    assert.ok(result.length > 0);
  });

  it('should include package names', () ***REMOVED***> {
    const bundlePath ***REMOVED*** join(testDir, 'packages.js');
    writeFileSync(bundlePath, 'x'.repeat(50000));

    const result ***REMOVED*** analyzeBlame(bundlePath);

    result.forEach((blame) ***REMOVED***> {
      assert.ok(typeof blame.packageName ***REMOVED******REMOVED******REMOVED*** 'string');
      assert.ok(blame.packageName.length > 0);
    });
  });

  it('should include sizes and percentages', () ***REMOVED***> {
    const bundlePath ***REMOVED*** join(testDir, 'sizes.js');
    writeFileSync(bundlePath, 'x'.repeat(75000));

    const result ***REMOVED*** analyzeBlame(bundlePath);

    result.forEach((blame) ***REMOVED***> {
      assert.ok(blame.size >***REMOVED*** 0);
      assert.ok(blame.percentage >***REMOVED*** 0);
      assert.ok(blame.percentage <***REMOVED*** 100);
    });
  });

  it('should be sorted by size descending', () ***REMOVED***> {
    const bundlePath ***REMOVED*** join(testDir, 'sorted.js');
    writeFileSync(bundlePath, 'x'.repeat(100000));

    const result ***REMOVED*** analyzeBlame(bundlePath);

    for (let i ***REMOVED*** 1; i < result.length; i++) {
      assert.ok(result[i - 1].size >***REMOVED*** result[i].size);
    }
  });
});
