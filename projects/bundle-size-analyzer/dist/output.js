import chalk from 'chalk';
import Table from 'cli-table3';
import { formatBytes, getSizeCategory } from './analyzer.js';
/**
 * Print bundle analysis results
 */
export function printAnalysis(analysis, options ***REMOVED*** {}) {
    if (options.json) {
        console.log(JSON.stringify(analysis, null, 2));
        return;
    }
    console.log(chalk.bold(`\n📦 Bundle Analysis (${analysis.format.toUpperCase()})\n`));
    console.log(`Total Size: ${chalk.cyan(formatBytes(analysis.totalSize))}\n`);
    const table ***REMOVED*** new Table({
        head: [
            chalk.gray('Module'),
            chalk.gray('Size'),
            chalk.gray('%'),
            chalk.gray('Status'),
        ],
        colWidths: [30, 15, 10, 10],
    });
    analysis.modules.forEach((module) ***REMOVED***> {
        const category ***REMOVED*** getSizeCategory(module.size, analysis.totalSize);
        const status ***REMOVED*** category ***REMOVED******REMOVED******REMOVED*** 'red'
            ? chalk.red('⚠️ TOO BIG')
            : category ***REMOVED******REMOVED******REMOVED*** 'yellow'
                ? chalk.yellow('⚡ WARNING')
                : chalk.green('✓ OK');
        table.push([
            module.name,
            formatBytes(module.size),
            `${module.percentage.toFixed(1)}%`,
            status,
        ]);
    });
    console.log(table.toString());
}
/**
 * Print bundle comparison results
 */
export function printComparison(comparison, options ***REMOVED*** {}) {
    if (options.json) {
        console.log(JSON.stringify(comparison, null, 2));
        return;
    }
    console.log(chalk.bold('\n🔄 Bundle Comparison\n'));
    const sizeChange ***REMOVED*** comparison.totalSizeDiff;
    const absChange ***REMOVED*** Math.abs(sizeChange);
    const sizeText ***REMOVED*** sizeChange >***REMOVED*** 0
        ? chalk.red(`+${formatBytes(absChange)}`)
        : chalk.green(`-${formatBytes(absChange)}`);
    console.log(`Total Size Change: ${sizeText}\n`);
    if (comparison.hasRegression) {
        console.log(chalk.red.bold('⚠️  SIZE REGRESSION DETECTED\n'));
    }
    if (comparison.added.length > 0) {
        console.log(chalk.green.bold('\n✅ Added Modules:'));
        comparison.added.forEach((m) ***REMOVED***> {
            console.log(`  + ${m.name}: ${formatBytes(m.size)}`);
        });
    }
    if (comparison.removed.length > 0) {
        console.log(chalk.red.bold('\n❌ Removed Modules:'));
        comparison.removed.forEach((m) ***REMOVED***> {
            console.log(`  - ${m.name}: ${formatBytes(m.size)}`);
        });
    }
    if (comparison.changed.length > 0) {
        console.log(chalk.yellow.bold('\n📝 Changed Modules:'));
        comparison.changed.forEach((c) ***REMOVED***> {
            const absDiff ***REMOVED*** Math.abs(c.diff);
            const diffText ***REMOVED*** c.diff > 0 ? chalk.red(`+${formatBytes(absDiff)}`) : chalk.green(`-${formatBytes(absDiff)}`);
            console.log(`  ~ ${c.name}: ${formatBytes(c.oldSize)} → ${formatBytes(c.newSize)} (${diffText})`);
        });
    }
    console.log('');
}
/**
 * Print budget check results
 */
export function printBudget(result, options ***REMOVED*** {}) {
    if (options.json) {
        console.log(JSON.stringify(result, null, 2));
        return;
    }
    console.log(chalk.bold('\n💰 Budget Check\n'));
    console.log(`Budget: ${chalk.cyan(formatBytes(result.budget))}`);
    console.log(`Actual: ${chalk.cyan(formatBytes(result.totalSize))}`);
    if (result.withinBudget) {
        console.log(chalk.green.bold('\n✅ WITHIN BUDGET\n'));
    }
    else {
        console.log(chalk.red.bold(`\n❌ OVER BUDGET by ${formatBytes(result.overage)} (${result.overagePercentage.toFixed(1)}%)\n`));
    }
}
/**
 * Print package blame results
 */
export function printBlame(blames, totalSize, options ***REMOVED*** {}) {
    if (options.json) {
        console.log(JSON.stringify(blames, null, 2));
        return;
    }
    console.log(chalk.bold('\n🔍 Package Blame Analysis\n'));
    const table ***REMOVED*** new Table({
        head: [
            chalk.gray('Package'),
            chalk.gray('Size'),
            chalk.gray('%'),
            chalk.gray('Modules'),
        ],
        colWidths: [25, 15, 10, 30],
    });
    blames.forEach((blame) ***REMOVED***> {
        const status ***REMOVED*** blame.percentage > 20
            ? chalk.red('⚠️')
            : blame.percentage > 10
                ? chalk.yellow('⚡')
                : chalk.green('✓');
        table.push([
            `${status} ${blame.packageName}`,
            formatBytes(blame.size),
            `${blame.percentage.toFixed(1)}%`,
            blame.modules.slice(0, 3).join(', '),
        ]);
    });
    console.log(table.toString());
    console.log(chalk.gray('\n💡 Tip: Consider removing or lazy-loading packages marked with ⚠️\n'));
}
