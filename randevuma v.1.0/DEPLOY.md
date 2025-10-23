# 🚀 Production Deployment Guide - Randevuma

Bu guide, Randevuma Fast Booking System'in production'a çıkış adımlarını içerir.

---

## ✅ Ön Hazırlık

### 1. Son Kontroller

```bash
# Tüm testleri çalıştır (varsa)
npm run lint

# Build kontrolü
npm run build
```

### 2. Güvenlik Önlemleri Eklendi

- ✅ **Hydration Warning**: `suppressHydrationWarning` aktif
- ✅ **Rate Limiting**: 60 saniyede IP başına 10 istek
- ✅ **CORS**: Sadece kendi origin'e izin
- ✅ **SEO**: `/b/*` ve `/api/*` rotaları indexlenmiyor

---

## 🚀 Vercel Deployment

### 1. Git Push

```bash
git add .
git commit -m "🚀 Production ready: Security, rate limiting, and SEO optimizations"
git push origin main
```

### 2. Vercel Deploy

```bash
# Production deployment
vercel --prod
```

**VEYA** Vercel Dashboard'dan:
- Repository'yi connect et
- Auto-deploy aktif olacak (main branch)

### 3. Vercel Environment Settings

**Project Settings → General:**
- **Node.js Version**: `20.x`
- **Install Command**: `npm ci`
- **Build Command**: `next build`
- **Output Directory**: `.next` (default)

**Environment Variables (eğer gerekiyorsa):**
```env
DATABASE_URL="your-production-database-url"
NODE_ENV="production"
```

### 4. Build Cache (İsteğe Bağlı)

Eğer build sorunları yaşarsanız:
- Vercel Dashboard → Project → Settings → General
- **Clear Build Cache** → Redeploy

---

## 🧪 Production Smoke Test

Deploy sonrası aşağıdaki testleri yapın:

### 1. Fast Booking Page Test

```
https://your-domain.vercel.app/b/demo/fast
```

**Kontrol Listesi:**
- [ ] 3 slot görünüyor mu?
- [ ] Slot'a tıklandığında form açılıyor mu?
- [ ] Form doldurulup submit edilebiliyor mu?
  - Ad: "Prod Test"
  - Tel: "5073132201"
- [ ] **201** status code ile cevap dönüyor mu?
- [ ] Başarı mesajı görünüyor mu?

### 2. API Endpoint Test

```bash
curl -s "https://your-domain.vercel.app/api/fast/next-slots?businessSlug=demo&serviceId=svc_haircut" | jq
```

**Beklenen Çıktı:**
```json
{
  "slots": [
    {
      "startISO": "2025-10-23T09:00:00.000Z",
      "staffId": "staff_ali",
      "label": "09:00"
    },
    // ... 2 slot daha
  ]
}
```

### 3. Rate Limit Test (İsteğe Bağlı)

```bash
# 10'dan fazla istek gönder
for i in {1..15}; do
  curl -s -o /dev/null -w "%{http_code}\n" \
    "https://your-domain.vercel.app/api/fast/next-slots?businessSlug=demo&serviceId=svc_haircut"
done
```

**Beklenen:** İlk 10 istek `200`, sonrakiler `429` (Too Many Requests)

### 4. Browser Test

**Incognito/Private Mode'da test edin** (extension interference'ı engellemek için):
- Chrome/Edge: `Ctrl+Shift+N`
- Firefox: `Ctrl+Shift+P`
- Safari: `Cmd+Shift+N`

---

## 📱 QR Code & FastLink

### FastLink URL Formatı

```
https://your-domain.vercel.app/b/<businessSlug>/fast?serviceId=<serviceId>
```

### Örnekler

**Demo işletme + Haircut servisi:**
```
https://your-domain.vercel.app/b/demo/fast?serviceId=svc_haircut
```

**QR Code Oluşturma:**

1. **Online Tool**: https://www.qr-code-generator.com/
2. **URL**: Yukarıdaki FastLink'i yapıştır
3. **Customize**: Logo, renk vb. ekle
4. **Download**: PNG/SVG olarak indir

**Kullanım Önerileri:**
- Fiziksel mekanda: Tezgah, duvar, masa üstü
- Dijital: Website, e-posta imzası, sosyal medya
- Baskı: Kartvizit, broşür, flyer

### WhatsApp Entegrasyonu

Müşteri WhatsApp'tan mesaj attığında otomatik cevap:

