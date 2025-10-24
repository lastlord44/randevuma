# Randevuma Operations Runbook

## ⚡ Hızlı Sağlık Kontrolü (CLI)

```bash
# 1) Health
curl -s https://randevuma.com/api/health | jq

# 2) Diag
curl -s https://randevuma.com/api/diag | jq

# 3) Pretty URL 301
curl -I "https://randevuma.com/b/demo/fast?staffId=abc" | grep -E "HTTP|Location"

# 4) Slots API
curl -s "https://randevuma.com/api/fast/next-slots?businessSlug=demo&serviceId=service-2" | jq '.slots | length'
```

**Beklenen:**
- `health/diag` → 200
- 301 redirect var (`Location` header)
- `slots` > 0

---

## 🛡️ Prod Guardrails (hemen aç/kontrol et)

### GitHub → Branch Protection (main)
- ✅ Require PR before merging
- ✅ Require status checks to pass → **CI - Smoke**
- ✅ Dismiss stale approvals on new commits

### Vercel → Project Settings
- ✅ **Git Integration:** "Only allow merges that pass checks"
- ✅ **Environment Variables:** PRODUCTION & PREVIEW ayrımı
- ✅ **Builds:** "Ignore build step if no src changes" (opsiyonel)
- ✅ **Cron/Monitoring:** `/api/health`'i 5 dk'da bir ping (Vercel Cron veya UptimeRobot)

### Turso Database
- ✅ `Appointment_staffId_startAt_key` UNIQUE constraint aktif
- ✅ **Snapshot/Dump** günlük (opsiyonel):
  ```bash
  turso db shell randevuma-polfules -e ".backup main backup-$(date +%F).db"
  ```

---

## 🧯 Olay Anında (Incident Response)

### Belirti: Çift Rezervasyon Hatası
**API Response:** 409 `slot_taken`  
**Çözüm:** Bu **beklenen davranış**. Kullanıcıya "Bu saat dolu, lütfen başka bir saat seçin" mesajı göster.

### Belirti: 404 `/b/:slug/fast`
**Sebep:** DB'de business/staff slug yok  
**Kontrol:**
```bash
# Turso'da kontrol
turso db shell randevuma-polfules -e "SELECT slug, name FROM Business;"
turso db shell randevuma-polfules -e "SELECT slug, name FROM Staff;"
```
**Çözüm:** Gerekirse seed ya da admin panel'den ekle.

### Belirti: 500 API Hatası
**Kontrol:**
1. Vercel Logs → `book_error` / Prisma hatası ara
2. `DATABASE_URL` prod env'de doğru mu?
3. Turso connection test: `curl https://randevuma.com/api/health`

**Çözüm:** 
- Env yanlışsa → Vercel Settings → Env Variables → düzelt + redeploy
- Database bağlantısı kesilmişse → Turso dashboard kontrol

### Hızlı Rollback
**Adımlar:**
1. Vercel → Deployments
2. Son "yeşil" (Ready) build'i bul
3. **"⋮" menü → Promote to Production**

---

## 🔭 Sentry Entegrasyonu (Opsiyonel, 2 dk)

```bash
npm i @sentry/nextjs
npx @sentry/wizard -i nextjs
# DSN ekle → Vercel ENV → SENTRY_DSN
```

**Vercel ENV:**
```
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
```

---

## 🧪 CI Lokalde Test

```bash
# Playwright kurulum
npm i -D @playwright/test
npx playwright install --with-deps

# Testleri çalıştır
npx playwright test

# Belirli bir test
npx playwright test tests/smoke.spec.ts
```

---

## 🗺️ SEO Hızlı Kontrol

**Sitemap:**
```bash
curl -s https://randevuma.com/sitemap.xml | grep -E "<url>|<loc>"
```
✅ Beklenen: shops & staff URL'leri listeleniyor

**Robots:**
```bash
curl -s https://randevuma.com/robots.txt
```
✅ Beklenen: `Sitemap: https://randevuma.com/sitemap.xml` satırı var

**Google Search Console:**
1. https://search.google.com/search-console
2. "Add Property" → https://randevuma.com
3. Submit sitemap: `https://randevuma.com/sitemap.xml`

---

## ✅ "Tamamdır" Kontrol Listesi

### Deployment
- [ ] PR'lar **smoke CI** geçmeden merge olmuyor
- [ ] Vercel production domain doğru (`randevuma.com`)
- [ ] ENV variables (prod vs preview) ayrı

### Health Checks
- [ ] `/api/health` → 200 + `db: 'connected'`
- [ ] `/api/diag` → 200 + business/staff count

### Features
- [ ] Pretty URL çalışıyor (`/b/demo/s/mehmet-kaya`)
- [ ] 301 redirect çalışıyor (`?staffId=` kaldırılıyor)
- [ ] Double-booking 409 veriyor (test edildi)

### Database
- [ ] Turso'da unique index onaylandı (`Appointment_staffId_startAt_key`)
- [ ] Slug backfill tamamlandı (tüm staff'larda slug var)

### Security
- [ ] Security headers aktif (CSP, X-Frame-Options)
- [ ] Rate limiting aktif (20 req/min)
- [ ] Honeypot aktif (booking form)

### SEO
- [ ] `/sitemap.xml` dinamik üretiliyor
- [ ] `/robots.txt` mevcut
- [ ] Google Search Console'a eklendi (opsiyonel)

### Monitoring (Opsiyonel)
- [ ] Sentry DSN eklendi
- [ ] Uptime monitor kuruldu (UptimeRobot/Vercel Cron)
- [ ] Error alerting aktif

---

## 🚨 Kritik Metrikler

**Günlük takip:**
- Total appointments (artış trendi)
- 409 error rate (< %5 olmalı)
- API response time (< 500ms)
- Database connection errors (= 0)

**Haftalık:**
- Smoke test success rate (100%)
- Deploy frequency
- Rollback sayısı (< 1/hafta)

---

## 📞 Escalation Path

1. **Level 1:** Vercel Logs kontrol
2. **Level 2:** Database connection test
3. **Level 3:** Rollback to last known good
4. **Level 4:** Turso support (eğer DB problemi varsa)

---

## 🔄 Bakım Penceresi (Önerilen)

**Haftalık:**
- Vercel deployment logs review
- Turso database size kontrol
- Rate limit threshold review

**Aylık:**
- Security dependencies update (`npm audit`)
- Prisma client update
- Database backup restore testi

---

## 📚 Faydalı Linkler

- **Vercel Dashboard:** https://vercel.com/ahmets-projects-cdb4d82a/randevuma
- **GitHub Repo:** https://github.com/lastlord44/randevuma
- **Turso Dashboard:** https://turso.tech/
- **Health Check:** https://randevuma.com/api/health
- **Sitemap:** https://randevuma.com/sitemap.xml

