"use strict";
// Cloudflare Worker — Bursa Automotive Outreach Automation
// Auto Company Cycle #37 — Day 1 Build
// Cron: Daily 9AM Istanbul (6AM UTC)
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
exports.default  {
    // Scheduled cron job
    scheduled: function (event, env, ctx) {
        return __awaiter(this, void 0, void 0, function () {
            var summary, companies, _i, companies_1, company, templateId, result, errorMsg, error_1, errorMsg;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("\uD83D\uDE80 Cron job started at ".concat(new Date().toISOString()));
                        summary  {
                            timestamp: new Date().toISOString(),
                            companiesProcessed: 0,
                            emailsSent: 0,
                            emailsFailed: 0,
                            rateLimitHit: false,
                            errors: []
                        };
                        _a.label  1;
                    case 1:
                        _a.trys.push([1, 12, , 14]);
                        // Step 1: Fetch companies to contact
                        console.log("\uD83D\uDCCB Fetching companies from Supabase...");
                        return [4 /*yield*/, fetchCompanies(env)];
                    case 2:
                        companies  _a.sent();
                        if (companies.length  0) {
                            console.log("\u2705 No companies to contact (all contacted or rate limited)");
                            return [2 /*return*/, new Response(JSON.stringify({
                                    success: true,
                                    message: 'No companies to contact',
                                    summary: summary
                                }), {
                                    headers: { 'Content-Type': 'application/json' }
                                })];
                        }
                        console.log("\uD83D\uDCCB Found ".concat(companies.length, " companies to contact"));
                        _i  0, companies_1  companies;
                        _a.label  3;
                    case 3:
                        if (!(_i < companies_1.length)) return [3 /*break*/, 10];
                        company  companies_1[_i];
                        if (!company.contact_email) {
                            console.log("\u26A0\uFE0F  Skipping ".concat(company.company_name, " (no email)"));
                            summary.errors.push("".concat(company.company_name, ": No email address"));
                            return [3 /*break*/, 9];
                        }
                        if (company.email_bounced) {
                            console.log("\u26A0\uFE0F  Skipping ".concat(company.company_name, " (email bounced previously)"));
                            summary.errors.push("".concat(company.company_name, ": Email bounced previously"));
                            return [3 /*break*/, 9];
                        }
                        if (company.email_suppressed) {
                            console.log("\u26A0\uFE0F  Skipping ".concat(company.company_name, " (email suppressed)"));
                            summary.errors.push("".concat(company.company_name, ": Email suppressed"));
                            return [3 /*break*/, 9];
                        }
                        console.log("\uD83D\uDCE7 Sending email to ".concat(company.company_name, " (").concat(company.contact_email, ")"));
                        templateId  company.tier  'tier-1' ? 'a' : 'b';
                        return [4 /*yield*/, sendEmailWithRetry({
                                to: company.contact_email,
                                contactName: company.contact_name || undefined,
                                companyName: company.company_name,
                                contactPhone: company.contact_phone || undefined,
                                templateId: templateId
                            }, env, 3 // Max 3 retries
                            )];
                    case 4:
                        result  _a.sent();
                        summary.companiesProcessed++;
                        if (!result.success) return [3 /*break*/, 6];
                        summary.emailsSent++;
                        console.log("\u2705 Email sent to ".concat(company.company_name));
                        // Update prospect status
                        return [4 /*yield*/, updateProspectStatus(env, company.id, {
                                email_sent: true,
                                status: 'contacted',
                                last_contacted: new Date().toISOString()
                            })];
                    case 5:
                        // Update prospect status
                        _a.sent();
                        return [3 /*break*/, 7];
                    case 6:
                        summary.emailsFailed++;
                        errorMsg  result.error || 'Unknown error';
                        if (result.rateLimited) {
                            summary.rateLimitHit  true;
                            console.log("\u26A0\uFE0F  Rate limit reached, stopping...");
                            summary.errors.push("Rate limit reached: ".concat(errorMsg));
                            return [3 /*break*/, 10]; // Stop processing if rate limited
                        }
                        console.log("\u274C Failed to send to ".concat(company.company_name, ": ").concat(errorMsg));
                        summary.errors.push("".concat(company.company_name, ": ").concat(errorMsg));
                        _a.label  7;
                    case 7: 
                    // Small delay between emails (500ms) to avoid hitting rate limits
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 500); })];
                    case 8:
                        // Small delay between emails (500ms) to avoid hitting rate limits
                        _a.sent();
                        _a.label  9;
                    case 9:
                        _i++;
                        return [3 /*break*/, 3];
                    case 10:
                        // Step 3: Update daily metrics
                        console.log("\uD83D\uDCCA Updating daily metrics...");
                        return [4 /*yield*/, updateDailyMetrics(env, summary)];
                    case 11:
                        _a.sent();
                        console.log("\u2705 Cron job completed");
                        console.log("\uD83D\uDCCA Summary: ".concat(summary.emailsSent, " sent, ").concat(summary.emailsFailed, " failed"));
                        return [2 /*return*/, new Response(JSON.stringify({
                                success: true,
                                summary: summary
                            }), {
                                headers: { 'Content-Type': 'application/json' }
                            })];
                    case 12:
                        error_1  _a.sent();
                        errorMsg  error_1 instanceof Error ? error_1.message : 'Unknown error';
                        console.error("\u274C Cron job failed: ".concat(errorMsg));
                        summary.errors.push("Fatal error: ".concat(errorMsg));
                        // Log to Supabase
                        return [4 /*yield*/, logAutomationError(env, 'cron_execution', errorMsg)];
                    case 13:
                        // Log to Supabase
                        _a.sent();
                        return [2 /*return*/, new Response(JSON.stringify({
                                success: false,
                                error: errorMsg,
                                summary: summary
                            }), {
                                status: 500,
                                headers: { 'Content-Type': 'application/json' }
                            })];
                    case 14: return [2 /*return*/];
                }
            });
        });
    },
    // HTTP endpoint for manual testing
    fetch: function (request, env, ctx) {
        return __awaiter(this, void 0, void 0, function () {
            var url, authHeader, scheduledEvent;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url  new URL(request.url);
                        if (url.pathname  '/health') {
                            return [2 /*return*/, new Response(JSON.stringify({
                                    status: 'ok',
                                    timestamp: new Date().toISOString(),
                                    service: 'nextvision-outreach-worker'
                                }), {
                                    headers: { 'Content-Type': 'application/json' }
                                })];
                        }
                        if (!(url.pathname  '/trigger' && request.method  'POST')) return [3 /*break*/, 2];
                        authHeader  request.headers.get('Authorization');
                        if (authHeader ! "Bearer ".concat(env.SUPABASE_SERVICE_KEY)) {
                            return [2 /*return*/, new Response('Unauthorized', { status: 401 })];
                        }
                        scheduledEvent  request;
                        return [4 /*yield*/, scheduled(scheduledEvent, env, ctx)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2: return [2 /*return*/, new Response('Not found', { status: 404 })];
                }
            });
        });
    }
};
function fetchCompanies(env) {
    return __awaiter(this, void 0, void 0, function () {
        var response, companies, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch("".concat(env.SUPABASE_URL, "/rest/v1/prospects?selectid,company_name,tier,contact_email,contact_name,contact_phone,status,phase,email_bounced,email_suppressed&statuseq.cold&phaseeq.Phase%201&email_bouncedis.false&email_suppressedis.false&ordertier.asc&limit10"), {
                            headers: {
                                'apikey': env.SUPABASE_SERVICE_KEY,
                                'Authorization': "Bearer ".concat(env.SUPABASE_SERVICE_KEY)
                            }
                        })];
                case 1:
                    response  _a.sent();
                    if (!response.ok) {
                        throw new Error("Failed to fetch companies: ".concat(response.status));
                    }
                    return [4 /*yield*/, response.json()];
                case 2:
                    companies  _a.sent();
                    console.log("\u2705 Fetched ".concat(companies.length, " companies from Supabase"));
                    return [2 /*return*/, companies];
                case 3:
                    error_2  _a.sent();
                    console.error('❌ Error fetching companies:', error_2);
                    throw error_2;
                case 4: return [2 /*return*/];
            }
        });
    });
}
function sendEmailWithRetry(params, env, maxRetries) {
    return __awaiter(this, void 0, void 0, function () {
        var lastError, _loop_1, attempt, state_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _loop_1  function (attempt) {
                        var result, delay_1;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    console.log("\uD83D\uDD04 Attempt ".concat(attempt, "/").concat(maxRetries, " for ").concat(params.to));
                                    return [4 /*yield*/, sendEmailDirect(params, env)];
                                case 1:
                                    result  _b.sent();
                                    if (result.success) {
                                        return [2 /*return*/, { value: result }];
                                    }
                                    lastError  result.error;
                                    if (result.rateLimited) {
                                        return [2 /*return*/, { value: result }];
                                    }
                                    if (!(attempt < maxRetries)) return [3 /*break*/, 3];
                                    delay_1  Math.pow(2, attempt - 1) * 1000;
                                    console.log("\u23F3 Waiting ".concat(delay_1, "ms before retry..."));
                                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, delay_1); })];
                                case 2:
                                    _b.sent();
                                    _b.label  3;
                                case 3: return [2 /*return*/];
                            }
                        });
                    };
                    attempt  1;
                    _a.label  1;
                case 1:
                    if (!(attempt < maxRetries)) return [3 /*break*/, 4];
                    return [5 /*yield**/, _loop_1(attempt)];
                case 2:
                    state_1  _a.sent();
                    if (typeof state_1  "object")
                        return [2 /*return*/, state_1.value];
                    _a.label  3;
                case 3:
                    attempt++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/, {
                        success: false,
                        error: "Failed after ".concat(maxRetries, " attempts: ").concat(lastError)
                    }];
            }
        });
    });
}
function sendEmailDirect(params, env) {
    return __awaiter(this, void 0, void 0, function () {
        var to, contactName, companyName, contactPhone, _a, templateId, todayEmails, template, subject, htmlBody, response, messageId, error, error_3, errorMsg;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    to  params.to, contactName  params.contactName, companyName  params.companyName, contactPhone  params.contactPhone, _a  params.templateId, templateId  _a  void 0 ? 'a' : _a;
                    _b.label  1;
                case 1:
                    _b.trys.push([1, 9, , 11]);
                    return [4 /*yield*/, getTodayEmailCount(env)];
                case 2:
                    todayEmails  _b.sent();
                    if (todayEmails > 10) {
                        console.log("Rate limit reached: ".concat(todayEmails, "/10 emails sent today"));
                        return [2 /*return*/, {
                                success: false,
                                rateLimited: true,
                                error: 'Daily rate limit reached (10 emails/day)'
                            }];
                    }
                    template  getEmailTemplate(templateId);
                    subject  template.subject;
                    htmlBody  template.body
                        .replace(/{contact_name}/g, contactName || 'İlgili')
                        .replace(/{company_name}/g, companyName)
                        .replace(/{contact_phone}/g, contactPhone || '+90 XXX XXX XX XX');
                    // Send via SendGrid API
                    console.log("Sending email to ".concat(to, " using template ").concat(templateId));
                    return [4 /*yield*/, fetch('https://api.sendgrid.com/v3/mail/send', {
                            method: 'POST',
                            headers: {
                                'Authorization': "Bearer ".concat(env.SENDGRID_API_KEY),
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                personalizations: [{
                                        to: [{ email: to, name: contactName || 'İlgili' }],
                                        subject: subject,
                                        custom_args: {
                                            company_name: companyName,
                                            template_id: templateId,
                                            sent_at: new Date().toISOString()
                                        }
                                    }],
                                from: {
                                    email: 'info@nextvision.ai',
                                    name: 'NextVision — Bursa Otomotiv'
                                },
                                reply_to: {
                                    email: 'info@nextvision.ai',
                                    name: 'NextVision'
                                },
                                content: [{
                                        type: 'text/html',
                                        value: htmlBody
                                    }]
                            })
                        })];
                case 3:
                    response  _b.sent();
                    if (!response.ok) return [3 /*break*/, 5];
                    messageId  response.headers.get('X-Message-ID');
                    return [4 /*yield*/, logEmailSent(env, to, templateId, messageId, companyName)];
                case 4:
                    _b.sent();
                    console.log("Email sent successfully to ".concat(to, ", Message ID: ").concat(messageId));
                    return [2 /*return*/, {
                            success: true,
                            messageId: messageId || undefined
                        }];
                case 5: return [4 /*yield*/, response.text()];
                case 6:
                    error  _b.sent();
                    return [4 /*yield*/, logEmailError(env, to, error, companyName)];
                case 7:
                    _b.sent();
                    console.error("SendGrid API error for ".concat(to, ": ").concat(response.status, " - ").concat(error));
                    return [2 /*return*/, {
                            success: false,
                            error: "SendGrid API error: ".concat(response.status, " ").concat(error)
                        }];
                case 8: return [3 /*break*/, 11];
                case 9:
                    error_3  _b.sent();
                    errorMsg  error_3 instanceof Error ? error_3.message : 'Unknown error';
                    return [4 /*yield*/, logEmailError(env, to, errorMsg, companyName)];
                case 10:
                    _b.sent();
                    console.error("Exception sending email to ".concat(to, ":"), errorMsg);
                    return [2 /*return*/, {
                            success: false,
                            error: errorMsg
                        }];
                case 11: return [2 /*return*/];
            }
        });
    });
}
function getTodayEmailCount(env) {
    return __awaiter(this, void 0, void 0, function () {
        var today, response, data, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    today  new Date().toISOString().split('T')[0];
                    return [4 /*yield*/, fetch("".concat(env.SUPABASE_URL, "/rest/v1/activity_logs?selectid&event_typeeq.email_sent&created_atgte.").concat(today), {
                            headers: {
                                'apikey': env.SUPABASE_SERVICE_KEY,
                                'Authorization': "Bearer ".concat(env.SUPABASE_SERVICE_KEY)
                            }
                        })];
                case 1:
                    response  _a.sent();
                    if (!response.ok) return [3 /*break*/, 3];
                    return [4 /*yield*/, response.json()];
                case 2:
                    data  _a.sent();
                    return [2 /*return*/, data.length || 0];
                case 3: return [3 /*break*/, 5];
                case 4:
                    error_4  _a.sent();
                    console.error('Error checking email count:', error_4);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/, 0];
            }
        });
    });
}
function getEmailTemplate(templateId) {
    // Simplified templates (production would use full HTML)
    var templates  {
        'a': {
            subject: 'Bursa Otomotiv — İş Güvenliği Benchmark Raporu',
            body: '<p>Merhaba {contact_name},</p><p>Bursa', 'daki 40+ otomotiv tedarikçisinin iş güvenliği verilerini analiz ediyoruz. {company_name} için 5 dakikalık demo ister misiniz?</p>': 
        },
        'b': {
            subject: 'Bursa Otomotiv — İSG Uzmanları Arasında Benchmark Raporu',
            body: '<p>Merhaba {contact_name},</p><p>Anonim benchmark raporuna katılmak ister misiniz? {company_name} için demo planlayın.</p>'
        },
        'c': {
            subject: 'Bursa Otomotiv — İş Güvenliği Denetim Hazırlığı',
            body: '<p>Merhaba {contact_name},</p><p>Yaklaşan denetimlere hazırlanın. {company_name} için analiz demo.</p>'
        }
    };
    return templates[templateId] || templates['a'];
}
function logEmailSent(env, to, templateId, messageId, companyName) {
    return __awaiter(this, void 0, void 0, function () {
        var error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, fetch("".concat(env.SUPABASE_URL, "/rest/v1/activity_logs"), {
                            method: 'POST',
                            headers: {
                                'apikey': env.SUPABASE_SERVICE_KEY,
                                'Authorization': "Bearer ".concat(env.SUPABASE_SERVICE_KEY),
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                event_type: 'email_sent',
                                event_metadata: {
                                    to: to,
                                    template_id: templateId,
                                    message_id: messageId,
                                    company_name: companyName,
                                    timestamp: new Date().toISOString()
                                }
                            })
                        })];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    error_5  _a.sent();
                    console.error('Error logging email sent:', error_5);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function logEmailError(env, to, error, companyName) {
    return __awaiter(this, void 0, void 0, function () {
        var error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, fetch("".concat(env.SUPABASE_URL, "/rest/v1/activity_logs"), {
                            method: 'POST',
                            headers: {
                                'apikey': env.SUPABASE_SERVICE_KEY,
                                'Authorization': "Bearer ".concat(env.SUPABASE_SERVICE_KEY),
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                event_type: 'automation_error',
                                event_metadata: {
                                    context: 'send_email',
                                    to: to,
                                    company_name: companyName,
                                    error: error,
                                    timestamp: new Date().toISOString()
                                }
                            })
                        })];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    error_6  _a.sent();
                    console.error('Error logging email error:', error_6);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function updateProspectStatus(env, prospectId, updates) {
    return __awaiter(this, void 0, void 0, function () {
        var error_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, fetch("".concat(env.SUPABASE_URL, "/rest/v1/prospects?ideq.").concat(prospectId), {
                            method: 'PATCH',
                            headers: {
                                'apikey': env.SUPABASE_SERVICE_KEY,
                                'Authorization': "Bearer ".concat(env.SUPABASE_SERVICE_KEY),
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(updates)
                        })];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    error_7  _a.sent();
                    console.error('❌ Error updating prospect status:', error_7);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function updateDailyMetrics(env, summary) {
    return __awaiter(this, void 0, void 0, function () {
        var today, existing, _a, error_8;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 8, , 9]);
                    today  new Date().toISOString().split('T')[0];
                    return [4 /*yield*/, fetch("".concat(env.SUPABASE_URL, "/rest/v1/daily_metrics?dateeq.").concat(today), {
                            headers: {
                                'apikey': env.SUPABASE_SERVICE_KEY,
                                'Authorization': "Bearer ".concat(env.SUPABASE_SERVICE_KEY)
                            }
                        })];
                case 1:
                    existing  _b.sent();
                    _a  existing.ok;
                    if (!_a) return [3 /*break*/, 3];
                    return [4 /*yield*/, existing.json()];
                case 2:
                    _a  (_b.sent()).length > 0;
                    _b.label  3;
                case 3:
                    if (!_a) return [3 /*break*/, 5];
                    // Update existing metrics
                    return [4 /*yield*/, fetch("".concat(env.SUPABASE_URL, "/rest/v1/daily_metrics?dateeq.").concat(today), {
                            method: 'PATCH',
                            headers: {
                                'apikey': env.SUPABASE_SERVICE_KEY,
                                'Authorization': "Bearer ".concat(env.SUPABASE_SERVICE_KEY),
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                emails_sent: summary.emailsSent
                            })
                        })];
                case 4:
                    // Update existing metrics
                    _b.sent();
                    return [3 /*break*/, 7];
                case 5: 
                // Insert new metrics
                return [4 /*yield*/, fetch("".concat(env.SUPABASE_URL, "/rest/v1/daily_metrics"), {
                        method: 'POST',
                        headers: {
                            'apikey': env.SUPABASE_SERVICE_KEY,
                            'Authorization': "Bearer ".concat(env.SUPABASE_SERVICE_KEY),
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            date: today,
                            emails_sent: summary.emailsSent,
                            emails_delivered: 0,
                            emails_opened: 0,
                            emails_replied: 0,
                            calls_made: 0,
                            calls_connected: 0,
                            voicemails_left: 0,
                            demos_booked: 0,
                            pilots_converted: 0
                        })
                    })];
                case 6:
                    // Insert new metrics
                    _b.sent();
                    _b.label  7;
                case 7:
                    console.log("\u2705 Daily metrics updated");
                    return [3 /*break*/, 9];
                case 8:
                    error_8  _b.sent();
                    console.error('❌ Error updating daily metrics:', error_8);
                    return [3 /*break*/, 9];
                case 9: return [2 /*return*/];
            }
        });
    });
}
function logAutomationError(env, context, error) {
    return __awaiter(this, void 0, void 0, function () {
        var err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, fetch("".concat(env.SUPABASE_URL, "/rest/v1/activity_logs"), {
                            method: 'POST',
                            headers: {
                                'apikey': env.SUPABASE_SERVICE_KEY,
                                'Authorization': "Bearer ".concat(env.SUPABASE_SERVICE_KEY),
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                event_type: 'automation_error',
                                event_metadata: {
                                    context: context,
                                    error: error,
                                    timestamp: new Date().toISOString()
                                }
                            })
                        })];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    err_1  _a.sent();
                    console.error('❌ Error logging automation error:', err_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
