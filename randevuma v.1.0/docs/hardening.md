# Randevuma Hardening (Prod Safe)

## Kurulum
```bash
npm i
npx prisma generate
# lokal değişiklik varsa:
npx prisma migrate dev -n "secure_slug_and_booking_uniques"
npm run build && npm start
```

## Deploy (Vercel)

* Root Directory: proje kökü (ör. `randevuma v.1.0`).
* ENV: `DATABASE_URL`, `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `NEXT_PUBLIC_SITE_URL`.
* **Clear build cache**: dizin/şema değişikliklerinden sonra önerilir.

## Sağlık Kontrolleri

* `GET /api/health` → `{ ok:true, db:'up', prisma:'x', time:'ISO' }`
* `GET /api/diag` → `{ commit, prismaVersion, db:{shops, staff, bookings}, timezone }`

## Güvenlik

* Security headers (CSP, X-Frame-Options, vb.) `next.config.js` ile aktif.
* Middleware: `?staffId=` parametreli eski linkler 301 ile temizlenir.
* Rate limiting: `/api/fast/*` endpoints için 20 req/min per IP.
* Honeypot: Booking formunda gizli `_trap` inputu.
* Phone quotas: Günlük 2, saatlik 1 randevu limiti.

## SEO

* `/sitemap.xml` dinamik üretim (businesses, staff pretty URL).
* `/robots.txt` → `Sitemap: https://randevuma.com/sitemap.xml`

## Booking Güvenliği

* `Appointment` unique: `(staffId, startAt)` → çifte rezervasyon engeli.
* API `POST /api/fast/book`: **idempotent**; yarışta 409 `slot_taken`.

### İdempotency Pattern (✨ KRİTİK)

**Davranış:**
1. **Aynı müşteri + aynı slot + tekrar istek** → `200 OK` (mevcut randevu döner, yeni oluşturulmaz)
2. **Farklı müşteri + aynı slot** → `409 Conflict` ("slot_taken")
3. **Race condition** (2 kullanıcı aynı anda) → Database unique constraint devreye girer → `409 Conflict`

**Kod Akışı:**
```
1. İlk kontrol: `findFirst({ staffId, startAt })` → Varsa:
   - Aynı telefon mu? → 200 (idempotent)
   - Farklı telefon → 409 (slot_taken)

2. Transaction içinde booking oluştur → Unique constraint race safety

3. Catch P2002 (Prisma unique violation) → 409 (race condition fallback)
```

**Test Komutu:**
```bash
# Aynı isteği 2 kez gönder
curl -X POST https://randevuma.com/api/fast/book -d '{ ... }'
curl -X POST https://randevuma.com/api/fast/book -d '{ ... }' # → idempotent: true
```

## Test & CI

* Playwright smoke (3 test): fast page, pretty staff, API slots.
* GitHub Actions: PR'da smoke test; kırmızıysa merge yok.

## Yaygın Hatalar

* **Slug NULL** → schema'da NOT NULL + backfill + slugify.
* **404 /b/:slug/fast** → business/staff slug DB'de yok; seed/insert.
* **Unique constraint failed** → slot çakışması; 409 beklenen davranış.
* **"no such column: slug"** → Migration Turso'ya uygulanmamış; `npx prisma migrate deploy` veya manuel SQL.

## Pretty URLs

* Genel randevu: `https://randevuma.com/b/demo/fast`
* Staff özel: `https://randevuma.com/b/demo/s/mehmet-kaya`
* Servis sabitli: `https://randevuma.com/b/demo/s/mehmet-kaya?serviceId=service-2`

## Database Migrations (Turso)

Prod'a migration uygulamak için:

```bash
# Option 1: Prisma migrate (Vercel build içinde)
npx prisma migrate deploy

# Option 2: Manuel SQL (Turso CLI)
turso db shell randevuma-polfules \
  -e 'CREATE UNIQUE INDEX IF NOT EXISTS "Appointment_staffId_startAt_key" ON "Appointment"("staffId","startAt");'
```

## Slug Backfill Script

Mevcut staff kayıtlarına slug eklemek için:

```bash
npm run slug:backfill
```

## Risk & Ban Management

* Dashboard: `/dashboard/risk` - Şüpheli aktiviteler
* Dashboard: `/dashboard/bans` - Aktif ban listesi
* API: `POST /api/admin/ban` - Ban ekle/kaldır
* API: `GET /api/admin/risk` - Risk logları

## Environment Variables

**Required:**
- `DATABASE_URL` - Turso connection string
- `TURSO_DATABASE_URL` - Turso database URL
- `TURSO_AUTH_TOKEN` - Turso auth token

**Optional:**
- `NEXT_PUBLIC_SITE_URL` - Production domain (default: https://randevuma.com)
- `NEXTAUTH_URL` - NextAuth callback URL
- `NEXTAUTH_SECRET` - NextAuth secret key

