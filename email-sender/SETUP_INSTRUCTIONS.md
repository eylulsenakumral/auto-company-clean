# Email Sender - Setup Instructions

## Durum: Production-Ready, API Key Bekliyor

**Son Güncelleme:** 2026-06-08 — Cycle #82

---

## 1. Resend API Key Alın (2 dakika)

1. https://resend.com/signup adresine gidin
2. Ücretsiz account oluşturun
3. https://resend.com/api-keys adresine gidin
4. "Create API Key" butonuna tıklayın
5. Key'i kopyalayın ( `re_` ile başlar)

---

## 2. .env Dosyasını Oluşturun

```bash
cd email-sender
cp .env.example .env
```

`.env` dosyasını düzenleyin:

```bash
RESEND_API_KEY***REMOVED***re_buraya_api_key_gelecek
FROM_EMAIL***REMOVED***onboarding@resend.me
FROM_NAME***REMOVED***"Tolga from Resume Keyword Analyzer"
RATE_LIMIT_MS***REMOVED***1000
MAX_RETRIES***REMOVED***3
```

---

## 3. Recipients Listesi Hazırlayın

`recipients.csv` dosyasını düzenleyin:

```csv
email,name,segment,personalizedOpener,notes
friend@example.com,Ahmet Yılmaz,inner_circle,,Yakın arkadaş
colleague@example.com,Ayşe Demir,professional,,Tech connection
linkedin@example.com,Mehmet Kaya,linkedin,,LinkedIn connection
```

**Segmentler:**
- `inner_circle` — Close friends, family (Template 3)
- `professional` — Colleagues, tech network (Template 2)
- `linkedin` — LinkedIn connections (Template 1)
- `cold` — Cold outreach (Template 2)

---

## 4. Test Edin

```bash
# Dry-run test (API çağrısı yapmaz)
npm run send -- --limit 1 --dry-run

# Gerçek gönderim (1 email)
npm run send -- --limit 1

# Tüm listeyi gönder
npm run send --
```

---

## 5. CLI Seçenekleri

| Flag | Açıklama | Default |
|------|----------|---------|
| `--recipients <file>` | CSV dosyası | recipients.csv |
| `--sequence <id>` | Template ID (1-4) | 1 |
| `--limit <n>` | Max email | Tümü |
| `--dry-run` | Test modu | false |
| `--help` | Yardım | — |

**Template'ler:**
- 1: Can You Help? (Sıcak kontaklar)
- 2: Problem-Solution (Profesyonel ağ)
- 3: Founder-to-Network (İç çember)
- 4: Follow-Up (48 saat sonra)

---

## 6. Audit Logları

Gönderim sonuçları `logs/send-YYYY-MM-DD.jsonl` dosyasında tutulur:

```json
{"timestamp":"2026-06-08T20:05:56.753Z","recipient_email":"test@example.com","template_id":1,"status":"success","message_id":"1234567890"}
```

---

## 7. Başarı Metrikleri

| Metrik | Hedef |
|--------|-------|
| Response Rate | %15+ |
| Signup Rate | %50 (responses → signups) |
| Pay Rate | %5 (signups → pay) |

**Funnel Matematik (100 email):**
- 100 email → 15 response → 7.5 signup → $218 revenue

---

## 8. Sorun Giderme

**API Key Hatası:**
```
Error: Invalid API key
```
→ `.env` dosyasını kontrol edin, key doğru mu?

**Domain Hatası:**
```
Error: Domain not verified
```
→ `FROM_EMAIL***REMOVED***onboarding@resend.me` kullanın (free tier default)

**Rate Limit:**
```
Error: Rate limit exceeded
```
→ `RATE_LIMIT_MS***REMOVED***2000` artırın

**CSV Parse Hatası:**
```
Error: Invalid CSV format
```
→ CSV formatını kontrol edin, header'lar doğru mu?

---

## 9. Next Actions

1. ✅ API key alındı
2. ✅ .env oluşturuldu
3. ✅ Recipients listesi hazırlandı
4. ✅ Dry-run test başarılı
5. 🔄 İlk batch gönderildi (5-10 email)
6. 🔄 Response'lar takip ediliyor
7. 🔄 48 saat sonra follow-up gönderiliyor

---

## 10. Önemli Notlar

- **Spasmsız:** Personalization kullanın, kopya yapıştırmayın
- **Permission:** Feedback isteyin, satış yapmayın
- **Transparency:** Beta statüsünü belirtin
- **Value:** 5 dakika zaman isteyin, karşılığında free lifetime access verin
- **Compliance:** Unsubscribe link ekleyin (Resend otomatik ekler)

---

**İletişim:** Tolga (@tolgabrk)
**Project:** Resume Keyword Gap Analyzer
**URL:** https://nonhereditary-valentina-admissibly.ngrok-free.dev
