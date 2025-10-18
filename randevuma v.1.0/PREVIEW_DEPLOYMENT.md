# Preview Deployment ve Doğrulama Rehberi

Bu doküman Preview ortamının doğru çalıştığından emin olmak için gerekli adımları içerir.

## 1. Vercel Environment Variables Ayarları

Vercel Dashboard → Project → Settings → Environment Variables:

Aşağıdaki değişkenleri **iki kez** kaydedin:
- Bir satır **Production** için
- Bir satır **Preview** için

### Gerekli Environment Variables:
```
DATABASE_URL
DIRECT_URL
NEXTAUTH_SECRET
NEXTAUTH_URL
NEXT_PUBLIC_SITE_URL
```

**Önemli:** Preview DATABASE_URL Production'dan farklı bir DB'ye işaret etmelidir!

## 2. Preview'u Temiz Deployment

Vercel → Project → Deployments → En son Preview → Redeploy:

1. **"Redeploy"** butonuna tıkla
2. ✅ **"Clear build cache"** seçeneğini işaretle (ÇOK ÖNEMLİ!)
3. **"Redeploy with latest env"** seçeneğini seç
4. Deployment tamamlanana kadar bekle

**Not:** Clear build cache önceki Prisma client şeması ve build artefaktlarını temizler.

## 3. Preview Doğrulama Komutları

Preview domain'inizi `<preview-domain>` yerine kullanarak aşağıdaki komutları çalıştırın:

### A) Deployment Header Kontrolü
```bash
curl -sI https://<preview-domain> | findstr /i "x-vercel-deployment-url x-vercel-id etag cache-control"
```

### B) API Cache Kontrolü
```bash
curl -sI https://<preview-domain>/api/business/demo | findstr /i "cache server x-vercel age"
```

### C) Health Check
```bash
curl -s https://<preview-domain>/api/health
```

### D) API Data Kontrolü (Cache Buster ile)
PowerShell:
```powershell
$timestamp = [int][double]::Parse((Get-Date -UFormat %s))
curl -s "https://<preview-domain>/api/business/demo?ts=$timestamp"
```

Cmd:
```cmd
curl -s "https://<preview-domain>/api/business/demo?ts=%RANDOM%"
```

### E) Debug Route (Preview DB Kontrolü)
```bash
curl -s https://<preview-domain>/api/debug/db
```

Beklenen response:
```json
{
  "env": "preview",
  "vercelUrl": "your-preview-url.vercel.app",
  "dbUrlTail": "***@aws-0-us-east-1.pooler.supabase.com:xxxx/...",
  "now": "2025-10-18T00:00:00.000Z",
  "timestamp": "2025-10-18T00:00:00.000Z"
}
```

**⚠️ Önemli:** Debug route'u kullanım sonrası silin veya devre dışı bırakın!

### F) POST Test
```bash
curl -s -X POST "https://<preview-domain>/api/business/demo" ^
  -H "content-type: application/json" ^
  -d "{\"name\":\"PreviewTest\",\"startsAt\":\"2025-10-20T09:00:00.000Z\"}"
```

### G) Sitemap Kontrolü
```bash
curl -I https://<preview-domain>/sitemap.xml
```

## 4. Sorun Giderme Checklist

Preview çalışmıyorsa bu adımları kontrol edin:

- [ ] Preview env satırları Vercel'de var mı? (Her KEY için iki satır görmelisiniz)
- [ ] Clear build cache ile redeploy edildi mi?
- [ ] `dynamic`, `revalidate`, `fetchCache` bayrakları API route'larda var mı?
- [ ] `lib/prisma.ts` global singleton pattern kullanıyor mu?
- [ ] Preview DB firewall/SSL ayarları doğru mu?
- [ ] `/api/debug/db` doğru DB imzasını gösteriyor mu?
- [ ] Build loglarında Prisma deployment başarılı mı?

## 5. Build Script Detayları

### package.json Scripts:
```json
{
  "postinstall": "prisma generate",
  "build": "next build --turbopack",
  "vercel-build": "npm run predeploy && npm run build",
  "predeploy": "node scripts/prisma-deploy.js"
}
```

### Prisma Deploy Stratejisi:
- **Production:** `prisma migrate deploy` (güvenli migrations)
- **Preview:** `prisma db push --accept-data-loss` (schema sync)
- **Development:** `prisma generate` (client generation)

## 6. API Routes Cache Yapılandırması

Tüm API route'lar aşağıdaki cache-prevention yapılandırmasını kullanıyor:

```typescript
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

// Response headers:
{
  "cache-control": "no-store, no-cache, must-revalidate, max-age=0"
}
```

## 7. Başarı Kriterleri

Preview ortamı doğru çalışıyorsa:

✅ `/api/debug/db` → `env: "preview"` döner  
✅ API'ler cache header'larında `no-store` gösterir  
✅ Yeni veri POST edildiğinde anında görünür  
✅ Build logları `prisma db push --accept-data-loss` gösterir  
✅ Sitemap timeout vermez  
✅ Health endpoint 200 OK döner  

## 8. Production Deploy Öncesi Checklist

Preview'da her şey çalıştıktan sonra Production'a deploy etmeden önce:

- [ ] Preview'da tam test edildi
- [ ] Tüm API endpoint'leri çalışıyor
- [ ] Database migrasyonları hazır
- [ ] Environment variables Production için ayarlandı
- [ ] `/api/debug/db` route'u kaldırıldı veya production'da disabled
- [ ] Linter ve type check hatasız
- [ ] Build başarılı

## 9. Hızlı Komut Referansı (PowerShell)

```powershell
# Preview domain'i değişken olarak ayarla
$preview = "your-preview-url.vercel.app"

# Tüm testleri sırayla çalıştır
curl -sI "https://$preview"
curl -sI "https://$preview/api/business/demo"
curl -s "https://$preview/api/health"
curl -s "https://$preview/api/debug/db"
curl -I "https://$preview/sitemap.xml"
```

## 10. İletişim ve Destek

Sorun devam ederse:
- Vercel build loglarını kontrol edin
- Preview deployment loglarını inceleyin
- Database connection string'ini doğrulayın
- Prisma studio ile DB'yi manuel kontrol edin: `npm run prisma:studio`
