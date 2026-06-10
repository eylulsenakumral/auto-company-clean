// Add command - create a new note
const path = require('path');
const { spawn } = require('child_process');
const { validateTitle, generateFilename, buildNoteContent } = require('../lib/note');
const { getPaths, getEditor } = require('../lib/config');
const { atomicWrite, readFile, ensureDir } = require('../lib/storage');
const { addToIndex } = require('../lib/index');
const { ValidationError } = require('../lib/errors');

// Parse params
function parseParams(params) {
  let title = null;
  let content = null;
  let tags = [];

  for (let i = 0; i < params.length; i++) {
    const param = params[i];
    const next = params[i + 1];

    if (param === '-c' || param === '--content') {
      content = next || '';
      i++; // Skip next
    } else if (param === '-t' || param === '--tag') {
      tags.push(next || '');
      i++; // Skip next
    } else if (!param.startsWith('-')) {
      title = param;
    }
  }

  return { title, content, tags };
}

// Open editor for content
function openEditor(filepath) {
  return new Promise((resolve, reject) => {
    const editor = getEditor();
    const editorArgs = editor.split(' ');
    const cmd = editorArgs[0];
    const args = [...editorArgs.slice(1), filepath];

    const proc = spawn(cmd, args, { stdio: 'inherit' });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Editor exited with code ${code}`));
      }
    });

    proc.on('error', (err) => {
      reject(new Error(`Failed to open editor: ${err.message}`));
    });
  });
}

// Run add command
async function run(params) {
  const { title, content, tags } = parseParams(params);

  // Validate title
  if (!title) {
    throw new ValidationError('Title is required. Usage: ln add "title"');
  }

  validateTitle(title);

  const paths = getPaths();
  const filename = generateFilename(title);
  const filepath = path.join(paths.notes, filename);

  // Ensure notes directory exists
  await ensureDir(paths.notes);

  let noteContent;

  if (content !== null) {
    // Direct content from -c flag
    noteContent = buildNoteContent(title, content, tags);
  } else {
    // Create temp file for editor
    const tempContent = buildNoteContent(title, '', tags);
    await atomicWrite(filepath, tempContent);

    // Open editor
    await openEditor(filepath);

    // Read edited content
    noteContent = await readFile(filepath);
  }

  // Write final content
  await atomicWrite(filepath, noteContent);

  // Update index
  await addToIndex({
    id: filename.replace('.md', ''),
    filename,
    title,
    created: new Date().toISOString(),
    modified: new Date().toISOString(),
    tags,
    path: filepath
  });

  console.log(`✓ Created: ${filepath}`);
}

module.exports = { run };
