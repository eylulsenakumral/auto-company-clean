import 'dotenv/config';
import { Bot, session, GrammyError, Context, InlineKeyboard } from 'grammy';
import { autoRetry } from '@grammyjs/auto-retry';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';
import { OrdersDatabase } from './database';

const __filename ***REMOVED*** fileURLToPath(import.meta.url);
const __dirname ***REMOVED*** dirname(__filename);

interface SessionData {
  userId: number;
  step?: string;
  selectedTemplate?: string;
}

type AppContext ***REMOVED*** Context<SessionData>;

interface Template {
  id: string;
  name: string;
  category: string;
  price_stars: number;
  description: string;
  notion_url: string;
  thumbnail: string;
  tags: string[];
  features: string[];
}

const token ***REMOVED*** process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  throw new Error('TELEGRAM_BOT_TOKEN environment variable is required');
}

const bot ***REMOVED*** new Bot<AppContext>(token);
bot.use(autoRetry());

const db ***REMOVED*** new OrdersDatabase();

let templates: Template[] ***REMOVED*** [];
try {
  const templatesPath ***REMOVED*** join(__dirname, '..', 'templates.json');
  const templatesContent ***REMOVED*** readFileSync(templatesPath, 'utf-8');
  templates ***REMOVED*** JSON.parse(templatesContent);
  console.log(`✅ ${templates.length} şablon yüklendi`);
} catch (err) {
  console.error('❌ Şablonlar yüklenemedi:', err);
}

bot.use(session({
  initial: (): SessionData ***REMOVED***> ({
    userId: 0,
  }),
}));

bot.command('start', async (ctx) ***REMOVED***> {
  const userId ***REMOVED*** ctx.from?.id || 0;
  ctx.session.userId ***REMOVED*** userId;

  await ctx.reply(`
🚀 *Telegram Notion Templates'a Hoş Geldin!*

Ben, üretkenlik araçların için hazır Notion şablonları sunan bir botum. İhtiyacın olan şablonu bul, satın al ve hemen kullanmaya başla!

📦 *Ne Sunuyorum:*
• Proje Yönetimi Şablonları
• İçerik Planlama Sistemleri
• Gelir Takip Tabloları
• Ve daha fazlası...

💎 *Ödeme:*
Telegram Stars ile güvenli ve hızlı ödeme. Kredi kartı gerekmez.

👇 Başlamak için /templates komutunu kullan.
`, { parse_mode: 'Markdown' });
});

bot.command('help', async (ctx) ***REMOVED***> {
  await ctx.reply(`
📚 *Yardım Rehberi*

*Komutlar:*
/start - Botu başlat ve karşılama mesajını gör
/templates - Mevcut Notion şablonlarını listele
/myorders - Satın aldığım şablonları gör
/help - Bu yardım mesajını göster

*Şablon Satın Alma:*
1. /templates ile şablonları gör
2. Bir şablon seç
3. ⭐ Stars ile ödeme yap
4. Notion şablon linki anında teslim edilir

*Destek:*
Bir sorun mu yaşadın? @tolgabrk üzerinden iletişime geç.
`, { parse_mode: 'Markdown' });
});

bot.command('templates', async (ctx) ***REMOVED***> {
  if (templates.length ***REMOVED******REMOVED******REMOVED*** 0) {
    await ctx.reply('⚠️ Şu anda mevcut şablon yok. Lütfen daha sonra tekrar kontrol et.');
    return;
  }

  const keyboard ***REMOVED*** InlineKeyboard.from(
    templates.map((template) ***REMOVED***> [
      {
        text: `${template.emoji || '📦'} ${template.name} - ⭐ ${template.price_stars}`,
        callback_data: `template_${template.id}`,
      },
    ])
  );

  await ctx.reply(
    `📦 *Mevcut Notion Şablonları*\n\n` +
    `Aşağıdaki şablonlardan birini seçerek detayları gör ve satın al:\n\n` +
    `💎 Telegram Stars ile güvenli ödeme\n` +
    `🚀 Anında teslimat`,
    { parse_mode: 'Markdown', reply_markup: keyboard }
  );
});

bot.callbackQuery(/^template_(.+)$/, async (ctx) ***REMOVED***> {
  const templateId ***REMOVED*** ctx.match[1];
  const template ***REMOVED*** templates.find((t) ***REMOVED***> t.id ***REMOVED******REMOVED******REMOVED*** templateId);

  if (!template) {
    await ctx.answerCallbackQuery('❌ Şablon bulunamadı.');
    return;
  }

  ctx.session.selectedTemplate ***REMOVED*** templateId;

  const featuresList ***REMOVED*** template.features.map((f) ***REMOVED***> `✅ ${f}`).join('\n');
  const tagsList ***REMOVED*** template.tags.map((t) ***REMOVED***> `#${t}`).join(' ');

  const keyboard ***REMOVED*** new InlineKeyboard()
    .text(`⭐ ${template.price_stars} Stars ile Satın Al`, `buy_${template.id}`)
    .row()
    .text('« Geri Dön', 'back_to_templates');

  await ctx.editMessageText(
    `📦 *${template.name}*\n\n` +
    `📝 *Açıklama:*\n${template.description}\n\n` +
    `✨ *Özellikler:*\n${featuresList}\n\n` +
    `🏷️ *Etiketler:* ${tagsList}\n\n` +
    `💰 *Fiyat:* ⭐ ${template.price_stars} Stars\n\n` +
    `🚀 Satın almak için butona tıkla ve anında Notion şablonuna eriş!`,
    { parse_mode: 'Markdown', reply_markup: keyboard }
  );

  await ctx.answerCallbackQuery();
});