```
Merhaba! 👋

Hızlı randevu almak için aşağıdaki linke tıklayın:
https://your-domain.vercel.app/b/demo/fast

2 tıkla randevunuz hazır! ⚡
```

---

## 📊 Monitoring & Analytics

### 1. Vercel Analytics

**Aktifleştirme:**
- Dashboard → Project → Analytics → Enable

**Neler İzlenir:**
- Page views
- Response time
- Error rates
- Geographic data

### 2. Log Monitoring

**Deployment Logs:**
- Dashboard → Project → Deployments → [Son deployment] → View Logs

**Runtime Logs:**
- Dashboard → Project → Logs
- Filter: Error (4xx/5xx)

**İzlenecek Metrikler:**
- 4xx hatalar (client errors)
- 5xx hatalar (server errors)
- Slow API responses (>1s)

### 3. Database Monitoring (SQLite → PostgreSQL için)

Production'da SQLite yerine PostgreSQL kullanmanız önerilir:

```bash
# Vercel Postgres ekleme
vercel postgres create
vercel env pull
```

**Schema migration:**
```bash
npx prisma migrate deploy
npx prisma db push
```

---

## 🔐 Güvenlik Sertleştirmeleri (Opsiyonel)

### 1. Environment Variables

Hassas bilgileri environment variables'a taşıyın:

```env
# .env.production
DATABASE_URL="postgresql://..."
SESSION_SECRET="your-random-secret"
```

### 2. Rate Limiting Upgrade

Production'da in-memory rate limiter yerine Redis kullanın:

```bash
npm install @upstash/redis @upstash/ratelimit
```

**Upstash Redis (Ücretsiz):**
- https://upstash.com/
- Create Redis database
- Vercel'e environment variables ekle

### 3. HTTPS Enforcement

Vercel otomatik HTTPS sağlar, ancak ek güvenlik için:

```typescript
// middleware.ts'e ekle
if (process.env.NODE_ENV === 'production' && !request.url.startsWith('https://')) {
  return NextResponse.redirect(`https://${request.headers.get('host')}${request.url}`);
}
```

---

## 🎨 İyileştirmeler (Sonra Yapılabilir)

### 1. Calendar Export (.ics)

Randevu onayı sonrası "Takvime Ekle" butonu:

```typescript
// lib/calendar.ts
export function generateICS(appointment: Appointment) {
  return `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${appointment.startAt.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTEND:${appointment.endAt.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
SUMMARY:${appointment.service.name}
DESCRIPTION:Randevunuz
END:VEVENT
END:VCALENDAR`;
}
```

### 2. Admin Dashboard - Fast Appointments

Fast booking ile gelen randevulara özel filtre:

```typescript
// Add to appointment creation
source: "fast" // or "admin" or "whatsapp"
```

### 3. SMS/Email Notifications

Randevu onayı için bildirim sistemi:

```bash
npm install nodemailer
# veya
npm install twilio
```

### 4. Analytics Dashboard

Randevu metrikleri:
- Günlük/haftalık randevu sayısı
- En popüler hizmetler
- En yoğun saatler
- Conversion rate (visit → booking)

---

## 🐛 Troubleshooting

### Build Hatası

```bash
# Cache temizle
rm -rf .next node_modules
npm install
npm run build
```

### Database Connection

```bash
# Prisma client'ı yeniden generate et
npx prisma generate

# Database schema'yı kontrol et
npx prisma db push
```

### 404 Errors

- `next.config.js` doğru mu kontrol et
- Vercel routing kuralları kontrol et

### Rate Limit Çalışmıyor

- Middleware pattern'i kontrol et: `/api/fast/:path*`
- Vercel logs'a bak: 429 status code görünüyor mu?

---

## 📞 Support

**Issues:**
- GitHub Issues: [Your repo]
- Email: [Your email]

**Documentation:**
- Next.js: https://nextjs.org/docs
- Vercel: https://vercel.com/docs
- Prisma: https://www.prisma.io/docs

---

## ✅ Final Checklist

- [ ] Git push yapıldı
- [ ] Vercel'de deploy edildi
- [ ] Production URL açıldı ve test edildi
- [ ] API endpoints test edildi
- [ ] QR code oluşturuldu
- [ ] Rate limiting test edildi
- [ ] Analytics aktif
- [ ] Error monitoring aktif
- [ ] Documentation güncellendi

---

🎉 **Tebrikler! Randevuma production'da!**

**Next Steps:**
1. QR code'u fiziksel mekana yerleştir
2. Müşterilerle test et
3. Geri bildirimleri topla
4. İyileştirmeleri planla