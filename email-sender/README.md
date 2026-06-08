# Email Sender

Resend API tabanlı cold email gönderici - rate limiting, retry logic ve audit logging ile.

## Özellikler

- **Rate Limiting**: Resend free tier için 1 req/sec (ayarlanabilir)
- **Retry Logic**: Başarısız istekler için 3 deneme (exponential backoff)
- **Audit Logging**: JSONL formatında detaylı log kayıtları
- **Dry-Run Mode**: Test modu - API çağrısı yapmadan simülasyon
- **CLI**: Kolay kullanımlı komut satırı arayüzü
- **CSV Import**: Toplu alıcı importu
- **Template System**: Hazır email template'leri

## Kurulum

```bash
cd email-sender
npm install
cp .env.example .env
```

`.env` dosyasını düzenle:

```bash
RESEND_API_KEY***REMOVED***re_xxxxxxxxxxxxx
FROM_EMAIL***REMOVED***onboarding@resend.me
FROM_NAME***REMOVED***"Tolga from Resume Keyword Analyzer"
RATE_LIMIT_MS***REMOVED***1000
MAX_RETRIES***REMOVED***3
```

## Kullanım

### CSV Format

`recipients.csv` oluştur:

```csv
email,name,segment,personalizedOpener,notes
user@example.com,John Doe,inner_circle,,Optional notes
jane@example.com,Jane Smith,professional,,Tech connection
```

### CLI Komutları

```bash
# Yardım
npm run send -- --help

# Dry-run test (önce bunu çalıştır)
npm run send -- --limit 1 --dry-run

# 1 email gönder
npm run send -- --limit 1

# Tüm recipientlara gönder
npm run send --

# Farklı CSV kullan
npm run send -- --recipients /path/to/list.csv

# Farklı template
npm run send -- --sequence 2  # 2 ***REMOVED*** Problem-Solution template

# Limit uygula
npm run send -- --limit 10
```

### Template'ler

| ID | İsim | Kullanım Durumu |
|----|------|-----------------|
| 1 | Can You Help? | Sıcak kontaklar |
| 2 | Problem-Solution | Profesyonel ağ |
| 3 | Founder-to-Network | İç çember (inner circle) |
| 4 | Follow-Up | 48 saat sonra takip |

### Output Örneği

```
╔════════════════════════════════════════════════════════╗
║           Email Sender - Ready to Send                ║
╚════════════════════════════════════════════════════════╝

Template: Can You Help? (ID: 1)
Recipients: 5
From: Tolga from Resume Keyword Analyzer <onboarding@resend.me>
Rate limit: 1000ms
Mode: LIVE (emails will be sent)

[1/5] Processing user@example.com...
✓ Sent to user@example.com
  (message ID: 1234567890)

...

═════════════════════════════════════════════════════════
                        Summary
═════════════════════════════════════════════════════════

Total: 5
Success: 5
Failed: 0
Duration: 5.2s
```

## Log Format

`logs/send-YYYY-MM-DD.jsonl` dosyası her gönderim için kayıt tutar:

```json
{"timestamp":"2026-06-08T20:05:56.753Z","recipient_email":"test@example.com","recipient_name":"Test User","template_id":1,"subject":"ATS rejection problem - I built a fix","status":"success","attempt":1,"message_id":"1234567890","duration_ms":123}
```

## Rate Limiting & Retry

- **Rate Limit**: Her istek arasında `RATE_LIMIT_MS` bekler (default: 1000ms)
- **Retry**: Başarısız istekler için `MAX_RETRIES` kadar dener (default: 3)
- **Backoff**: Exponential backoff (2s, 4s, 8s...)
- **Non-retryable errors**: Invalid API key, unauthorized, domain not verified

## Environment Variables

| Variable | Default | Açıklama |
|----------|---------|----------|
| RESEND_API_KEY | - | Resend API anahtarı (zorunlu) |
| FROM_EMAIL | onboarding@resend.me | Gönderen email |
| FROM_NAME | Tolga from Resume Keyword Analyzer | Gönderen isim |
| RATE_LIMIT_MS | 1000 | Rate limit milisaniye |
| MAX_RETRIES | 3 | Maksimum retry sayısı |

## Proje Yapısı

```
email-sender/
├── src/
│   ├── index.ts       # CLI entry point
│   ├── sender.ts      # Resend API wrapper
│   ├── templates.ts   # Template parser & renderer
│   ├── recipients.ts  # CSV parser
│   └── logger.ts      # JSONL audit logger
├── logs/              # Audit logs
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```
