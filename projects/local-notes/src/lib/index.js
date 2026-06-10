// Index management for fast lookups
const path = require('path');
const { StorageError, IndexError } = require('./errors');
const { readFile, atomicWrite, ensureDir, listNotes } = require('./storage');
const { parseNote } = require('./note');
const { getPaths } = require('./config');

// Create empty index
function createEmptyIndex() {
  return {
    version: 1,
    lastUpdated: new Date().toISOString(),
    notes: []
  };
}

// Load index
async function loadIndex() {
  const paths = getPaths();

  try {
    const content = await readFile(paths.index);
    const index = JSON.parse(content);

    // Validate structure
    if (!index.notes || !Array.isArray(index.notes)) {
      // Invalid structure, rebuild from notes directory
      return await rebuildIndex();
    }

    return index;
  } catch (error) {
    // Handle missing file or invalid JSON - rebuild index
    if (error.code === 'ENOENT' || error instanceof SyntaxError) {
      // Create empty index
      const empty = createEmptyIndex();
      await ensureDir(paths.base);
      await atomicWrite(paths.index, JSON.stringify(empty, null, 2));
      return empty;
    }
    throw new IndexError(`Failed to load index: ${error.message}`);
  }
}

// Save index
async function saveIndex(index) {
  const paths = getPaths();
  index.lastUpdated = new Date().toISOString();
  await ensureDir(paths.base);
  await atomicWrite(paths.index, JSON.stringify(index, null, 2));
}

// Rebuild index from notes directory
async function rebuildIndex() {
  const paths = getPaths();
  const notes = [];

  try {
    await ensureDir(paths.notes);
    const files = await listNotes(paths.notes);

    for (const file of files) {
      try {
        const filepath = path.join(paths.notes, file);
        const content = await readFile(filepath);
        const note = parseNote(content, file);
        notes.push({
          id: note.id,
          filename: note.filename,
          title: note.title,
          created: note.created,
          modified: note.modified,
          tags: note.tags,
          path: filepath
        });
      } catch (error) {
        // Skip corrupted files, continue
        console.warn(`Warning: Could not parse ${file}, skipping`);
      }
    }

    const index = {
      version: 1,
      lastUpdated: new Date().toISOString(),
      notes
    };

    await saveIndex(index);
    return index;
  } catch (error) {
    throw new IndexError(`Failed to rebuild index: ${error.message}`);
  }
}

// Add note to index
async function addToIndex(noteData) {
  const index = await loadIndex();

  // Check if note already exists
  const existing = index.notes.find(n => n.id === noteData.id);
  if (existing) {
    // Update existing
    Object.assign(existing, noteData);
  } else {
    // Add new
    index.notes.push(noteData);
  }

  await saveIndex(index);
  return index;
}

// Remove note from index
async function removeFromIndex(noteId) {
  const index = await loadIndex();
  index.notes = index.notes.filter(n => n.id !== noteId);
  await saveIndex(index);
  return index;
}

// Find note by ID or title
function findNote(index, query) {
  // Try exact ID match first
  let note = index.notes.find(n => n.id === query);

  // Try title match
  if (!note) {
    note = index.notes.find(n => n.title.toLowerCase() === query.toLowerCase());
  }

  // Try partial ID match
  if (!note) {
    note = index.notes.find(n => n.id.includes(query.toLowerCase()));
  }

  return note;
}

// Get all notes
async function getAllNotes() {
  const index = await loadIndex();
  return index.notes;
}

module.exports = {
  createEmptyIndex,
  loadIndex,
  saveIndex,
  rebuildIndex,
  addToIndex,
  removeFromIndex,
  findNote,
  getAllNotes
};
