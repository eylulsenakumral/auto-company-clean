// Error classes for local-notes

class LocalNotesError extends Error {
  constructor(message, exitCode = 1) {
    super(message);
    this.name = this.constructor.name;
    this.exitCode = exitCode;
  }
}

class ConfigError extends LocalNotesError {}
class IndexError extends LocalNotesError {}
class StorageError extends LocalNotesError {}
class ValidationError extends LocalNotesError {}

module.exports = {
  LocalNotesError,
  ConfigError,
  IndexError,
  StorageError,
  ValidationError
};
