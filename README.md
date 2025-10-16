Proje: Randevuma (multi-tenant randevu SaaS, TR pazarına odaklı)
Stack: Next.js 14 (App Router) + React 18 + Tailwind + shadcn/ui + NextAuth
DB: Prisma + Supabase (dev: local, prod: Supabase)
Deploy: Vercel

Hedef (Sprint-1 / MVP Core):
- Sayfalar: 
  /(landing), /auth/(sign-in|sign-up), /dashboard, /b/[slug] (herkese açık rezervasyon)
- Modüller (CRUD): Business, Service, Staff, Appointment, WorkingHours
- Takvim: Gün/Hafta görünümü (stub bile olur), basic rezervasyon akışı
- Çok kiracılık: session.businessId ile tenant izolasyonu; /dashboard korumalı
- TR varsayılan dil; mobil-öncelikli UI

İstekler:
- Typescript, ESLint+Prettier, absolute imports (@"/*")
- shadcn/ui + lucide-react, basit tema (light)
- Dosya düzeni:
  /app/(marketing)/page.tsx
  /app/(auth)/sign-in/page.tsx, /sign-up/page.tsx
  /app/(app)/dashboard/page.tsx
  /app/b/[slug]/page.tsx
  /components/* (Navbar, Sidebar, Form, Calendar stub)
  /lib/db.ts, /lib/auth.ts, /lib/validations.ts
  /schemas/prisma/schema.prisma (User, Business, Service, Staff, Appointment, WorkingHours)
- NextAuth e-posta+şifre (Credentials) veya OAuth stub; .env örneği hazırla
- Prisma seed: tek işletme + 2 personel + 3 hizmet + çalışma saatleri + örnek randevu
- Basit rezervasyon akışı: /b/[slug] → hizmet seç → tarih/saat → isim/telefon → create Appointment
- Middleware: /dashboard için auth zorunlu
- Test/Doğrulama: 
  1) Seed sonrası /b/demo ile rezervasyon oluşturulabiliyor
  2) /dashboard’da hizmet ekle-sil-düzenle çalışıyor
  3) Tenant izolasyonu: başka işletmenin verisi görünmez

Çıktı:
- İlk PR: çalışır MVP iskeleti + README (kurulum, .env örneği, seed ve run komutları)
- NPM scriptleri: dev, build, start, lint, prisma:generate, prisma:migrate, prisma:seed
- Commit formatı: feat:, fix:, chore:, docs:
