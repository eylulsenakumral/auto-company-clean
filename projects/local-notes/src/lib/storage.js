// Filesystem operations with atomic writes
const fs = require('fs').promises;
const path = require('path');
const { StorageError } = require('./errors');

// Atomic write pattern: write temp, then rename
async function atomicWrite(filepath, content) {
  const tempPath = `${filepath}.${Date.now()}.tmp`;

  try {
    await fs.writeFile(tempPath, content, 'utf8');
    await fs.rename(tempPath, filepath);
  } catch (error) {
    // Clean up temp file if rename failed
    try {
      await fs.unlink(tempPath);
    } catch {}
    throw new StorageError(`Failed to write ${filepath}: ${error.message}`);
  }
}

// Ensure directory exists
async function ensureDir(dirPath) {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

// Read file content
async function readFile(filepath) {
  try {
    return await fs.readFile(filepath, 'utf8');
  } catch (error) {
    // Preserve error code for ENOENT detection
    const err = new StorageError(`Failed to read ${filepath}: ${error.message}`);
    err.code = error.code;
    throw err;
  }
}

// Delete file
async function deleteFile(filepath) {
  try {
    await fs.unlink(filepath);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw new StorageError(`Failed to delete ${filepath}: ${error.message}`);
    }
  }
}

// List markdown files in directory
async function listNotes(notesDir) {
  try {
    const files = await fs.readdir(notesDir);
    return files.filter(f => f.endsWith('.md'));
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw new StorageError(`Failed to list notes: ${error.message}`);
  }
}

module.exports = {
  atomicWrite,
  ensureDir,
  readFile,
  deleteFile,
  listNotes
};
