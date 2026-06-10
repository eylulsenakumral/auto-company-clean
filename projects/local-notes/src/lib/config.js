// Configuration management
const path = require('path');
const os = require('os');
const { StorageError, ConfigError } = require('./errors');
const { readFile, atomicWrite, ensureDir } = require('./storage');

// Get base directory
function getBaseDir() {
  return process.env.LOCALNOTES_DIR || path.join(os.homedir(), '.local-notes');
}

// Get paths
function getPaths() {
  const base = getBaseDir();
  return {
    base,
    notes: path.join(base, 'notes'),
    config: path.join(base, 'config.json'),
    index: path.join(base, 'index.json')
  };
}

// Default config
const DEFAULT_CONFIG = {
  editor: null,
  dateFormat: 'YYYY-MM-DD',
  requireDeleteConfirm: true
};

// Load config
async function loadConfig() {
  const paths = getPaths();

  try {
    const content = await readFile(paths.config);
    return { ...DEFAULT_CONFIG, ...JSON.parse(content) };
  } catch (error) {
    if (error.code === 'ENOENT') {
      // Create default config
      await ensureDir(paths.base);
      await atomicWrite(paths.config, JSON.stringify(DEFAULT_CONFIG, null, 2));
      return DEFAULT_CONFIG;
    }
    throw new ConfigError(`Failed to load config: ${error.message}`);
  }
}

// Save config
async function saveConfig(config) {
  const paths = getPaths();
  await ensureDir(paths.base);
  await atomicWrite(paths.config, JSON.stringify(config, null, 2));
}

// Get editor command
function getEditor() {
  return process.env.EDITOR || process.env.VISUAL || (process.platform === 'win32' ? 'notepad' : 'vim');
}

module.exports = {
  getBaseDir,
  getPaths,
  loadConfig,
  saveConfig,
  getEditor,
  DEFAULT_CONFIG
};
