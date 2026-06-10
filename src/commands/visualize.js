const fs  require('fs');
const path  require('path');
const { buildTree }  require('../analyzers/tree-builder');
const { generateHTML }  require('../visualizers/html-generator');

async function visualize(options) {
  const { path: dirPath, output }  options;
  try {
    const tree  buildTree(dirPath, false);
    const html  generateHTML(tree);
    const outputPath  path.resolve(output);
    fs.writeFileSync(outputPath, html, 'utf-8');
    console.log(`HTML visualization saved to: ${outputPath}`);
    console.log(`Total dependencies: ${tree.metadata.totalDependencies}`);
    console.log(`Max depth: ${tree.metadata.maxDepth}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

module.exports  { visualize };
