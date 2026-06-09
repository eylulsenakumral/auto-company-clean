/**
 * Test runner abstraction layer
 */

import { spawn } from 'node:child_process';
import type { FlakyConfig, TestRunResult } from './types.js';

/**
 * Parse test output to extract individual test results
 * Supports Jest and Vitest output formats
 */
function parseTestOutput(stdout: string, stderr: string): Map<string, boolean> {
  const results ***REMOVED*** new Map<string, boolean>();
  const output ***REMOVED*** stdout + stderr;

  // Jest format: "PASS src/test.spec.ts" or "FAIL src/test.spec.ts"
  const jestPassMatches ***REMOVED*** output.matchAll(/PASS\s+(.+)/g);
  const jestFailMatches ***REMOVED*** output.matchAll(/FAIL\s+(.+)/g);

  for (const match of jestPassMatches) {
    results.set(match[1].trim(), true);
  }
  for (const match of jestFailMatches) {
    results.set(match[1].trim(), false);
  }

  // Vitest format: "✓ test name" or "✗ test name"
  const vitestPassMatches ***REMOVED*** output.matchAll(/[✓√]\s+(.+)/g);
  const vitestFailMatches ***REMOVED*** output.matchAll(/[✗×]\s+(.+)/g);

  for (const match of vitestPassMatches) {
    const testName ***REMOVED*** match[1].trim();
    if (!results.has(testName)) {
      results.set(testName, true);
    }
  }
  for (const match of vitestFailMatches) {
    const testName ***REMOVED*** match[1].trim();
    if (!results.has(testName)) {
      results.set(testName, false);
    }
  }

  // Pytest format: "PASSED test_name" or "FAILED test_name"
  const pytestPassMatches ***REMOVED*** output.matchAll(/PASSED\s+(.+)/g);
  const pytestFailMatches ***REMOVED*** output.matchAll(/FAILED\s+(.+)/g);

  for (const match of pytestPassMatches) {
    results.set(match[1].trim(), true);
  }
  for (const match of pytestFailMatches) {
    results.set(match[1].trim(), false);
  }

  return results;
}

/**
 * Run a single test iteration
 */
export async function runTestIteration(
  config: FlakyConfig,
  runNumber: number
): Promise<TestRunResult> {
  return new Promise((resolve) ***REMOVED***> {
    const startTime ***REMOVED*** Date.now();
    let stdout ***REMOVED*** '';
    let stderr ***REMOVED*** '';

    const child ***REMOVED*** spawn(config.testCommand, {
      shell: true,
      cwd: config.cwd || process.cwd(),
      env: { ...process.env },
    });

    child.stdout?.on('data', (data) ***REMOVED***> {
      stdout +***REMOVED*** data.toString();
    });

    child.stderr?.on('data', (data) ***REMOVED***> {
      stderr +***REMOVED*** data.toString();
    });

    const timeout ***REMOVED*** config.timeout || 60000;
    const timeoutHandle ***REMOVED*** setTimeout(() ***REMOVED***> {
      child.kill('SIGTERM');
    }, timeout);

    child.on('close', (code) ***REMOVED***> {
      clearTimeout(timeoutHandle);
      const duration ***REMOVED*** Date.now() - startTime;
      const passed ***REMOVED*** code ***REMOVED******REMOVED******REMOVED*** 0;
      const tests ***REMOVED*** parseTestOutput(stdout, stderr);

      resolve({
        run: runNumber,
        passed,
        tests,
        duration,
        error: !passed ? stderr : undefined,
      });
    });

    child.on('error', (error) ***REMOVED***> {
      clearTimeout(timeoutHandle);
      resolve({
        run: runNumber,
        passed: false,
        tests: new Map(),
        duration: Date.now() - startTime,
        error: error.message,
      });
    });
  });
}

/**
 * Run the test suite N times
 */
export async function runTestSuite(config: FlakyConfig): Promise<TestRunResult[]> {
  const results: TestRunResult[] ***REMOVED*** [];

  for (let i ***REMOVED*** 1; i <***REMOVED*** config.iterations; i++) {
    if (config.verbose) {
      console.log(`Run ${i}/${config.iterations}...`);
    }
    const result ***REMOVED*** await runTestIteration(config, i);
    results.push(result);

    if (config.verbose) {
      const status ***REMOVED*** result.passed ? '✓' : '✗';
      console.log(`${status} Run ${i} completed in ${result.duration}ms`);
    }
  }

  return results;
}
