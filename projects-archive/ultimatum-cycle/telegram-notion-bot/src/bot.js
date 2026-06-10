"use strict";
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
var grammy_1  require("grammy");
var auto_retry_1  require("@grammyjs/auto-retry");
var path_1  require("path");
var fs_1  require("fs");
var database_1  require("./database");
// Current directory
var __dirname  (0, path_1.resolve)('.');
var token  process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
    throw new Error('TELEGRAM_BOT_TOKEN environment variable is required');
}
var bot  new grammy_1.Bot(token);
// @ts-ignore
bot.use((0, auto_retry_1.autoRetry)());
var db  new database_1.OrdersDatabase();
var templates  [];
try {
    var templatesPath  (0, path_1.join)(__dirname, '..', 'templates.json');
    var templatesContent  (0, fs_1.readFileSync)(templatesPath, 'utf-8');
    templates  JSON.parse(templatesContent);
    console.log("\u2705 ".concat(templates.length, " \u015Fablon y\u00FCklendi"));
}
catch (err) {
    console.error('❌ Şablonlar yüklenemedi:', err);
}
// @ts-ignore
bot.use((0, grammy_1.session)({
    initial: function () { return ({
        userId: 0,
    }); },
}));
bot.command('start', function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var userId;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                userId  ((_a  ctx.from)  null || _a  void 0 ? void 0 : _a.id) || 0;
                // @ts-ignore
                ctx.session.userId  userId;
                return [4 /*yield*/, ctx.reply("\n\uD83D\uDE80 *Telegram Notion Templates'a Ho\u015F Geldin!*\n\nBen, \u00FCretkenlik ara\u00E7lar\u0131n i\u00E7in haz\u0131r Notion \u015Fablonlar\u0131 sunan bir botum. \u0130htiyac\u0131n olan \u015Fablonu bul, sat\u0131n al ve hemen kullanmaya ba\u015Fla!\n\n\uD83D\uDCE6 *Ne Sunuyorum:*\n\u2022 Proje Y\u00F6netimi \u015Eablonlar\u0131\n\u2022 \u0130\u00E7erik Planlama Sistemleri\n\u2022 Gelir Takip Tablolar\u0131\n\u2022 Ve daha fazlas\u0131...\n\n\uD83D\uDC8E *\u00D6deme:*\nTelegram Stars ile g\u00FCvenli ve h\u0131zl\u0131 \u00F6deme. Kredi kart\u0131 gerekmez.\n\n\uD83D\uDC47 Ba\u015Flamak i\u00E7in /templates komutunu kullan.\n", { parse_mode: 'Markdown' })];
            case 1:
                _b.sent();
                return [2 /*return*/];
        }
    });
}); });
bot.command('help', function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, ctx.reply("\n\uD83D\uDCDA *Yard\u0131m Rehberi*\n\n*Komutlar:*\n/start - Botu ba\u015Flat ve kar\u015F\u0131lama mesaj\u0131n\u0131 g\u00F6r\n/templates - Mevcut Notion \u015Fablonlar\u0131n\u0131 listele\n/myorders - Sat\u0131n ald\u0131\u011F\u0131m \u015Fablonlar\u0131 g\u00F6r\n/help - Bu yard\u0131m mesaj\u0131n\u0131 g\u00F6ster\n\n*\u015Eablon Sat\u0131n Alma:*\n1. /templates ile \u015Fablonlar\u0131 g\u00F6r\n2. Bir \u015Fablon se\u00E7\n3. \u2B50 Stars ile \u00F6deme yap\n4. Notion \u015Fablon linki an\u0131nda teslim edilir\n\n*Destek:*\nBir sorun mu ya\u015Fad\u0131n? @tolgabrk \u00FCzerinden ileti\u015Fime ge\u00E7.\n", { parse_mode: 'Markdown' })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
bot.command('templates', function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var keyboard;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!(templates.length  0)) return [3 /*break*/, 2];
                return [4 /*yield*/, ctx.reply('⚠️ Şu anda mevcut şablon yok. Lütfen daha sonra tekrar kontrol et.')];
            case 1:
                _a.sent();
                return [2 /*return*/];
            case 2:
                keyboard  grammy_1.InlineKeyboard.from(templates.map(function (template) { return [
                    {
                        text: "".concat(template.emoji || '📦', " ").concat(template.name, " - \u2B50 ").concat(template.price_stars),
                        callback_data: "template_".concat(template.id),
                    },
                ]; }));
                return [4 /*yield*/, ctx.reply("\uD83D\uDCE6 *Mevcut Notion \u015Eablonlar\u0131*\n\n" +
                        "A\u015Fa\u011F\u0131daki \u015Fablonlardan birini se\u00E7erek detaylar\u0131 g\u00F6r ve sat\u0131n al:\n\n" +
                        "\uD83D\uDC8E Telegram Stars ile g\u00FCvenli \u00F6deme\n" +
                        "\uD83D\uDE80 An\u0131nda teslimat", { parse_mode: 'Markdown', reply_markup: keyboard })];
            case 3:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
bot.callbackQuery(/^template_(.+)$/, function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var templateId, template, featuresList, tagsList, keyboard;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                templateId  ctx.match[1];
                template  templates.find(function (t) { return t.id  templateId; });
                if (!!template) return [3 /*break*/, 2];
                return [4 /*yield*/, ctx.answerCallbackQuery('❌ Şablon bulunamadı.')];
            case 1:
                _a.sent();
                return [2 /*return*/];
            case 2:
                // @ts-ignore
                ctx.session.selectedTemplate  templateId;
                featuresList  template.features.map(function (f) { return "\u2705 ".concat(f); }).join('\n');
                tagsList  template.tags.map(function (t) { return "#".concat(t); }).join(' ');
                keyboard  new grammy_1.InlineKeyboard()
                    .text("\u2B50 ".concat(template.price_stars, " Stars ile Sat\u0131n Al"), "buy_".concat(template.id))
                    .row()
                    .text('« Geri Dön', 'back_to_templates');
                return [4 /*yield*/, ctx.editMessageText("\uD83D\uDCE6 *".concat(template.name, "*\n\n") +
                        "\uD83D\uDCDD *A\u00E7\u0131klama:*\n".concat(template.description, "\n\n") +
                        "\u2728 *\u00D6zellikler:*\n".concat(featuresList, "\n\n") +
                        "\uD83C\uDFF7\uFE0F *Etiketler:* ".concat(tagsList, "\n\n") +
                        "\uD83D\uDCB0 *Fiyat:* \u2B50 ".concat(template.price_stars, " Stars\n\n") +
                        "\uD83D\uDE80 Sat\u0131n almak i\u00E7in butona t\u0131kla ve an\u0131nda Notion \u015Fablonuna eri\u015F!", { parse_mode: 'Markdown', reply_markup: keyboard })];
            case 3:
                _a.sent();
                return [4 /*yield*/, ctx.answerCallbackQuery()];
            case 4:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
bot.callbackQuery('back_to_templates', function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var keyboard;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                keyboard  grammy_1.InlineKeyboard.from(templates.map(function (template) { return [
                    {
                        text: "".concat(template.emoji || '📦', " ").concat(template.name, " - \u2B50 ").concat(template.price_stars),
                        callback_data: "template_".concat(template.id),
                    },
                ]; }));
                return [4 /*yield*/, ctx.editMessageText("\uD83D\uDCE6 *Mevcut Notion \u015Eablonlar\u0131*\n\n" +
                        "A\u015Fa\u011F\u0131daki \u015Fablonlardan birini se\u00E7erek detaylar\u0131 g\u00F6r ve sat\u0131n al:\n\n" +
                        "\uD83D\uDC8E Telegram Stars ile g\u00FCvenli \u00F6deme\n" +
                        "\uD83D\uDE80 An\u0131nda teslimat", { parse_mode: 'Markdown', reply_markup: keyboard })];
            case 1:
                _a.sent();
                return [4 /*yield*/, ctx.answerCallbackQuery()];
            case 2:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
bot.callbackQuery(/^buy_(.+)$/, function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var templateId, template, userId, username, order, keyboard, err_1;
    var _a, _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                templateId  ctx.match[1];
                template  templates.find(function (t) { return t.id  templateId; });
                if (!!template) return [3 /*break*/, 2];
                return [4 /*yield*/, ctx.answerCallbackQuery('❌ Şablon bulunamadı.')];
            case 1:
                _d.sent();
                return [2 /*return*/];
            case 2:
                userId  ((_a  ctx.from)  null || _a  void 0 ? void 0 : _a.id) || 0;
                username  (_b  ctx.from)  null || _b  void 0 ? void 0 : _b.username;
                _d.label  3;
            case 3:
                _d.trys.push([3, 6, , 8]);
                order  db.createOrder({
                    telegram_user_id: userId,
                    telegram_username: username,
                    template_id: templateId,
                    amount_stars: template.price_stars,
                    payment_status: 'pending',
                });
                keyboard  new grammy_1.InlineKeyboard()
                    .url('⭐ Stars ile Ödeme Yap', "https://t.me/".concat(((_c  ctx.me)  null || _c  void 0 ? void 0 : _c.username) || 'bot', "?startpay_").concat(order.id))
                    .row()
                    .text('« Geri Dön', "template_".concat(templateId));
                return [4 /*yield*/, ctx.editMessageText("\uD83D\uDCB3 *\u00D6deme \u0130\u015Flemi*\n\n" +
                        "\uD83D\uDCE6 \u015Eablon: ".concat(template.name, "\n") +
                        "\uD83D\uDCB0 Tutar: \u2B50 ".concat(template.price_stars, " Stars\n\n") +
                        "A\u015Fa\u011F\u0131daki butona t\u0131klayarak \u00F6demeyi tamamla:\n\n" +
                        "\u2705 G\u00FCvenli Telegram Stars \u00F6demesi\n" +
                        "\uD83D\uDE80 An\u0131nda teslimat\n" +
                        "\uD83D\uDCE7 \u00D6deme onay\u0131yla birlikte Notion linki", { parse_mode: 'Markdown', reply_markup: keyboard })];
            case 4:
                _d.sent();
                return [4 /*yield*/, ctx.answerCallbackQuery()];
            case 5:
                _d.sent();
                return [3 /*break*/, 8];
            case 6:
                err_1  _d.sent();
                console.error('Order creation error:', err_1);
                return [4 /*yield*/, ctx.answerCallbackQuery('❌ Sipariş oluşturulurken hata oluştu.')];
            case 7:
                _d.sent();
                return [3 /*break*/, 8];
            case 8: return [2 /*return*/];
        }
    });
}); });
bot.command('myorders', function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, orders, message, _loop_1, _i, orders_1, order;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                userId  ((_a  ctx.from)  null || _a  void 0 ? void 0 : _a.id) || 0;
                orders  db.getOrdersByUser(userId);
                if (!(orders.length  0)) return [3 /*break*/, 2];
                return [4 /*yield*/, ctx.reply('📋 Henüz bir siparişin yok. /templates ile şablonları keşfet!')];
            case 1:
                _b.sent();
                return [2 /*return*/];
            case 2:
                message  '📋 *Sipariş Geçmişin*\n\n';
                _loop_1  function (order) {
                    var template  templates.find(function (t) { return t.id  order.template_id; });
                    var statusEmoji  order.payment_status  'completed' ? '✅' : '⏳';
                    message + "".concat(statusEmoji, " *").concat((template  null || template  void 0 ? void 0 : template.name) || order.template_id, "*\n");
                    message + "\uD83D\uDCB0 \u2B50 ".concat(order.amount_stars, " | ");
                    message + "\uD83D\uDCC5 ".concat(new Date(order.created_at || '').toLocaleDateString('tr-TR'), "\n");
                    if (order.payment_status  'completed') {
                        message + "\uD83C\uDF81 Teslim edildi \u2705\n";
                    }
                    message + '\n';
                };
                for (_i  0, orders_1  orders; _i < orders_1.length; _i++) {
                    order  orders_1[_i];
                    _loop_1(order);
                }
                return [4 /*yield*/, ctx.reply(message, { parse_mode: 'Markdown' })];
            case 3:
                _b.sent();
                return [2 /*return*/];
        }
    });
}); });
bot.on('pre_checkout_query', function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: 
            // @ts-ignore
            return [4 /*yield*/, ctx.answerPreCheckoutQuery({ ok: true })];
            case 1:
                // @ts-ignore
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
bot.on('message:successful_payment', function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var payment, chargeId, order, template, err_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                payment  ctx.message.successful_payment;
                if (!payment)
                    return [2 /*return*/];
                chargeId  payment.telegram_payment_charge_id;
                order  db.getOrderByPaymentChargeId(chargeId);
                if (!order) {
                    console.error('Order not found for charge:', chargeId);
                    return [2 /*return*/];
                }
                template  templates.find(function (t) { return t.id  order.template_id; });
                if (!template) {
                    console.error('Template not found:', order.template_id);
                    return [2 /*return*/];
                }
                db.updateOrderStatus(order.id, 'completed', new Date().toISOString(), ctx.message.message_id);
                _a.label  1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, ctx.reply("\uD83C\uDF89 *\u00D6deme Ba\u015Far\u0131l\u0131!*\n\n" +
                        "\uD83D\uDCE6 *".concat(template.name, "* \u015Fablonunu sat\u0131n ald\u0131n!\n\n") +
                        "\uD83D\uDD17 *Notion \u015Eablonu:*\n".concat(template.notion_url, "\n\n") +
                        "\uD83D\uDE4F Te\u015Fekk\u00FCrler! Bu \u015Fablonla \u00FCretkenli\u011Fini art\u0131raca\u011F\u0131n\u0131 umuyorum.\n\n" +
                        "\uD83D\uDCDA Daha fazla \u015Fablon i\u00E7in /templates komutunu kullan.", { parse_mode: 'Markdown' })];
            case 2:
                _a.sent();
                return [3 /*break*/, 4];
            case 3:
                err_2  _a.sent();
                console.error('Delivery message error:', err_2);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
bot.catch(function (err) {
    console.error('Bot error:', err);
    if (err instanceof grammy_1.GrammyError) {
        console.error('Request failed:', err.description);
    }
    else {
        console.error('Unknown error:', err);
    }
});
exports.default  bot;
