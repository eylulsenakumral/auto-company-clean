/**
 * Tests for config module
 */

import { describe, it } from 'node:test';
import { writeFile, mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import assert from 'node:assert';
import { loadConfig, mergeConfig, validateConfig } from '../dist/config.js';
import type { FlakyConfig } from '../dist/types.js';

describe('loadConfig', () ***REMOVED***> {
  it('should return default config when no file exists', async () ***REMOVED***> {
    const config ***REMOVED*** await loadConfig('/nonexistent/path');
    assert.equal(config.iterations, 10);
    assert.equal(config.threshold, 30);
    assert.equal(config.testCommand, 'npm test');
  });

  it('should merge user config with defaults', async () ***REMOVED***> {
    const testDir ***REMOVED*** '/tmp/flaky-test-config-test';
    await mkdir(testDir, { recursive: true });
    const configPath ***REMOVED*** join(testDir, '.flakyrc');

    try {
      await writeFile(configPath, JSON.stringify({ iterations: 20, threshold: 50 }));

      const config ***REMOVED*** await loadConfig(testDir);

      assert.equal(config.iterations, 20);
      assert.equal(config.threshold, 50);
      assert.equal(config.testCommand, 'npm test'); // default
    } finally {
      await rm(testDir, { recursive: true, force: true });
    }
  });
});

describe('mergeConfig', () ***REMOVED***> {
  it('should merge overrides into base config', () ***REMOVED***> {
    const base: FlakyConfig ***REMOVED*** {
      iterations: 10,
      threshold: 30,
      testCommand: 'npm test',
      runner: 'jest',
      verbose: false,
      timeout: 60000,
    };

    const merged ***REMOVED*** mergeConfig(base, { iterations: 20, threshold: 50 });

    assert.equal(merged.iterations, 20);
    assert.equal(merged.threshold, 50);
    assert.equal(merged.testCommand, 'npm test');
  });
});

describe('validateConfig', () ***REMOVED***> {
  it('should accept valid config', () ***REMOVED***> {
    const config: FlakyConfig ***REMOVED*** {
      iterations: 10,
      threshold: 30,
      testCommand: 'npm test',
      runner: 'jest',
    };

    assert.doesNotThrow(() ***REMOVED***> validateConfig(config));
  });

  it('should reject iterations < 1', () ***REMOVED***> {
    const config: FlakyConfig ***REMOVED*** {
      iterations: 0,
      threshold: 30,
      testCommand: 'npm test',
      runner: 'jest',
    };

    assert.throws(() ***REMOVED***> validateConfig(config), /iterations must be at least 1/);
  });

  it('should reject iterations > 100', () ***REMOVED***> {
    const config: FlakyConfig ***REMOVED*** {
      iterations: 101,
      threshold: 30,
      testCommand: 'npm test',
      runner: 'jest',
    };

    assert.throws(() ***REMOVED***> validateConfig(config), /iterations cannot exceed 100/);
  });

  it('should reject threshold < 0', () ***REMOVED***> {
    const config: FlakyConfig ***REMOVED*** {
      iterations: 10,
      threshold: -1,
      testCommand: 'npm test',
      runner: 'jest',
    };

    assert.throws(() ***REMOVED***> validateConfig(config), /threshold must be between 0 and 100/);
  });

  it('should reject threshold > 100', () ***REMOVED***> {
    const config: FlakyConfig ***REMOVED*** {
      iterations: 10,
      threshold: 101,
      testCommand: 'npm test',
      runner: 'jest',
    };

    assert.throws(() ***REMOVED***> validateConfig(config), /threshold must be between 0 and 100/);
  });

  it('should reject empty test command', () ***REMOVED***> {
    const config: FlakyConfig ***REMOVED*** {
      iterations: 10,
      threshold: 30,
      testCommand: '',
      runner: 'jest',
    };

    assert.throws(() ***REMOVED***> validateConfig(config), /testCommand is required/);
  });
});
