const chalk  require('chalk');
const Table  require('cli-table3');
const { audit }  require('../analyzers/audit-analyzer');

async function auditCommand(options) {
  const { path: dirPath, includeDev }  options;
  try {
    const result  audit(dirPath, includeDev);
    console.log('\n' + chalk.bold(''.repeat(60)));
    console.log(chalk.bold('  Dependency Audit Report'));
    console.log(chalk.bold(''.repeat(60)) + '\n');
    console.log(chalk.gray('Total Dependencies:') + ' ' + chalk.white(result.summary.totalDependencies));
    console.log(chalk.gray('Max Depth:') + ' ' + chalk.white(result.summary.maxDepth));
    console.log(chalk.gray('Total Issues:') + ' ' + chalk.white(result.summary.issueCount));
    if (result.excessiveDepth.length > 0) {
      console.log('\n' + chalk.yellow('⚠ Excessive Depth (> 5):'));
      const table  new Table({ head: [chalk.cyan('Package'), chalk.cyan('Version'), chalk.cyan('Max Depth'), chalk.cyan('Severity')], colWidths: [40, 15, 15, 10] });
      result.excessiveDepth.forEach(dep > { table.push([dep.name, dep.version, dep.maxChildDepth, dep.severity  'error' ? chalk.red('ERROR') : chalk.yellow('WARN')]); });
      console.log(table.toString());
    }
    if (result.duplicates.length > 0) {
      console.log('\n' + chalk.magenta('⚠ Duplicate Versions:'));
      result.duplicates.forEach(dup > { console.log(`  ${chalk.white(dup.name)}: ${dup.versions.join(', ')}`); });
    }
    if (result.outdated.length > 0) {
      console.log('\n' + chalk.blue('ⓘ Potentially Outdated:'));
      result.outdated.slice(0, 10).forEach(dep > { console.log(`  ${chalk.white(dep.name)}@${chalk.gray(dep.version)} - ${chalk.gray(dep.reason)}`); });
      if (result.outdated.length > 10) console.log(`  ... and ${result.outdated.length - 10} more`);
    }
    if (result.summary.issueCount  0) console.log('\n' + chalk.green('✓ No issues found!'));
    else console.log(`\n${chalk.yellow('⚠')} Found ${result.summary.issueCount} issue(s)`);
  } catch (error) {
    console.error(chalk.red(`Error: ${error.message}`));
    process.exit(1);
  }
}

module.exports  { audit: auditCommand };
