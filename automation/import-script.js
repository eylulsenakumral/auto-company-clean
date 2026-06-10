#!/usr/bin/env npx tsx
"use strict";
// Supabase Prospects Import Script — EXECUTABLE
// Auto Company Cycle #37 — Day 1 Build
// Usage: npx tsx import-script.ts
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
var import_prospects_1  require("./import-prospects");
var SUPABASE_URL  process.env.SUPABASE_URL || '';
var SUPABASE_SERVICE_KEY  process.env.SUPABASE_SERVICE_KEY || '';
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Error: SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables must be set');
    console.error('Create a .env file or export them before running this script');
    process.exit(1);
}
function importProspects() {
    return __awaiter(this, void 0, void 0, function () {
        var imported, failed, results, _i, prospects_1, prospect, response, error, error_1, errorMsg, verifyResponse, count, error_2;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    console.log("\uD83D\uDE80 Starting import of ".concat(import_prospects_1.default.length, " prospects to Supabase...\n"));
                    imported  0;
                    failed  0;
                    results  [];
                    _i  0, prospects_1  import_prospects_1.default;
                    _b.label  1;
                case 1:
                    if (!(_i < prospects_1.length)) return [3 /*break*/, 11];
                    prospect  prospects_1[_i];
                    _b.label  2;
                case 2:
                    _b.trys.push([2, 7, , 8]);
                    return [4 /*yield*/, fetch("".concat(SUPABASE_URL, "/rest/v1/prospects"), {
                            method: 'POST',
                            headers: {
                                'apikey': SUPABASE_SERVICE_KEY,
                                'Authorization': "Bearer ".concat(SUPABASE_SERVICE_KEY),
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(prospect)
                        })];
                case 3:
                    response  _b.sent();
                    if (!response.ok) return [3 /*break*/, 4];
                    imported++;
                    results.push({ success: true, company: prospect.company_name });
                    console.log("\u2705 ".concat(prospect.company_name));
                    return [3 /*break*/, 6];
                case 4: return [4 /*yield*/, response.text()];
                case 5:
                    error  _b.sent();
                    failed++;
                    results.push({ success: false, company: prospect.company_name, error: error });
                    console.error("\u274C ".concat(prospect.company_name, ": ").concat(error));
                    _b.label  6;
                case 6: return [3 /*break*/, 8];
                case 7:
                    error_1  _b.sent();
                    errorMsg  error_1 instanceof Error ? error_1.message : 'Unknown error';
                    failed++;
                    results.push({ success: false, company: prospect.company_name, error: errorMsg });
                    console.error("\u274C ".concat(prospect.company_name, ": ").concat(errorMsg));
                    return [3 /*break*/, 8];
                case 8: 
                // Small delay to avoid rate limiting (100ms)
                return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 100); })];
                case 9:
                    // Small delay to avoid rate limiting (100ms)
                    _b.sent();
                    _b.label  10;
                case 10:
                    _i++;
                    return [3 /*break*/, 1];
                case 11:
                    console.log("\n\uD83D\uDCCA Import Summary:");
                    console.log("\u2705 Success: ".concat(imported));
                    console.log("\u274C Failed: ".concat(failed));
                    console.log("\uD83D\uDCC8 Total: ".concat(import_prospects_1.default.length));
                    if (failed > 0) {
                        console.log("\n\u274C Failed Companies:");
                        results.filter(function (r) { return !r.success; }).forEach(function (r) {
                            console.log("  - ".concat(r.company, ": ").concat(r.error));
                        });
                    }
                    // Verify import count
                    console.log("\n\uD83D\uDD0D Verifying import...");
                    _b.label  12;
                case 12:
                    _b.trys.push([12, 14, , 15]);
                    return [4 /*yield*/, fetch("".concat(SUPABASE_URL, "/rest/v1/prospects?selectid&countexact&headtrue"), {
                            headers: {
                                'apikey': SUPABASE_SERVICE_KEY,
                                'Authorization': "Bearer ".concat(SUPABASE_SERVICE_KEY)
                            }
                        })];
                case 13:
                    verifyResponse  _b.sent();
                    if (verifyResponse.ok) {
                        count  (_a  verifyResponse.headers.get('content-range'))  null || _a  void 0 ? void 0 : _a.split('/')[1];
                        console.log("\u2705 Database contains ".concat(count, " prospects (expected: ").concat(imported, ")"));
                    }
                    return [3 /*break*/, 15];
                case 14:
                    error_2  _b.sent();
                    console.error('❌ Verification failed:', error_2);
                    return [3 /*break*/, 15];
                case 15:
                    console.log("\n\u2705 Import complete!");
                    return [2 /*return*/];
            }
        });
    });
}
// Run import
importProspects().catch(console.error);
