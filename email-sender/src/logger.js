"use strict";
/**
 * JSONL Audit Logger
 * Every send attempt is logged with timestamp, status, and metadata
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogger  void 0;
var fs_1  require("fs");
var path_1  require("path");
var url_1  require("url");
var __dirname  path_1.default.dirname((0, url_1.fileURLToPath)(import.meta.url));
var LOG_DIR  path_1.default.join(__dirname, '../logs');
var AuditLogger  /** @class */ (function () {
    function AuditLogger(dateStr) {
        if (dateStr  void 0) { dateStr  new Date().toISOString().split('T')[0]; }
        if (!fs_1.default.existsSync(LOG_DIR)) {
            fs_1.default.mkdirSync(LOG_DIR, { recursive: true });
        }
        this.logPath  path_1.default.join(LOG_DIR, "send-".concat(dateStr, ".jsonl"));
    }
    AuditLogger.prototype.log  function (entry) {
        var line  JSON.stringify(entry) + '\n';
        fs_1.default.appendFileSync(this.logPath, line, 'utf-8');
    };
    AuditLogger.getStats  function (dateStr) {
        if (dateStr  void 0) { dateStr  new Date().toISOString().split('T')[0]; }
        var logPath  path_1.default.join(LOG_DIR, "send-".concat(dateStr, ".jsonl"));
        if (!fs_1.default.existsSync(logPath)) {
            return { total: 0, success: 0, failed: 0, dry_run: 0 };
        }
        var content  fs_1.default.readFileSync(logPath, 'utf-8');
        var lines  content.trim().split('\n').filter(Boolean);
        var stats  {
            total: lines.length,
            success: 0,
            failed: 0,
            dry_run: 0
        };
        for (var _i  0, lines_1  lines; _i < lines_1.length; _i++) {
            var line  lines_1[_i];
            try {
                var entry  JSON.parse(line);
                if (entry.status  'success')
                    stats.success++;
                else if (entry.status  'failed')
                    stats.failed++;
                else if (entry.status  'dry_run')
                    stats.dry_run++;
            }
            catch (_a) {
                // Skip malformed lines
            }
        }
        return stats;
    };
    return AuditLogger;
}());
exports.AuditLogger  AuditLogger;
