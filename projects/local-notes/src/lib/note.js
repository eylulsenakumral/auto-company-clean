// Note model with frontmatter parsing
const matter = require('gray-matter');
const { ValidationError } = require('./errors');

// Slugify title for filename
function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')  // Remove special chars
    .replace(/\s+/g, '-')             // Spaces to dashes
    .replace(/-+/g, '-')              // Multiple dashes to one
    .replace(/^-+|-+$/g, '');         // Trim dashes
}

// Generate filename from title
function generateFilename(title) {
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const slug = slugify(title);
  return `${date}-${slug}.md`;
}

// Parse note content
function parseNote(content, filename) {
  const parsed = matter(content);
  const id = filename.replace('.md', '');

  return {
    id,
    filename,
    title: parsed.data.title || id,
    created: parsed.data.created || null,
    modified: parsed.data.modified || null,
    tags: parsed.data.tags || [],
    content: parsed.content,
    raw: content
  };
}

// Build note content with frontmatter
function buildNoteContent(title, content, tags = []) {
  const now = new Date().toISOString();
  const frontmatter = {
    title,
    created: now,
    modified: now,
    tags
  };

  return matter.stringify(content, frontmatter);
}

// Validate title
function validateTitle(title) {
  if (!title || typeof title !== 'string') {
    throw new ValidationError('Title is required');
  }
  if (title.length > 200) {
    throw new ValidationError('Title must be less than 200 characters');
  }
  if (title.trim().length === 0) {
    throw new ValidationError('Title cannot be empty');
  }
}

module.exports = {
  slugify,
  generateFilename,
  parseNote,
  buildNoteContent,
  validateTitle
};
