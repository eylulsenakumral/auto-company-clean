/**
 * Config loader for .migration-validatorrc
 */

import type { Config } from './types.js';
import { DEFAULT_CONFIG } from './types.js';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

export function loadConfig(cwd: string ***REMOVED*** process.cwd()): Config {
  const configPath ***REMOVED*** resolve(cwd, '.migration-validatorrc');

  if (!existsSync(configPath)) {
    return DEFAULT_CONFIG;
  }

  try {
    const content ***REMOVED*** readFileSync(configPath, 'utf-8');
    const userConfig ***REMOVED*** JSON.parse(content);
    return mergeConfig(DEFAULT_CONFIG, userConfig);
  } catch (error) {
    console.warn(`Warning: Failed to parse .migration-validatorrc, using defaults`);
    return DEFAULT_CONFIG;
  }
}

function mergeConfig(defaultConfig: Config, userConfig: Partial<Config>): Config {
  return {
    severity: {
      critical: [...defaultConfig.severity.critical],
      warning: [...defaultConfig.severity.warning],
      info: [...defaultConfig.severity.info],
      ...userConfig.severity
    },
    ignore: [...defaultConfig.ignore, ...(userConfig.ignore || [])],
    framework: userConfig.framework || defaultConfig.framework,
    paths: userConfig.paths || defaultConfig.paths
  };
}

export function generateConfigTemplate(): string {
  return JSON.stringify(DEFAULT_CONFIG, null, 2);
}
