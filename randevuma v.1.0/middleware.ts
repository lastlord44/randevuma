import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const WINDOW_MS = 60_000; // 1 dk
const LIMIT = 20;         // IP başına istek/dk (fast endpoints)

const BUCKET = new Map<string, { c: number; ts: number }>();

export function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Cihaz kimliği (lightweight)
  if (!req.cookies.get("rdid")) {
    res.cookies.set("rdid", crypto.randomUUID(), {
      httpOnly: true, sameSite: "lax", secure: true, maxAge: 60 * 60 * 24 * 365
    });
  }

  // Sadece fast API'leri sınırlayalım
  const p = req.nextUrl.pathname;
  if (!p.startsWith("/api/fast/")) return res;

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
    req.headers.get("x-real-ip") || 
    "anon";
  const now = Date.now();
  const b = BUCKET.get(ip) ?? { c: 0, ts: now };
  if (now - b.ts > WINDOW_MS) { b.c = 0; b.ts = now; }
  b.c++; BUCKET.set(ip, b);

  if (b.c > LIMIT) return new NextResponse("Too Many Requests", { status: 429 });
  return res;
}

export const config = { matcher: ["/api/fast/:path*"] };
