const { detectCircular, formatCircular }  require('../analyzers/circular-detector');

async function circular(options) {
  const { path: dirPath, format }  options;
  try {
    const result  detectCircular(dirPath);
    const output  formatCircular(result, format);
    console.log(output);
    return result.hasCircular ? 1 : 0;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    return 1;
  }
}

module.exports  { circular };
