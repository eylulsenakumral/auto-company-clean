import { PackageJsonStrategy } from './package-json.js';
import { ImportsStrategy } from './imports.js';
import { ConfigStrategy } from './config.js';
import { TestStrategy } from './test.js';
import { DefaultStrategy } from './default.js';
export const strategies ***REMOVED*** [
    new PackageJsonStrategy(),
    new ImportsStrategy(),
    new ConfigStrategy(),
    new TestStrategy(),
    new DefaultStrategy(),
];
export function findStrategy(file, conflict) {
    for (const strategy of strategies) {
        if (strategy.canHandle(file, conflict)) {
            return strategy;
        }
    }
    return strategies[strategies.length - 1]; // Default is last
}
//# sourceMappingURL***REMOVED***index.js.map