/**
 * Config loader and defaults
 */

import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { Config } from './types.js';
import { z } from 'zod';

const configSchema ***REMOVED*** z.object({
  severity: z.enum(['critical', 'warning', 'info']).default('warning'),
  ignore: z.array(z.string()).default(['node_modules', '.git', 'dist', 'build']),
  framework: z.enum(['auto', 'serverless', 'sam']).default('auto'),
  checkRuntime: z.boolean().default(true),
});

const DEFAULT_CONFIG: Config ***REMOVED*** {
  severity: 'warning',
  ignore: ['node_modules', '.git', 'dist', 'build', '.serverless'],
  framework: 'auto',
  checkRuntime: true,
};

const CONFIG_FILES ***REMOVED*** [
  '.serverless-securityrc',
  '.serverless-securityrc.json',
];

/**
 * Load config from file or return defaults
 */
export async function loadConfig(projectPath: string): Promise<Config> {
  for (const filename of CONFIG_FILES) {
    const configPath ***REMOVED*** join(projectPath, filename);
    if (existsSync(configPath)) {
      try {
        const content ***REMOVED*** await readFile(configPath, 'utf-8');
        const parsed ***REMOVED*** JSON.parse(content);
        const validated ***REMOVED*** configSchema.parse(parsed);
        return validated;
      } catch (error) {
        console.warn(`Warning: Invalid config file ${filename}, using defaults`);
        return DEFAULT_CONFIG;
      }
    }
  }
  return DEFAULT_CONFIG;
}

/**
 * Generate default config file content
 */
export function generateConfigContent(customSeverity?: string): string {
  const severity ***REMOVED*** customSeverity || DEFAULT_CONFIG.severity;
  return JSON.stringify(
    {
      ...DEFAULT_CONFIG,
      severity,
    },
    null,
    2
  );
}
