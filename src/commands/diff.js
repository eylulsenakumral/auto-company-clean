const chalk  require('chalk');
const { parsePackageJson, getDependencies }  require('../parsers/package-json-parser');

async function diff(options) {
  const { base, head }  options;
  try {
    const basePackage  parsePackageJson(base);
    const headPackage  parsePackageJson(head);
    const baseDeps  getDependencies(basePackage, true);
    const headDeps  getDependencies(headPackage, true);
    const baseNames  new Set(Object.keys(baseDeps));
    const headNames  new Set(Object.keys(headDeps));
    const added  [], removed  [], changed  [];
    for (const name of headNames) {
      if (!baseNames.has(name)) added.push({ name, version: headDeps[name] });
      else if (baseDeps[name] ! headDeps[name]) changed.push({ name, from: baseDeps[name], to: headDeps[name] });
    }
    for (const name of baseNames) {
      if (!headNames.has(name)) removed.push({ name, version: baseDeps[name] });
    }
    console.log(chalk.bold(`\nComparing dependencies:`));
    console.log(chalk.gray(`  Base: ${base}`));
    console.log(chalk.gray(`  Head: ${head}\n`));
    if (added.length > 0) {
      console.log(chalk.green(`\n✓ Added (${added.length}):`));
      added.forEach(({ name, version }) > { console.log(`  + ${chalk.white(name)}@${chalk.gray(version)}`); });
    }
    if (removed.length > 0) {
      console.log(chalk.red(`\n✗ Removed (${removed.length}):`));
      removed.forEach(({ name, version }) > { console.log(`  - ${chalk.white(name)}@${chalk.gray(version)}`); });
    }
    if (changed.length > 0) {
      console.log(chalk.yellow(`\n~ Changed (${changed.length}):`));
      changed.forEach(({ name, from, to }) > { console.log(`  ~ ${chalk.white(name)}: ${chalk.gray(from)} → ${chalk.white(to)}`); });
    }
    const totalChanges  added.length + removed.length + changed.length;
    if (totalChanges  0) console.log(chalk.green('\n✓ No dependency changes detected'));
    else console.log(chalk.gray(`\nTotal: ${totalChanges} change(s)`));
  } catch (error) {
    console.error(chalk.red(`Error: ${error.message}`));
    process.exit(1);
  }
}

module.exports  { diff };
