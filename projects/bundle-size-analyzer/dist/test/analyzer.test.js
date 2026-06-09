import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { parseBundle, detectBundleFormat, formatBytes, getSizeCategory } from '../analyzer.js';
const testDir ***REMOVED*** '/tmp/bundle-analyzer-test';
describe('Analyzer', () ***REMOVED***> {
    beforeEach(() ***REMOVED***> {
        try {
            mkdirSync(testDir, { recursive: true });
        }
        catch (e) {
            // Directory exists
        }
    });
    it('detectBundleFormat should detect JS files', () ***REMOVED***> {
        assert.strictEqual(detectBundleFormat('bundle.js'), 'js');
        assert.strictEqual(detectBundleFormat('bundle.mjs'), 'js');
        assert.strictEqual(detectBundleFormat('bundle.cjs'), 'js');
    });
    it('detectBundleFormat should detect CSS files', () ***REMOVED***> {
        assert.strictEqual(detectBundleFormat('styles.css'), 'css');
    });
    it('detectBundleFormat should detect JSON files', () ***REMOVED***> {
        assert.strictEqual(detectBundleFormat('manifest.json'), 'json');
    });
    it('detectBundleFormat should throw for unsupported formats', () ***REMOVED***> {
        assert.throws(() ***REMOVED***> detectBundleFormat('bundle.txt'));
    });
    it('parseBundle should parse JS bundle', () ***REMOVED***> {
        const bundlePath ***REMOVED*** join(testDir, 'test.js');
        writeFileSync(bundlePath, 'console.log("test");');
        const result ***REMOVED*** parseBundle(bundlePath);
        assert.ok(result.totalSize > 0);
        assert.strictEqual(result.format, 'js');
        assert.ok(result.modules.length > 0);
    });
    it('parseBundle should parse CSS bundle', () ***REMOVED***> {
        const bundlePath ***REMOVED*** join(testDir, 'test.css');
        writeFileSync(bundlePath, '.test { color: red; }');
        const result ***REMOVED*** parseBundle(bundlePath);
        assert.ok(result.totalSize > 0);
        assert.strictEqual(result.format, 'css');
        assert.ok(result.modules.length > 0);
    });
    it('parseBundle should parse JSON bundle', () ***REMOVED***> {
        const bundlePath ***REMOVED*** join(testDir, 'test.json');
        writeFileSync(bundlePath, '{"key": "value"}');
        const result ***REMOVED*** parseBundle(bundlePath);
        assert.ok(result.totalSize > 0);
        assert.strictEqual(result.format, 'json');
        assert.ok(result.modules.length > 0);
    });
    it('modules should be sorted by size descending', () ***REMOVED***> {
        const bundlePath ***REMOVED*** join(testDir, 'sort-test.js');
        writeFileSync(bundlePath, 'x'.repeat(1000));
        const result ***REMOVED*** parseBundle(bundlePath);
        for (let i ***REMOVED*** 1; i < result.modules.length; i++) {
            assert.ok(result.modules[i - 1].size >***REMOVED*** result.modules[i].size);
        }
    });
    it('module percentages should sum to approximately 100', () ***REMOVED***> {
        const bundlePath ***REMOVED*** join(testDir, 'percent-test.js');
        writeFileSync(bundlePath, 'x'.repeat(500));
        const result ***REMOVED*** parseBundle(bundlePath);
        const totalPercentage ***REMOVED*** result.modules.reduce((sum, m) ***REMOVED***> sum + m.percentage, 0);
        assert.ok(totalPercentage > 99 && totalPercentage <***REMOVED*** 100.5);
    });
});
describe('formatBytes', () ***REMOVED***> {
    it('should format bytes', () ***REMOVED***> {
        assert.strictEqual(formatBytes(0), '0 B');
        assert.strictEqual(formatBytes(500), '500 B');
        assert.strictEqual(formatBytes(1024), '1 KB');
        assert.strictEqual(formatBytes(1536), '1.5 KB');
        assert.strictEqual(formatBytes(1048576), '1 MB');
        assert.strictEqual(formatBytes(1073741824), '1 GB');
    });
});
describe('getSizeCategory', () ***REMOVED***> {
    it('should return red for large modules', () ***REMOVED***> {
        assert.strictEqual(getSizeCategory(300, 1000), 'red');
    });
    it('should return yellow for medium modules', () ***REMOVED***> {
        assert.strictEqual(getSizeCategory(200, 1000), 'yellow');
    });
    it('should return green for small modules', () ***REMOVED***> {
        assert.strictEqual(getSizeCategory(100, 1000), 'green');
    });
});
