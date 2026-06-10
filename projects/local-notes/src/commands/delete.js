// Delete command - remove a note
const readline = require('readline');
const { loadIndex, findNote, removeFromIndex } = require('../lib/index');
const { deleteFile } = require('../lib/storage');
const { ValidationError } = require('../lib/errors');

// Parse params for flags
function parseParams(params) {
  let force = false;
  let query = null;

  for (const param of params) {
    if (param === '-f' || param === '--force') {
      force = true;
    } else if (!param.startsWith('-')) {
      query = param;
    }
  }

  return { query, force };
}

// Confirm with user
function confirm(message) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve => {
    rl.question(`${message} [y/N] `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

// Run delete command
async function run(params) {
  const { query, force } = parseParams(params);

  if (!query) {
    throw new ValidationError('Usage: ln delete <id|title> [-f]');
  }

  const index = await loadIndex();
  const note = findNote(index, query);

  if (!note) {
    console.log(`Note "${query}" not found.`);
    console.log('Run "ln list" to see all notes.');
    return;
  }

  // Confirm unless force flag
  if (!force) {
    const confirmed = await confirm(`Delete note "${note.title}"?`);
    if (!confirmed) {
      console.log('Cancelled.');
      return;
    }
  }

  // Delete file
  try {
    await deleteFile(note.path);
  } catch (error) {
    console.log(`Warning: Could not delete file: ${error.message}`);
  }

  // Remove from index
  await removeFromIndex(note.id);

  console.log(`✓ Deleted: ${note.filename}`);
}

module.exports = { run };
