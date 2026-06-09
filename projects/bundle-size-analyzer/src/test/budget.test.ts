import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { checkBudget } from '../budget.js';

const testDir ***REMOVED*** '/tmp/bundle-analyzer-budget-test';

describe('Budget', () ***REMOVED***> {
  beforeEach(() ***REMOVED***> {
    try {
      mkdirSync(testDir, { recursive: true });
    } catch (e) {
      // Directory exists
    }
  });

  it('should pass when bundle is within budget', () ***REMOVED***> {
    const bundlePath ***REMOVED*** join(testDir, 'small.js');
    writeFileSync(bundlePath, 'x'.repeat(100000)); // 100KB

    const result ***REMOVED*** checkBudget(bundlePath, 200000); // 200KB budget

    assert.strictEqual(result.withinBudget, true);
    assert.strictEqual(result.budget, 200000);
    assert.ok(result.totalSize > 0);
  });

  it('should fail when bundle exceeds budget', () ***REMOVED***> {
    const bundlePath ***REMOVED*** join(testDir, 'large.js');
    writeFileSync(bundlePath, 'x'.repeat(300000)); // 300KB

    const result ***REMOVED*** checkBudget(bundlePath, 200000); // 200KB budget

    assert.strictEqual(result.withinBudget, false);
    assert.ok(result.overage > 0);
    assert.ok(result.overagePercentage > 0);
  });

  it('should calculate overage correctly', () ***REMOVED***> {
    const bundlePath ***REMOVED*** join(testDir, 'over.js');
    writeFileSync(bundlePath, 'x'.repeat(300000)); // 300KB

    const result ***REMOVED*** checkBudget(bundlePath, 200000); // 200KB budget

    assert.ok(result.overage >***REMOVED*** 95000); // Approximately 100KB over
    assert.ok(result.overagePercentage > 45);
  });

  it('should set overage to 0 when within budget', () ***REMOVED***> {
    const bundlePath ***REMOVED*** join(testDir, 'under.js');
    writeFileSync(bundlePath, 'x'.repeat(100000));

    const result ***REMOVED*** checkBudget(bundlePath, 200000);

    assert.strictEqual(result.overage, 0);
    assert.strictEqual(result.overagePercentage, 0);
  });
});
