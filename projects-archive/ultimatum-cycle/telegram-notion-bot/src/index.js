"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var bot_1  require("./bot");
var database_1  require("./database");
console.log('🤖 Telegram Notion Bot başlatılıyor...');
var db  new database_1.OrdersDatabase();
console.log('✅ Veritabanı hazır');
bot_1.default.api.setMyCommands([
    { command: 'start', description: 'Botu başlat ve karşılama mesajını gör' },
    { command: 'templates', description: 'Mevcut Notion şablonlarını listele' },
    { command: 'myorders', description: 'Satın aldığım şablonları gör' },
    { command: 'help', description: 'Yardım rehberini göster' },
]);
bot_1.default.start({
    onStart: function () {
        console.log('✅ Bot başarıyla başlatıldı ve polling modunda çalışıyor.');
    },
}).catch(function (err) {
    console.error('❌ Bot başlatılamadı:', err);
    process.exit(1);
});
process.on('SIGINT', function () {
    console.log('\n🛑 Bot durduruluyor...');
    db.close();
    bot_1.default.stop();
    process.exit(0);
});
process.on('SIGTERM', function () {
    console.log('\n🛑 Bot durduruluyor...');
    db.close();
    bot_1.default.stop();
    process.exit(0);
});
