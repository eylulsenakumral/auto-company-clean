import { Strategy, ConflictMarker } from '../types.js';
import { PackageJsonStrategy } from './package-json.js';
import { ImportsStrategy } from './imports.js';
import { ConfigStrategy } from './config.js';
import { TestStrategy } from './test.js';
import { DefaultStrategy } from './default.js';

export const strategies: Strategy[] ***REMOVED*** [
  new PackageJsonStrategy(),
  new ImportsStrategy(),
  new ConfigStrategy(),
  new TestStrategy(),
  new DefaultStrategy(),
];

export function findStrategy(file: string, conflict: ConflictMarker): Strategy {
  for (const strategy of strategies) {
    if (strategy.canHandle(file, conflict)) {
      return strategy;
    }
  }
  return strategies[strategies.length - 1]; // Default is last
}
