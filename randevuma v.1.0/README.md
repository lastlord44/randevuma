# Randevuma

Online randevu yönetim sistemi - İşletmeler için modern randevu takip çözümü.

## 🚀 Özellikler

- ✅ Next.js 14 (App Router) + TypeScript
- ✅ Tailwind CSS + shadcn/ui
- ✅ Prisma + PostgreSQL
- ✅ Mobil öncelikli responsive tasarım
- ✅ Türkçe dil desteği
- ✅ Basit ve hızlı randevu akışı

## 📋 Kurulum

### Gereksinimler

- Node.js 18+ 
- PostgreSQL
- npm veya yarn

### Adım 1: Projeyi klonlayın

```bash
git clone https://github.com/lastlord44/randevuma.git
cd randevuma
```

### Adım 2: Bağımlılıkları yükleyin

```bash
npm install
```

### Adım 3: Ortam değişkenlerini yapılandırın

```bash
cp .env.example .env
```

`.env` dosyasını düzenleyin:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/randevuma?schema=public"
NEXTAUTH_SECRET="your-secret-key-here-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
```

### Adım 4: Veritabanını kurun

```bash
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
```

### Adım 5: Geliştirme sunucusunu başlatın

```bash
npm run dev
```

Uygulama [http://localhost:3000](http://localhost:3000) adresinde çalışacaktır.

## 🎯 Demo Sayfası

Demo sayfasını görmek için: [http://localhost:3000/b/demo](http://localhost:3000/b/demo)

## 📁 Proje Yapısı

```
randevuma/
├── app/                    # Next.js App Router
│   ├── auth/              # Giriş/Kayıt sayfaları
│   ├── b/[slug]/          # Randevu alma sayfası
│   ├── dashboard/         # Admin paneli
│   ├── globals.css        # Global stiller
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Ana sayfa
├── lib/                   # Utilitiy fonksiyonları
│   ├── db.ts             # Prisma client singleton
│   └── utils.ts          # Yardımcı fonksiyonlar
├── prisma/               # Prisma yapılandırması
│   ├── schema.prisma     # Veritabanı şeması
│   └── seed.ts          # Demo verileri
├── components.json       # shadcn/ui yapılandırması
├── middleware.ts         # Route koruması
└── README.md
```

## 🗄️ Veritabanı Modelleri

- **User**: Kullanıcı hesapları
- **Business**: İşletme bilgileri
- **Service**: Hizmetler (saç kesimi, sakal tıraşı vb.)
- **Staff**: Personel bilgileri
- **WorkingHours**: Çalışma saatleri
- **Appointment**: Randevular

## 🛠️ Kullanılan Teknolojiler

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Database**: PostgreSQL, Prisma ORM
- **Icons**: Lucide React
- **Authentication**: NextAuth.js (ileride eklenecek)

## 📱 Sayfalar

- `/` - Landing page
- `/auth/sign-in` - Giriş sayfası
- `/auth/sign-up` - Kayıt sayfası  
- `/dashboard` - Admin paneli (korumalı)
- `/b/[slug]` - Randevu alma sayfası

## 🔄 Randevu Akışı

1. **Hizmet Seçimi** - Müşteri hizmet seçer
2. **Personel Seçimi** - Uzman personel seçilir
3. **Tarih/Saat Seçimi** - Uygun zaman seçilir
4. **İletişim Bilgileri** - Müşteri bilgileri alınır
5. **Onay** - Randevu oluşturulur

## 🚀 Geliştirme

### Mevcut Scriptler

```bash
npm run dev          # Geliştirme sunucusu
npm run build        # Production build
npm run start        # Production sunucusu
npm run lint         # ESLint kontrolü
npm run prisma:generate     # Prisma client oluştur
npm run prisma:migrate      # Veritabanı migrasyonu
npm run prisma:seed         # Demo verileri yükle
npm run prisma:studio       # Prisma Studio
```

## 👥 Demo Verileri

Seed script ile oluşturulan demo içerik:

- Demo işletme (slug: `demo`)
- 2 personel
- 3 hizmet
- Çalışma saatleri
- 1 örnek randevu

## 📄 Lisans

MIT License

## 🤤 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Commit yapın (`git commit -m 'Add some AmazingFeature'`)
4. Push yapın (`git push origin feature/AmazingFeature`)
5. Pull Request açın

## 📞 İletişim

Proje hakkında sorularınız için: [GitHub Issues](https://github.com/lastlord44/randevuma/issues)

---

**MVP v1.0** - Sprint 1 ✨