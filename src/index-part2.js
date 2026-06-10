module.exports  {
  parsePackageJson: require('./parsers/package-json-parser').parsePackageJson,
  getDependencies: require('./parsers/package-json-parser').getDependencies,
  parseLockfile: require('./parsers/lockfile-parser').parseLockfile,
  buildTree: require('./analyzers/tree-builder').buildTree,
  flattenTree: require('./analyzers/tree-builder').flattenTree,
  detectCircular: require('./analyzers/circular-detector').detectCircular,
  audit: require('./analyzers/audit-analyzer').audit,
  generateHTML: require('./visualizers/html-generator').generateHTML
};
