// Search command - find notes by content
const { loadIndex } = require('../lib/index');
const { readFile } = require('../lib/storage');
const path = require('path');

// Calculate search score
function calculateScore(query, note) {
  const q = query.toLowerCase();
  const title = note.title.toLowerCase();
  const tags = (note.tags || []).map(t => t.toLowerCase()).join(' ');

  let score = 0;

  // Title match: highest weight
  if (title.includes(q)) {
    score += 0.5;
    if (title === q) score += 0.3; // Exact match
  }

  // Tag match
  if (tags.includes(q)) {
    score += 0.3;
  }

  // Content match: check when we read file
  return score;
}

// Run search command
async function run(params) {
  const query = params[0];

  if (!query) {
    console.log('Usage: ln search "query"');
    return;
  }

  const index = await loadIndex();

  if (index.notes.length === 0) {
    console.log('No notes to search.');
    return;
  }

  console.log(`Searching ${index.notes.length} notes...\n`);

  const results = [];

  for (const note of index.notes) {
    let score = calculateScore(query, note);

    // Read content for additional matching
    if (score < 0.8) {
      try {
        const content = await readFile(note.path);
        const lowerContent = content.toLowerCase();
        if (lowerContent.includes(query.toLowerCase())) {
          score += 0.2;
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }

    if (score > 0) {
      // Get preview
      let preview = '';
      try {
        const content = await readFile(note.path);
        const q = query.toLowerCase();
        const idx = content.toLowerCase().indexOf(q);
        if (idx !== -1) {
          const start = Math.max(0, idx - 30);
          const end = Math.min(content.length, idx + q.length + 30);
          preview = (start > 0 ? '...' : '') + content.slice(start, end) + (end < content.length ? '...' : '');
        } else {
          preview = content.slice(0, 100) + '...';
        }
      } catch (error) {
        preview = '[Could not read content]';
      }

      results.push({
        ...note,
        score,
        preview: preview.replace(/\n/g, ' ')
      });
    }
  }

  // Sort by score
  results.sort((a, b) => b.score - a.score);

  if (results.length === 0) {
    console.log('No matches found.');
    return;
  }

  console.log(`Results (${results.length} match${results.length === 1 ? '' : 'es'}):\n`);

  for (const result of results.slice(0, 20)) {
    const modified = result.modified ? new Date(result.modified).toLocaleDateString() : 'Unknown';
    console.log(`  ${result.filename}`);
    console.log(`    Score: ${result.score.toFixed(2)} | Modified: ${modified}`);
    console.log(`    Preview: ${result.preview}`);
    console.log();
  }
}

module.exports = { run };
