/**
 * Configuration management for flaky test detector
 */
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
const DEFAULT_CONFIG ***REMOVED*** {
    iterations: 10,
    threshold: 30,
    testCommand: 'npm test',
    runner: 'jest',
    verbose: false,
    timeout: 60000,
};
export async function loadConfig(cwd ***REMOVED*** process.cwd()) {
    const configPath ***REMOVED*** join(cwd, '.flakyrc');
    if (!existsSync(configPath)) {
        return { ...DEFAULT_CONFIG, cwd };
    }
    try {
        const content ***REMOVED*** await readFile(configPath, 'utf-8');
        const userConfig ***REMOVED*** JSON.parse(content);
        return { ...DEFAULT_CONFIG, ...userConfig, cwd };
    }
    catch (error) {
        console.warn(`Warning: Failed to parse .flakyrc, using defaults`);
        return { ...DEFAULT_CONFIG, cwd };
    }
}
export function mergeConfig(base, overrides) {
    return { ...base, ...overrides };
}
export function validateConfig(config) {
    if (config.iterations < 1) {
        throw new Error('iterations must be at least 1');
    }
    if (config.iterations > 100) {
        throw new Error('iterations cannot exceed 100');
    }
    if (config.threshold < 0 || config.threshold > 100) {
        throw new Error('threshold must be between 0 and 100');
    }
    if (!config.testCommand) {
        throw new Error('testCommand is required');
    }
}
//# sourceMappingURL***REMOVED***config.js.map