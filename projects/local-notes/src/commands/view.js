// View command - display a specific note
const { loadIndex, findNote } = require('../lib/index');
const { readFile } = require('../lib/storage');
const { ValidationError } = require('../lib/errors');

// Run view command
async function run(params) {
  const query = params[0];

  if (!query) {
    throw new ValidationError('Usage: ln view <id|title>');
  }

  const index = await loadIndex();
  const note = findNote(index, query);

  if (!note) {
    console.log(`Note "${query}" not found.`);
    console.log('Run "ln list" to see all notes.');
    return;
  }

  try {
    const content = await readFile(note.path);
    console.log(content);
  } catch (error) {
    console.log(`Could not read note: ${error.message}`);
  }
}

module.exports = { run };
