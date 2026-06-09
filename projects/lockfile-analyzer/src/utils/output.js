// Output formatting utilities

export function formatTable(data, options ***REMOVED*** {}) {
  const { columns, format ***REMOVED*** 'table' } ***REMOVED*** options;

  if (format ***REMOVED******REMOVED******REMOVED*** 'json') {
    return JSON.stringify(data, null, 2);
  }

  // Simple table formatter
  if (!data.length) return 'No data';

  const widths ***REMOVED*** columns.map((col, i) ***REMOVED***> {
    const maxWidth ***REMOVED*** Math.max(
      col.title.length,
      ...data.map(row ***REMOVED***> String(row[col.key] || '').length)
    );
    return maxWidth + 2;
  });

  // Header
  let output ***REMOVED*** '';
  output +***REMOVED*** columns.map((col, i) ***REMOVED***> col.title.padEnd(widths[i])).join('') + '\n';
  output +***REMOVED*** '─'.repeat(widths.reduce((a, b) ***REMOVED***> a + b, 0)) + '\n';

  // Rows
  for (const row of data) {
    output +***REMOVED*** columns.map((col, i) ***REMOVED***> String(row[col.key] || '').padEnd(widths[i])).join('') + '\n';
  }

  return output;
}

export function formatMarkdownTable(data, columns) {
  if (!data.length) return 'No changes';

  const header ***REMOVED*** '| ' + columns.map(c ***REMOVED***> c.title).join(' | ') + ' |';
  const separator ***REMOVED*** '| ' + columns.map(() ***REMOVED***> '---').join(' | ') + ' |';
  const rows ***REMOVED*** data.map(row ***REMOVED***>
    '| ' + columns.map(c ***REMOVED***> row[c.key] || '').join(' | ') + ' |'
  );

  return [header, separator, ...rows].join('\n');
}
