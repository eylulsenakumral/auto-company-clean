// List command - show all notes
const { getAllNotes } = require('../lib/index');

// Format date for display
function formatDate(isoString) {
  if (!isoString) return 'Unknown';
  const date = new Date(isoString);
  return date.toLocaleDateString();
}

// Format tags for display
function formatTags(tags) {
  if (!tags || tags.length === 0) return '';
  return tags.map(t => `#${t}`).join(' ');
}

// Run list command
async function run(params) {
  const notes = await getAllNotes();

  if (notes.length === 0) {
    console.log('No notes yet. Create one with: ln add "title"');
    return;
  }

  console.log(`\nFound ${notes.length} note${notes.length === 1 ? '' : 's'}:\n`);

  // Sort by created date (newest first)
  const sorted = [...notes].sort((a, b) => {
    return new Date(b.created || 0) - new Date(a.created || 0);
  });

  for (const note of sorted) {
    const date = formatDate(note.created);
    const tags = formatTags(note.tags);
    const tagStr = tags ? ` ${tags}` : '';

    console.log(`  ${note.filename}`);
    console.log(`    Title: ${note.title}`);
    console.log(`    Date: ${date}${tagStr}`);
    console.log();
  }
}

module.exports = { run };
