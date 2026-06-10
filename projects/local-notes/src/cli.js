// CLI argument parsing and routing
const { ValidationError } = require('./lib/errors');

function parseArgs(args) {
  const command = args[0];
  const params = args.slice(1);

  return { command, params };
}

function showHelp() {
  console.log(`
local-notes - Terminal-based note-taking. Zero cloud. Zero BS.

USAGE:
  ln <command> [options]

COMMANDS:
  add <title>     Create a new note
  list            List all notes
  search <query>  Search notes
  view <id>       View a specific note
  delete <id>     Delete a note

OPTIONS:
  -c, --content <text>  Add note with content directly (no editor)
  -t, --tag <tag>       Add tag to note
  -f, --force           Skip confirmation (for delete)
  -h, --help            Show help
  -v, --version         Show version

EXAMPLES:
  ln add "meeting notes"           # Opens editor
  ln add "idea" -c "quick thought" # Direct content
  ln add "task" --tag work         # With tag
  ln list                          # List all notes
  ln search "authentication"       # Search notes
  ln view 2025-06-10-my-note       # View note
  ln delete "old-note"             # Delete with confirmation
  ln delete "temp" -f              # Delete without prompt
`);
}

function showVersion() {
  const pkg = require('../package.json');
  console.log(`local-notes v${pkg.version}`);
}

async function route(args) {
  const { command, params } = parseArgs(args);

  // Handle help/version at command level
  if (command === '-h' || command === '--help' || command === 'help') {
    showHelp();
    return;
  }

  if (command === '-v' || command === '--version' || command === 'version') {
    showVersion();
    return;
  }

  // Route commands
  switch (command) {
    case 'add':
      return (await require('./commands/add')).run(params);
    case 'list':
      return (await require('./commands/list')).run(params);
    case 'search':
      return (await require('./commands/search')).run(params);
    case 'view':
      return (await require('./commands/view')).run(params);
    case 'delete':
      return (await require('./commands/delete')).run(params);
    case null:
    case undefined:
      showHelp();
      return;
    default:
      console.error(`Unknown command: ${command}`);
      console.error('Run "ln --help" for usage');
      process.exit(1);
  }
}

async function cli(args) {
  try {
    await route(args);
  } catch (error) {
    if (error instanceof ValidationError) {
      console.error(`Validation error: ${error.message}`);
    } else if (error.exitCode !== undefined) {
      console.error(`Error: ${error.message}`);
    } else {
      console.error(`Unexpected error: ${error.message}`);
    }
    process.exit(error.exitCode || 1);
  }
}

module.exports = cli;
