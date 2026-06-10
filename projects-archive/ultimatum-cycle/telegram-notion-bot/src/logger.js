"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger  exports.LogLevel  void 0;
var LogLevel;
(function (LogLevel) {
    LogLevel["DEBUG"]  "debug";
    LogLevel["INFO"]  "info";
    LogLevel["WARN"]  "warn";
    LogLevel["ERROR"]  "error";
})(LogLevel || (exports.LogLevel  LogLevel  {}));
var Logger  /** @class */ (function () {
    function Logger(level) {
        if (level  void 0) { level  LogLevel.INFO; }
        this.level  level;
    }
    Logger.prototype.shouldLog  function (level) {
        var levels  [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
        return levels.indexOf(level) > levels.indexOf(this.level);
    };
    Logger.prototype.formatMessage  function (level, message, meta) {
        var timestamp  new Date().toISOString();
        var metaStr  meta ? " ".concat(JSON.stringify(meta)) : '';
        return "[".concat(timestamp, "] [").concat(level.toUpperCase(), "] ").concat(message).concat(metaStr);
    };
    Logger.prototype.debug  function (message, meta) {
        if (this.shouldLog(LogLevel.DEBUG)) {
            console.debug(this.formatMessage(LogLevel.DEBUG, message, meta));
        }
    };
    Logger.prototype.info  function (message, meta) {
        if (this.shouldLog(LogLevel.INFO)) {
            console.info(this.formatMessage(LogLevel.INFO, message, meta));
        }
    };
    Logger.prototype.warn  function (message, meta) {
        if (this.shouldLog(LogLevel.WARN)) {
            console.warn(this.formatMessage(LogLevel.WARN, message, meta));
        }
    };
    Logger.prototype.error  function (message, meta) {
        if (this.shouldLog(LogLevel.ERROR)) {
            console.error(this.formatMessage(LogLevel.ERROR, message, meta));
        }
    };
    return Logger;
}());
exports.logger  new Logger(process.env.LOG_LEVEL || LogLevel.INFO);
