# Randevuma - Multi-Tenant Randevu SaaS

Türkiye odaklı, modern ve kullanıcı dostu multi-tenant randevu yönetim sistemi. Next.js 14 ve Tailwind CSS ile geliştirilmiştir.

## 🚀 Özellikler

### İşletme Paneli
- **Dashboard**: Günlük randevular, istatistikler ve hızlı erişim
- **Randevu Yönetimi**: Randevu oluşturma, düzenleme, onaylama ve iptal etme
- **Müşteri Yönetimi**: Müşteri bilgilerini kaydetme ve görüntüleme
- **Hizmet Yönetimi**: Sunulan hizmetleri, fiyatları ve sürelerini yönetme
- **Çalışma Saatleri**: Haftalık çalışma programı ve tatil günleri ayarlama
- **Ayarlar**: İşletme bilgileri, bölgesel ayarlar ve sistem yapılandırması

### Teknik Özellikler
- ⚡ **Next.js 14** - App Router ile modern React uygulaması
- 🎨 **Tailwind CSS** - Responsive ve özelleştirilebilir tasarım
- 🔒 **Multi-Tenant Mimari** - Her işletme kendi alanında çalışır
- 🇹🇷 **Türkçe Arayüz** - Tamamen Türkçe dil desteği
- 📅 **Türkiye Saat Dilimi** - Europe/Istanbul timezone desteği
- 💰 **TL Para Birimi** - Türk Lirası formatında fiyatlandırma
- 📱 **Responsive Tasarım** - Mobil, tablet ve masaüstü uyumlu

## 📦 Kurulum

### Gereksinimler
- Node.js 18.x veya üzeri
- npm veya yarn

### Adımlar

1. **Projeyi klonlayın:**
```bash
git clone https://github.com/lastlord44/randevuma.git
cd randevuma
```

2. **Bağımlılıkları yükleyin:**
```bash
npm install
```

3. **Geliştirme sunucusunu başlatın:**
```bash
npm run dev
```

4. **Tarayıcıda açın:**
```
http://localhost:3000
```

## 🔧 Kullanım

### Geliştirme
```bash
npm run dev      # Geliştirme sunucusunu başlat
npm run build    # Production build oluştur
npm run start    # Production sunucusunu başlat
npm run lint     # Kod kalitesini kontrol et
```

### Proje Yapısı
```
randevuma/
├── app/                    # Next.js App Router
│   ├── panel/             # İşletme paneli sayfaları
│   │   ├── randevular/    # Randevu yönetimi
│   │   ├── musteriler/    # Müşteri yönetimi
│   │   ├── hizmetler/     # Hizmet yönetimi
│   │   ├── calisma-saatleri/  # Çalışma saatleri
│   │   └── ayarlar/       # Ayarlar
│   ├── layout.tsx         # Ana layout
│   └── page.tsx           # Ana sayfa
├── components/            # React bileşenleri
├── lib/                   # Yardımcı fonksiyonlar
│   ├── constants.ts       # Türkçe sabitler
│   └── utils.ts           # Yardımcı fonksiyonlar
├── types/                 # TypeScript tip tanımlamaları
└── public/               # Statik dosyalar
```

## 🎯 Kullanılan Teknolojiler

- **Framework**: Next.js 14.2.x
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS 3.x
- **UI**: React 18.x
- **Build Tool**: Webpack (Next.js dahili)
- **Linting**: ESLint

## 🌐 Özellik Detayları

### Multi-Tenant Mimari
Her işletme kendi subdomain veya path ile erişilebilir:
- `isletme1.randevuma.com`
- `randevuma.com/isletme1`

### Türkçe Yerelleştirme
- Türkçe karakter desteği
- Türk Lirası formatı (₺)
- Türkiye saat dilimi (Europe/Istanbul)
- Türkçe gün ve ay isimleri
- Türkçe durum mesajları

### Randevu Sistemi
- Çakışma kontrolü
- Otomatik onay seçeneği
- E-posta/SMS bildirimleri
- İptal yönetimi
- Takvim görünümü

## 📝 Veri Modeli

### Tenant (İşletme)
- İşletme bilgileri
- Çalışma saatleri
- Ayarlar ve yapılandırma

### User (Kullanıcı)
- Admin, staff, customer rolleri
- İşletmeye bağlı kullanıcılar

### Appointment (Randevu)
- Müşteri ve hizmet bilgisi
- Tarih/saat
- Durum (beklemede, onaylandı, iptal, tamamlandı)

### Service (Hizmet)
- Hizmet adı ve açıklama
- Süre ve fiyat
- Kategori

## 🚧 Geliştirme Planı

- [ ] Veritabase entegrasyonu (PostgreSQL/MongoDB)
- [ ] Kullanıcı authentication sistemi
- [ ] E-posta/SMS bildirimleri
- [ ] Ödeme entegrasyonu
- [ ] Raporlama modülü
- [ ] Mobil uygulama
- [ ] API dokümantasyonu
- [ ] Test coverage

## 📄 Lisans

Bu proje ISC lisansı altında lisanslanmıştır.

## 🤝 Katkıda Bulunma

Katkılarınızı bekliyoruz! Lütfen pull request göndermeden önce:

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some AmazingFeature'`)
4. Branch'inizi push edin (`git push origin feature/AmazingFeature`)
5. Pull Request açın

## 📧 İletişim

Proje Sahibi - [@lastlord44](https://github.com/lastlord44)

Proje Linki: [https://github.com/lastlord44/randevuma](https://github.com/lastlord44/randevuma)

---

⭐ Bu projeyi beğendiyseniz yıldız vermeyi unutmayın!
