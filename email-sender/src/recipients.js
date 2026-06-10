"use strict";
/**
 * CSV Recipients Parser
 * Reads recipient data from CSV file
 */
var __spreadArray  (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length  2) for (var i  0, l  from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar  Array.prototype.slice.call(from, 0, i);
            ar[i]  from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecipientsLoader  void 0;
var fs_1  require("fs");
var sync_1  require("csv-parse/sync");
var RecipientsLoader  /** @class */ (function () {
    function RecipientsLoader() {
    }
    RecipientsLoader.prototype.loadFromCsv  function (filePath) {
        var _a, _b, _c, _d, _e;
        if (!fs_1.default.existsSync(filePath)) {
            throw new Error("CSV file not found: ".concat(filePath));
        }
        var content  fs_1.default.readFileSync(filePath, 'utf-8');
        var records  (0, sync_1.parse)(content, {
            columns: true,
            skip_empty_lines: true,
            trim: true
        });
        var recipients  [];
        for (var _i  0, records_1  records; _i < records_1.length; _i++) {
            var record  records_1[_i];
            // Validate email
            var email  (_a  record.email)  null || _a  void 0 ? void 0 : _a.trim();
            if (!email || !this.isValidEmail(email)) {
                console.warn("Skipping invalid email: ".concat(email));
                continue;
            }
            recipients.push({
                email: email,
                name: ((_b  record.name)  null || _b  void 0 ? void 0 : _b.trim()) || '',
                segment: (_c  record.segment)  null || _c  void 0 ? void 0 : _c.trim(),
                personalizedOpener: (_d  record.personalizedOpener)  null || _d  void 0 ? void 0 : _d.trim(),
                notes: (_e  record.notes)  null || _e  void 0 ? void 0 : _e.trim()
            });
        }
        return recipients;
    };
    RecipientsLoader.prototype.loadSingle  function (email, name) {
        if (name  void 0) { name  ''; }
        if (!this.isValidEmail(email)) {
            throw new Error("Invalid email: ".concat(email));
        }
        return [{ email: email, name: name }];
    };
    RecipientsLoader.prototype.isValidEmail  function (email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };
    RecipientsLoader.prototype.createSampleCsv  function (filePath, count) {
        if (count  void 0) { count  1; }
        var sampleData  __spreadArray([
            'email,name,segment,personalizedOpener,notes'
        ], Array.from({ length: count }, function (_, i) {
            var num  i + 1;
            return "test".concat(num, "@example.com,Test User ").concat(num, ",inner_circle,,Sample recipient");
        }), true);
        fs_1.default.writeFileSync(filePath, sampleData.join('\n'), 'utf-8');
        console.log("Created sample CSV with ".concat(count, " recipient(s) at ").concat(filePath));
    };
    return RecipientsLoader;
}());
exports.RecipientsLoader  RecipientsLoader;
