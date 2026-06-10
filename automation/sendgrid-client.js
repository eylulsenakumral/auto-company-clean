"use strict";
// SendGrid Email Client — Production-Ready Implementation
// Auto Company Cycle #37 — Day 1 Build
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
exports.sendEmail  sendEmail;
exports.handleBounceWebhook  handleBounceWebhook;
exports.handleSpamReportWebhook  handleSpamReportWebhook;
exports.handleDeliveryWebhook  handleDeliveryWebhook;
// Email templates (HTML)
var TEMPLATE_A_HTML  "<!DOCTYPE html>\n<html>\n<head>\n<meta charset\"UTF-8\">\n<meta name\"viewport\" content\"widthdevice-width, initial-scale1.0\">\n<style>\nbody { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }\n.header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }\n.cta-button { display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }\n.footer { font-size: 12px; color: #6c757d; margin-top: 30px; border-top: 1px solid #dee2e6; padding-top: 15px; }\n</style>\n</head>\n<body>\n<div class\"header\">\n<h2>Bursa Otomotiv Sekt\u00F6r\u00FC \u2014 \u0130\u015F G\u00FCvenli\u011Fi Analizi</h2>\n</div>\n\n<p>Merhaba {contact_name},</p>\n\n<p>Bursa''daki 40+ otomotiv tedarik\u00E7isinin i\u015F g\u00FCvenli\u011Fi verilerini analiz eden bir sistem kurduk. \u0130SG uzmanlar\u0131 aras\u0131nda anonim benchmark raporu haz\u0131rl\u0131yoruz \u2014 kat\u0131l\u0131m tamamen \u00FCcretsiz.</p>\n\n<p>Sizin {company_name} verilerinizi dahil etmek ister misiniz? 5 dakikal\u0131k demo ile sonu\u00E7lar\u0131 g\u00F6rebilirsiniz.</p>\n\n<a href\"https://calendly.com/nextvision-demo/bursa-automotive\" class\"cta-button\">Demo Planla</a>\n\n<p>Sayg\u0131lar\u0131mla,<br>\n<strong>NextVision</strong></p>\n\n<p><em>CE: {contact_phone} | Web: nextvision.ai</em></p>\n\n<div class\"footer\">\n<p>Bu e-posta Bursa otomotiv sekt\u00F6r\u00FCndeki i\u015F g\u00FCvenli\u011Fi benchmark raporu kapsam\u0131nda g\u00F6nderilmi\u015Ftir. Herhangi bir sorunuz varsa l\u00FCtfen cevap yaz\u0131n.</p>\n</div>\n</body>\n</html>";
var TEMPLATE_B_HTML  "<!DOCTYPE html>\n<html>\n<head>\n<meta charset\"UTF-8\">\n<meta name\"viewport\" content\"widthdevice-width, initial-scale1.0\">\n<style>\nbody { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }\n.header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }\n.cta-button { display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }\n.footer { font-size: 12px; color: #6c757d; margin-top: 30px; border-top: 1px solid #dee2e6; padding-top: 15px; }\n</style>\n</head>\n<body>\n<div class\"header\">\n<h2>Bursa Otomotiv \u2014 \u0130\u015F G\u00FCvenli\u011Fi Benchmark''a Kat\u0131l\u0131n</h2>\n</div>\n\n<p>Merhaba {contact_name},</p>\n\n<p>Bursa''daki 40+ otomotiv tedarik\u00E7isinin i\u015F g\u00FCvenli\u011Fi verilerini analiz ediyoruz. Anonim benchmark raporu haz\u0131rl\u0131yoruz \u2014 \u015Firket isimleri gizli, sadece sekt\u00F6r verisi.</p>\n\n<p>Di\u011Fer fabrikalarla k\u0131yasla ve {company_name}''\u0131n nerede oldu\u011Funu g\u00F6r\u00FCn. 5 dakikal\u0131k demo ile sonu\u00E7lar\u0131 g\u00F6rmek ister misiniz?</p>\n\n<a href\"https://calendly.com/nextvision-demo/bursa-automotive\" class\"cta-button\">Demo Planla</a>\n\n<p>Sayg\u0131lar\u0131mla,<br>\n<strong>NextVision</strong></p>\n\n<div class\"footer\">\n<p>Bu e-posta Bursa otomotiv sekt\u00F6r\u00FCndeki i\u015F g\u00FCvenli\u011Fi benchmark raporu kapsam\u0131nda g\u00F6nderilmi\u015Ftir. Cevap bekliyoruz.</p>\n</div>\n</body>\n</html>";
var TEMPLATE_C_HTML  "<!DOCTYPE html>\n<html>\n<head>\n<meta charset\"UTF-8\">\n<meta name\"viewport\" content\"widthdevice-width, initial-scale1.0\">\n<style>\nbody { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }\n.header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }\n.cta-button { display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }\n.footer { font-size: 12px; color: #6c757d; margin-top: 30px; border-top: 1px solid #dee2e6; padding-top: 15px; }\n</style>\n</head>\n<body>\n<div class\"header\">\n<h2>\u0130\u015F G\u00FCvenli\u011Fi Denetim Haz\u0131rl\u0131\u011F\u0131 \u2014 Otomatik Analiz</h2>\n</div>\n\n<p>Merhaba {contact_name},</p>\n\n<p>Yakla\u015Fan i\u015F g\u00FCvenli\u011Fi denetimlerine haz\u0131rlan\u0131rken {company_name}''\u0131n eksiklerini \u00F6nceden bilmek ister misiniz?</p>\n\n<p>Bursa otomotiv sekt\u00F6r\u00FCndeki 40+ fabrikayla k\u0131yaslanan anonim bir analiz sistemi kurduk. CE nedir, nerede eksiksiniz \u2014 5 dakikada \u00F6\u011Frenin.</p>\n\n<a href\"https://calendly.com/nextvision-demo/bursa-automotive\" class\"cta-button\">Demo Planla</a>\n\n<p>Sayg\u0131lar\u0131mla,<br>\n<strong>NextVision</strong></p>\n\n<div class\"footer\">\n<p>Bu e-posta yakla\u015Fan i\u015F g\u00FCvenli\u011Fi denetimleri i\u00E7in haz\u0131rl\u0131k arac\u0131 olarak sunulmu\u015Ftur. Sorular\u0131n\u0131z\u0131 cevaplayabiliriz.</p>\n</div>\n</body>\n</html>";
// Environment variables (set in Cloudflare Workers)
var SENDGRID_API_KEY  process.env.SENDGRID_API_KEY || '';
var SUPABASE_URL  process.env.SUPABASE_URL || '';
var SUPABASE_SERVICE_KEY  process.env.SUPABASE_SERVICE_KEY || '';
function sendEmail(params) {
    return __awaiter(this, void 0, void 0, function () {
        var to, contactName, companyName, contactPhone, _a, templateId, todayEmails, template, subject, htmlBody, response, messageId, error, error_1, errorMsg;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    to  params.to, contactName  params.contactName, companyName  params.companyName, contactPhone  params.contactPhone, _a  params.templateId, templateId  _a  void 0 ? 'a' : _a;
                    _b.label  1;
                case 1:
                    _b.trys.push([1, 9, , 11]);
                    // Validate inputs
                    if (!to || !companyName) {
                        return [2 /*return*/, {
                                success: false,
                                error: 'Missing required parameters: to and companyName'
                            }];
                    }
                    return [4 /*yield*/, getTodayEmailCount()];
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
                                'Authorization': "Bearer ".concat(SENDGRID_API_KEY),
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
                    return [4 /*yield*/, logEmailSent(to, templateId, messageId, companyName)];
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
                    return [4 /*yield*/, logEmailError(to, error, companyName)];
                case 7:
                    _b.sent();
                    console.error("SendGrid API error for ".concat(to, ": ").concat(response.status, " - ").concat(error));
                    return [2 /*return*/, {
                            success: false,
                            error: "SendGrid API error: ".concat(response.status, " ").concat(error)
                        }];
                case 8: return [3 /*break*/, 11];
                case 9:
                    error_1  _b.sent();
                    errorMsg  error_1 instanceof Error ? error_1.message : 'Unknown error';
                    return [4 /*yield*/, logEmailError(to, errorMsg, companyName)];
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
function getTodayEmailCount() {
    return __awaiter(this, void 0, void 0, function () {
        var today, response, data, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    today  new Date().toISOString().split('T')[0];
                    return [4 /*yield*/, fetch("".concat(SUPABASE_URL, "/rest/v1/activity_logs?selectid&event_typeeq.email_sent&created_atgte.").concat(today), {
                            headers: {
                                'apikey': SUPABASE_SERVICE_KEY,
                                'Authorization': "Bearer ".concat(SUPABASE_SERVICE_KEY)
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
                    error_2  _a.sent();
                    console.error('Error checking email count:', error_2);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/, 0];
            }
        });
    });
}
function getEmailTemplate(templateId) {
    var templates  {
        'a': {
            subject: 'Bursa Otomotiv — İş Güvenliği Benchmark Raporu',
            body: TEMPLATE_A_HTML
        },
        'b': {
            subject: 'Bursa Otomotiv — İSG Uzmanları Arasında Benchmark Raporu',
            body: TEMPLATE_B_HTML
        },
        'c': {
            subject: 'Bursa Otomotiv — İş Güvenliği Denetim Hazırlığı',
            body: TEMPLATE_C_HTML
        }
    };
    return templates[templateId] || templates['a'];
}
function logEmailSent(to, templateId, messageId, companyName) {
    return __awaiter(this, void 0, void 0, function () {
        var error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, fetch("".concat(SUPABASE_URL, "/rest/v1/activity_logs"), {
                            method: 'POST',
                            headers: {
                                'apikey': SUPABASE_SERVICE_KEY,
                                'Authorization': "Bearer ".concat(SUPABASE_SERVICE_KEY),
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
                    error_3  _a.sent();
                    console.error('Error logging email sent:', error_3);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function logEmailError(to, error, companyName) {
    return __awaiter(this, void 0, void 0, function () {
        var error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, fetch("".concat(SUPABASE_URL, "/rest/v1/activity_logs"), {
                            method: 'POST',
                            headers: {
                                'apikey': SUPABASE_SERVICE_KEY,
                                'Authorization': "Bearer ".concat(SUPABASE_SERVICE_KEY),
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
                    error_4  _a.sent();
                    console.error('Error logging email error:', error_4);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
// Webhook handlers for Cloudflare Worker
function handleBounceWebhook(event) {
    return __awaiter(this, void 0, void 0, function () {
        var email, reason, timestamp, status, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    email  event.email, reason  event.reason, timestamp  event.timestamp, status  event.status;
                    console.log("Bounce detected for ".concat(email, ": ").concat(reason));
                    _a.label  1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch("".concat(SUPABASE_URL, "/rest/v1/activity_logs"), {
                            method: 'POST',
                            headers: {
                                'apikey': SUPABASE_SERVICE_KEY,
                                'Authorization': "Bearer ".concat(SUPABASE_SERVICE_KEY),
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                event_type: 'email_bounced',
                                event_metadata: {
                                    email: email,
                                    reason: reason,
                                    status: status,
                                    bounce_type: (reason  null || reason  void 0 ? void 0 : reason.includes('invalid')) ? 'hard' : 'soft',
                                    timestamp: timestamp
                                }
                            })
                        })];
                case 2:
                    _a.sent();
                    // Mark prospect email as invalid
                    return [4 /*yield*/, fetch("".concat(SUPABASE_URL, "/rest/v1/prospects?contact_emaileq.").concat(email), {
                            method: 'PATCH',
                            headers: {
                                'apikey': SUPABASE_SERVICE_KEY,
                                'Authorization': "Bearer ".concat(SUPABASE_SERVICE_KEY),
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                email_bounced: true
                            })
                        })];
                case 3:
                    // Mark prospect email as invalid
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    error_5  _a.sent();
                    console.error('Error handling bounce webhook:', error_5);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function handleSpamReportWebhook(event) {
    return __awaiter(this, void 0, void 0, function () {
        var email, timestamp, error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    email  event.email, timestamp  event.timestamp;
                    console.log("Spam report for ".concat(email, " \u2014 suppressing from future sends"));
                    _a.label  1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch("".concat(SUPABASE_URL, "/rest/v1/activity_logs"), {
                            method: 'POST',
                            headers: {
                                'apikey': SUPABASE_SERVICE_KEY,
                                'Authorization': "Bearer ".concat(SUPABASE_SERVICE_KEY),
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                event_type: 'email_spam_report',
                                event_metadata: {
                                    email: email,
                                    timestamp: timestamp,
                                    action: 'suppressed_from_future_emails'
                                }
                            })
                        })];
                case 2:
                    _a.sent();
                    // Suppress email from future sends
                    return [4 /*yield*/, fetch("".concat(SUPABASE_URL, "/rest/v1/prospects?contact_emaileq.").concat(email), {
                            method: 'PATCH',
                            headers: {
                                'apikey': SUPABASE_SERVICE_KEY,
                                'Authorization': "Bearer ".concat(SUPABASE_SERVICE_KEY),
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                email_suppressed: true
                            })
                        })];
                case 3:
                    // Suppress email from future sends
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    error_6  _a.sent();
                    console.error('Error handling spam report webhook:', error_6);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function handleDeliveryWebhook(event) {
    return __awaiter(this, void 0, void 0, function () {
        var email, timestamp, message_id, error_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    email  event.email, timestamp  event.timestamp, message_id  event.message_id;
                    console.log("Email delivered to ".concat(email, ", Message ID: ").concat(message_id));
                    _a.label  1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, fetch("".concat(SUPABASE_URL, "/rest/v1/activity_logs"), {
                            method: 'POST',
                            headers: {
                                'apikey': SUPABASE_SERVICE_KEY,
                                'Authorization': "Bearer ".concat(SUPABASE_SERVICE_KEY),
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                event_type: 'email_delivered',
                                event_metadata: {
                                    email: email,
                                    message_id: message_id,
                                    timestamp: timestamp
                                }
                            })
                        })];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_7  _a.sent();
                    console.error('Error handling delivery webhook:', error_7);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
