#!/usr/bin/env node
"use strict";
/**
 * Email Sender CLI
 * Usage: npm run send -- --recipients <csv> --sequence <id> --limit <n> --dry-run
 */
var __awaiter  (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P  Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator  generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator  (this && this.__generator) || function (thisArg, body) {
    var _  { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g  Object.create((typeof Iterator  "function" ? Iterator : Object).prototype);
    return g.next  verb(0), g["throw"]  verb(1), g["return"]  verb(2), typeof Symbol  "function" && (g[Symbol.iterator]  function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g  0, op[0] && (_  0)), _) try {
            if (f  1, y && (t  op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t  y["return"]) && t.call(y), 0) : y.next) && !(t  t.call(y, op[1])).done) return t;
            if (y  0, t) op  [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t  op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y  op[1]; op  [0]; continue;
                case 7: op  _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t  _.trys, t  t.length > 0 && t[t.length - 1]) && (op[0]  6 || op[0]  2)) { _  0; continue; }
                    if (op[0]  3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label  op[1]; break; }
                    if (op[0]  6 && _.label < t[1]) { _.label  t[1]; t  op; break; }
                    if (t && _.label < t[2]) { _.label  t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op  body.call(thisArg, _);
        } catch (e) { op  [6, e]; y  0; } finally { f  t  0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
var fs_1  require("fs");
var path_1  require("path");
var url_1  require("url");
// ANSI colors for terminal output
var clc  {
    bold: function (text) { return "\u001B[1m".concat(text, "\u001B[0m"); },
    cyan: function (text) { return "\u001B[36m".concat(text, "\u001B[0m"); },
    green: function (text) { return "\u001B[32m".concat(text, "\u001B[0m"); },
    red: function (text) { return "\u001B[31m".concat(text, "\u001B[0m"); },
    yellow: function (text) { return "\u001B[33m".concat(text, "\u001B[0m"); },
    dim: function (text) { return "\u001B[2m".concat(text, "\u001B[0m"); },
    underline: function (text) { return "\u001B[4m".concat(text, "\u001B[0m"); }
};
var sender_js_1  require("./sender.js");
var templates_js_1  require("./templates.js");
var recipients_js_1  require("./recipients.js");
var logger_js_1  require("./logger.js");
var __dirname  path_1.default.dirname((0, url_1.fileURLToPath)(import.meta.url));
var RECIPIENTS_CSV  path_1.default.join(__dirname, '../recipients.csv');
function parseArgs() {
    var args  process.argv.slice(2);
    var result  { dryRun: false };
    for (var i  0; i < args.length; i++) {
        var arg  args[i];
        if (arg  '--recipients' && args[i + 1]) {
            result.recipients  args[++i];
        }
        else if (arg  '--sequence' && args[i + 1]) {
            result.sequence  parseInt(args[++i], 10);
        }
        else if (arg  '--limit' && args[i + 1]) {
            result.limit  parseInt(args[++i], 10);
        }
        else if (arg  '--dry-run') {
            result.dryRun  true;
        }
        else if (arg  '--help' || arg  '-h') {
            printHelp();
            process.exit(0);
        }
    }
    return result;
}
function printHelp() {
    console.log("\n".concat(clc.bold('Email Sender CLI'), "\n\n").concat(clc.underline('Usage:'), "\n  npm run send -- [options]\n\n").concat(clc.underline('Options:'), "\n  --recipients <file>    CSV file with recipients (default: recipients.csv)\n  --sequence <id>        Template ID (1-4, default: 1)\n  --limit <n>            Max emails to send (default: all)\n  --dry-run              Simulate sending without actual API calls\n  --help                 Show this help\n\n").concat(clc.underline('CSV Format:'), "\n  email,name,segment,personalizedOpener,notes\n  user@example.com,John Doe,inner_circle,,Optional notes\n\n").concat(clc.underline('Templates:'), "\n  1  Can You Help?              (warm contacts)\n  2  Problem-Solution           (professional network)\n  3  Founder-to-Network         (inner circle)\n  4  Follow-Up                  (48h later)\n\n").concat(clc.underline('Environment Variables:'), "\n  RESEND_API_KEY         Your Resend API key\n  FROM_EMAIL             Sender email (default: onboarding@resend.me)\n  FROM_NAME              Sender name\n  RATE_LIMIT_MS          Rate limit in ms (default: 1000)\n  MAX_RETRIES            Max retry attempts (default: 3)\n"));
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var args, apiKey, fromEmail, fromName, rateLimitMs, maxRetries, recipientsPath, loader, recipients, templateId, templateManager, template, sender, logger, successCount, failCount, startTime, i, recipient, progress, _a, subject, html, result, duration, stats, todayStats;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    args  parseArgs();
                    apiKey  process.env.RESEND_API_KEY;
                    if (!apiKey) {
                        console.error(clc.red('Error: RESEND_API_KEY not set'));
                        console.error(clc.yellow('Create a .env file with RESEND_API_KEYre_xxxxxxxxxxxxx'));
                        process.exit(1);
                    }
                    fromEmail  process.env.FROM_EMAIL || 'onboarding@resend.me';
                    fromName  process.env.FROM_NAME || 'Tolga from Resume Keyword Analyzer';
                    rateLimitMs  parseInt(process.env.RATE_LIMIT_MS || '1000', 10);
                    maxRetries  parseInt(process.env.MAX_RETRIES || '3', 10);
                    recipientsPath  args.recipients || RECIPIENTS_CSV;
                    loader  new recipients_js_1.RecipientsLoader();
                    try {
                        recipients  loader.loadFromCsv(recipientsPath);
                    }
                    catch (error) {
                        console.error(clc.red("Failed to load recipients: ".concat(error)));
                        // Offer to create sample
                        if (!args.recipients && !fs_1.default.existsSync(RECIPIENTS_CSV)) {
                            console.log(clc.yellow('\nCreating sample recipients.csv...'));
                            loader.createSampleCsv(RECIPIENTS_CSV, 1);
                            console.log(clc.green('Sample CSV created. Please edit recipients.csv with real data.'));
                            return [2 /*return*/];
                        }
                        process.exit(1);
                    }
                    if (recipients.length  0) {
                        console.error(clc.red('No valid recipients found in CSV'));
                        process.exit(1);
                    }
                    // Apply limit
                    if (args.limit && args.limit < recipients.length) {
                        recipients  recipients.slice(0, args.limit);
                    }
                    templateId  args.sequence || 1;
                    templateManager  new templates_js_1.TemplateManager();
                    template  templateManager.getTemplate(templateId);
                    if (!template) {
                        console.error(clc.red("Invalid template ID: ".concat(templateId)));
                        console.log(clc.yellow('Available templates: 1-4'));
                        process.exit(1);
                    }
                    sender  new sender_js_1.EmailSender(apiKey, fromEmail, fromName, rateLimitMs, maxRetries);
                    logger  new logger_js_1.AuditLogger();
                    // Print summary
                    console.log(clc.bold('\n╔════════════════════════════════════════════════════════╗'));
                    console.log(clc.bold('║           Email Sender - Ready to Send                ║'));
                    console.log(clc.bold('╚════════════════════════════════════════════════════════╝\n'));
                    console.log("".concat(clc.cyan('Template:'), " ").concat(template.name, " (ID: ").concat(templateId, ")"));
                    console.log("".concat(clc.cyan('Recipients:'), " ").concat(recipients.length));
                    console.log("".concat(clc.cyan('From:'), " ").concat(fromName, " <").concat(fromEmail, ">"));
                    console.log("".concat(clc.cyan('Rate limit:'), " ").concat(rateLimitMs, "ms"));
                    console.log("".concat(clc.yellow('Mode:'), " ").concat(args.dryRun ? 'DRY RUN (no emails sent)' : 'LIVE (emails will be sent)', "\n"));
                    successCount  0;
                    failCount  0;
                    startTime  Date.now();
                    i  0;
                    _b.label  1;
                case 1:
                    if (!(i < recipients.length)) return [3 /*break*/, 4];
                    recipient  recipients[i];
                    progress  "[".concat(i + 1, "/").concat(recipients.length, "]");
                    console.log(clc.dim("\n".concat(progress, " Processing ").concat(recipient.email, "...")));
                    _a  templateManager.renderTemplate(template, recipient), subject  _a.subject, html  _a.html;
                    return [4 /*yield*/, sender.send(recipient.email, recipient.name, subject, html, function (entry) {
                            entry.template_id  templateId;
                            logger.log(entry);
                        }, args.dryRun)];
                case 2:
                    result  _b.sent();
                    if (result.success) {
                        successCount++;
                        console.log(clc.green("\u2713 Sent to ".concat(recipient.email)));
                        if (args.dryRun) {
                            console.log(clc.dim("  (dry-run, message ID: ".concat(result.messageId, ")")));
                        }
                        else {
                            console.log(clc.dim("  (message ID: ".concat(result.messageId, ")")));
                        }
                    }
                    else {
                        failCount++;
                        console.log(clc.red("\u2717 Failed to send to ".concat(recipient.email)));
                        console.log(clc.red("  Error: ".concat(result.error)));
                    }
                    _b.label  3;
                case 3:
                    i++;
                    return [3 /*break*/, 1];
                case 4:
                    duration  Date.now() - startTime;
                    stats  logger_js_1.AuditLogger.getStats();
                    console.log(clc.bold('\n═════════════════════════════════════════════════════════'));
                    console.log(clc.bold('                        Summary                          '));
                    console.log(clc.bold('═════════════════════════════════════════════════════════\n'));
                    console.log("".concat(clc.cyan('Total:'), " ").concat(recipients.length));
                    console.log("".concat(clc.green('Success:'), " ").concat(successCount));
                    console.log("".concat(clc.red('Failed:'), " ").concat(failCount));
                    console.log("".concat(clc.yellow('Duration:'), " ").concat((duration / 1000).toFixed(1), "s"));
                    console.log("".concat(clc.cyan('Log file:'), " ").concat(logger['logPath']));
                    todayStats  logger_js_1.AuditLogger.getStats();
                    console.log(clc.dim("\nToday's total: ".concat(todayStats.total, " | Success: ").concat(todayStats.success, " | Failed: ").concat(todayStats.failed, "\n")));
                    if (!args.dryRun && failCount > 0) {
                        console.log(clc.yellow('⚠ Some emails failed. Check the log file for details.'));
                        process.exit(1);
                    }
                    return [2 /*return*/];
            }
        });
    });
}
main().catch(function (error) {
    console.error(clc.red('\nFatal error:'), error);
    process.exit(1);
});