bot.callbackQuery('back_to_templates', async (ctx) ***REMOVED***> {
  const keyboard ***REMOVED*** InlineKeyboard.from(
    templates.map((template) ***REMOVED***> [
      {
        text: `${template.emoji || '📦'} ${template.name} - ⭐ ${template.price_stars}`,
        callback_data: `template_${template.id}`,
      },
    ])
  );

  await ctx.editMessageText(
    `📦 *Mevcut Notion Şablonları*\n\n` +
    `Aşağıdaki şablonlardan birini seçerek detayları gör ve satın al:\n\n` +
    `💎 Telegram Stars ile güvenli ödeme\n` +
    `🚀 Anında teslimat`,
    { parse_mode: 'Markdown', reply_markup: keyboard }
  );

  await ctx.answerCallbackQuery();
});

bot.callbackQuery(/^buy_(.+)$/, async (ctx) ***REMOVED***> {
  const templateId ***REMOVED*** ctx.match[1];
  const template ***REMOVED*** templates.find((t) ***REMOVED***> t.id ***REMOVED******REMOVED******REMOVED*** templateId);

  if (!template) {
    await ctx.answerCallbackQuery('❌ Şablon bulunamadı.');
    return;
  }

  const userId ***REMOVED*** ctx.from?.id || 0;
  const username ***REMOVED*** ctx.from?.username;

  try {
    const order ***REMOVED*** db.createOrder({
      telegram_user_id: userId,
      telegram_username: username,
      template_id: templateId,
      amount_stars: template.price_stars,
      payment_status: 'pending',
    });

    const keyboard ***REMOVED*** new InlineKeyboard()
      .url('⭐ Stars ile Ödeme Yap', `https://t.me/${
        ctx.me?.username || 'bot'
      }?start***REMOVED***pay_${order.id}`)
      .row()
      .text('« Geri Dön', `template_${templateId}`);

    await ctx.editMessageText(
      `💳 *Ödeme İşlemi*\n\n` +
      `📦 Şablon: ${template.name}\n` +
      `💰 Tutar: ⭐ ${template.price_stars} Stars\n\n` +
      `Aşağıdaki butona tıklayarak ödemeyi tamamla:\n\n` +
      `✅ Güvenli Telegram Stars ödemesi\n` +
      `🚀 Anında teslimat\n` +
      `📧 Ödeme onayıyla birlikte Notion linki`,
      { parse_mode: 'Markdown', reply_markup: keyboard }
    );

    await ctx.answerCallbackQuery();
  } catch (err) {
    console.error('Order creation error:', err);
    await ctx.answerCallbackQuery('❌ Sipariş oluşturulurken hata oluştu.');
  }
});

bot.command('myorders', async (ctx) ***REMOVED***> {
  const userId ***REMOVED*** ctx.from?.id || 0;
  const orders ***REMOVED*** db.getOrdersByUser(userId);

  if (orders.length ***REMOVED******REMOVED******REMOVED*** 0) {
    await ctx.reply('📋 Henüz bir siparişin yok. /templates ile şablonları keşfet!');
    return;
  }

  let message ***REMOVED*** '📋 *Sipariş Geçmişin*\n\n';

  for (const order of orders) {
    const template ***REMOVED*** templates.find((t) ***REMOVED***> t.id ***REMOVED******REMOVED******REMOVED*** order.template_id);
    const statusEmoji ***REMOVED*** order.payment_status ***REMOVED******REMOVED******REMOVED*** 'completed' ? '✅' : '⏳';

    message +***REMOVED*** `${statusEmoji} *${template?.name || order.template_id}*\n`;
    message +***REMOVED*** `💰 ⭐ ${order.amount_stars} | `;
    message +***REMOVED*** `📅 ${new Date(order.created_at || '').toLocaleDateString('tr-TR')}\n`;

    if (order.payment_status ***REMOVED******REMOVED******REMOVED*** 'completed') {
      message +***REMOVED*** `🎁 Teslim edildi ✅\n`;
    }

    message +***REMOVED*** '\n';
  }

  await ctx.reply(message, { parse_mode: 'Markdown' });
});

bot.on('pre_checkout_query', async (ctx) ***REMOVED***> {
  await ctx.answerPreCheckoutQuery({ ok: true });
});

bot.on('message:successful_payment', async (ctx) ***REMOVED***> {
  const payment ***REMOVED*** ctx.message.successful_payment;
  if (!payment) return;

  const chargeId ***REMOVED*** payment.telegram_payment_charge_id;
  const order ***REMOVED*** db.getOrderByPaymentChargeId(chargeId);

  if (!order) {
    console.error('Order not found for charge:', chargeId);
    return;
  }

  const template ***REMOVED*** templates.find((t) ***REMOVED***> t.id ***REMOVED******REMOVED******REMOVED*** order.template_id);
  if (!template) {
    console.error('Template not found:', order.template_id);
    return;
  }

  db.updateOrderStatus(
    order.id!,
    'completed',
    new Date().toISOString(),
    ctx.message.message_id
  );

  try {
    await ctx.reply(
      `🎉 *Ödeme Başarılı!*\n\n` +
      `📦 *${template.name}* şablonunu satın aldın!\n\n` +
      `🔗 *Notion Şablonu:*\n${template.notion_url}\n\n` +
      `🙏 Teşekkürler! Bu şablonla üretkenliğini artıracağını umuyorum.\n\n` +
      `📚 Daha fazla şablon için /templates komutunu kullan.`,
      { parse_mode: 'Markdown' }
    );
  } catch (err) {
    console.error('Delivery message error:', err);
  }
});

bot.catch((err) ***REMOVED***> {
  console.error('Bot error:', err);

  if (err instanceof GrammyError) {
    console.error('Request failed:', err.description);
  } else {
    console.error('Unknown error:', err);
  }
});

export default bot;
