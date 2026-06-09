/**
 * Configuration management for flaky test detector
 */
import type { FlakyConfig } from './types.js';
export declare function loadConfig(cwd?: string): Promise<FlakyConfig>;
export declare function mergeConfig(base: FlakyConfig, overrides: Partial<FlakyConfig>): FlakyConfig;
export declare function validateConfig(config: FlakyConfig): void;
//# sourceMappingURL***REMOVED***config.d.ts.map