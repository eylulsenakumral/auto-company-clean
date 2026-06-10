"use strict";
/**
 * Resend API Wrapper with Rate Limiting and Retry Logic
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
exports.EmailSender  void 0;
var resend_1  require("resend");
var EmailSender  /** @class */ (function () {
    function EmailSender(apiKey, fromEmail, fromName, rateLimitMs, maxRetries) {
        if (rateLimitMs  void 0) { rateLimitMs  1000; }
        if (maxRetries  void 0) { maxRetries  3; }
        this.lastSendTime  0;
        this.resend  new resend_1.Resend(apiKey);
        this.fromEmail  fromEmail;
        this.fromName  fromName;
        this.rateLimitMs  rateLimitMs;
        this.maxRetries  maxRetries;
    }
    EmailSender.prototype.send  function (to_1, toName_1, subject_1, html_1, logger_1) {
        return __awaiter(this, arguments, void 0, function (to, toName, subject, html, logger, dryRun) {
            var startTime, lastError, attempt, result, duration, error_1;
            var _a, _b;
            if (dryRun  void 0) { dryRun  false; }
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        startTime  Date.now();
                        attempt  1;
                        _c.label  1;
                    case 1:
                        if (!(attempt < this.maxRetries)) return [3 /*break*/, 9];
                        _c.label  2;
                    case 2:
                        _c.trys.push([2, 5, , 8]);
                        // Rate limiting
                        return [4 /*yield*/, this.waitForRateLimit()];
                    case 3:
                        // Rate limiting
                        _c.sent();
                        if (dryRun) {
                            logger({
                                timestamp: new Date().toISOString(),
                                recipient_email: to,
                                recipient_name: toName,
                                template_id: 0,
                                subject: subject,
                                status: 'dry_run',
                                attempt: attempt,
                                duration_ms: Date.now() - startTime
                            });
                            return [2 /*return*/, {
                                    success: true,
                                    messageId: "dry-run-".concat(Date.now()),
                                    attempt: attempt,
                                    durationMs: Date.now() - startTime
                                }];
                        }
                        return [4 /*yield*/, this.resend.emails.send({
                                from: "\"".concat(this.fromName, "\" <").concat(this.fromEmail, ">"),
                                to: [to],
                                subject: subject,
                                html: html
                            })];
                    case 4:
                        result  _c.sent();
                        duration  Date.now() - startTime;
                        logger({
                            timestamp: new Date().toISOString(),
                            recipient_email: to,
                            recipient_name: toName,
                            template_id: 0,
                            subject: subject,
                            status: 'success',
                            attempt: attempt,
                            message_id: (_a  result.data)  null || _a  void 0 ? void 0 : _a.id,
                            duration_ms: duration
                        });
                        return [2 /*return*/, {
                                success: true,
                                messageId: (_b  result.data)  null || _b  void 0 ? void 0 : _b.id,
                                attempt: attempt,
                                durationMs: duration
                            }];
                    case 5:
                        error_1  _c.sent();
                        lastError  error_1 instanceof Error ? error_1.message : String(error_1);
                        // Log retry attempt
                        logger({
                            timestamp: new Date().toISOString(),
                            recipient_email: to,
                            recipient_name: toName,
                            template_id: 0,
                            subject: subject,
                            status: attempt < this.maxRetries ? 'retry' : 'failed',
                            attempt: attempt,
                            error: lastError,
                            duration_ms: Date.now() - startTime
                        });
                        // Don't retry on certain errors
                        if (this.isNonRetryableError(lastError)) {
                            return [3 /*break*/, 9];
                        }
                        if (!(attempt < this.maxRetries)) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.sleep(this.getRetryDelay(attempt))];
                    case 6:
                        _c.sent();
                        _c.label  7;
                    case 7: return [3 /*break*/, 8];
                    case 8:
                        attempt++;
                        return [3 /*break*/, 1];
                    case 9: return [2 /*return*/, {
                            success: false,
                            error: lastError,
                            attempt: this.maxRetries,
                            durationMs: Date.now() - startTime
                        }];
                }
            });
        });
    };
    EmailSender.prototype.waitForRateLimit  function () {
        return __awaiter(this, void 0, void 0, function () {
            var now, timeSinceLastSend, waitTime;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        now  Date.now();
                        timeSinceLastSend  now - this.lastSendTime;
                        if (!(timeSinceLastSend < this.rateLimitMs)) return [3 /*break*/, 2];
                        waitTime  this.rateLimitMs - timeSinceLastSend;
                        return [4 /*yield*/, this.sleep(waitTime)];
                    case 1:
                        _a.sent();
                        _a.label  2;
                    case 2:
                        this.lastSendTime  Date.now();
                        return [2 /*return*/];
                }
            });
        });
    };
    EmailSender.prototype.getRetryDelay  function (attempt) {
        // Exponential backoff: 2s, 4s, 8s...
        return 2000 * Math.pow(2, attempt - 1);
    };
    EmailSender.prototype.isNonRetryableError  function (error) {
        var nonRetryablePatterns  [
            'invalid api key',
            'unauthorized',
            'forbidden',
            'invalid email',
            'domain not verified'
        ];
        var lowerError  error.toLowerCase();
        return nonRetryablePatterns.some(function (pattern) { return lowerError.includes(pattern); });
    };
    EmailSender.prototype.sleep  function (ms) {
        return new Promise(function (resolve) { return setTimeout(resolve, ms); });
    };
    return EmailSender;
}());
exports.EmailSender  EmailSender;
