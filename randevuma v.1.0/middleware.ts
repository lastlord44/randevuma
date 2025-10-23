import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Basit in-memory rate limiter (production'da Redis/Vercel KV kullanılmalı)
const rateLimit = new Map<string, { count: number; resetAt: number }>();

function cleanupOldEntries() {
  const now = Date.now();
  for (const [key, value] of rateLimit.entries()) {
    if (now > value.resetAt) {
      rateLimit.delete(key);
    }
  }
}

function checkRateLimit(ip: string): boolean {
  cleanupOldEntries();
  
  const now = Date.now();
  const record = rateLimit.get(ip);
  
  if (!record || now > record.resetAt) {
    // Yeni pencere başlat: 60 saniyede 10 istek
    rateLimit.set(ip, { count: 1, resetAt: now + 60000 });
    return true;
  }
  
  if (record.count >= 10) {
    return false; // Rate limit aşıldı
  }
  
  record.count++;
  return true;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // API rotalarını koru
  if (pathname.startsWith('/api/fast/')) {
    // IP adresini al
    const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? 'unknown';
    
    // Rate limit kontrolü
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }
    
    // CORS: sadece kendi origin'e izin ver
    const origin = request.headers.get('origin');
    const response = NextResponse.next();
    
    if (origin) {
      const url = new URL(request.url);
      // Production'da sadece kendi domain'e izin ver
      if (origin === url.origin) {
        response.headers.set('Access-Control-Allow-Origin', origin);
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
      }
    }
    
    // OPTIONS request için
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 200, headers: response.headers });
    }
    
    return response;
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/api/fast/:path*',
};