import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const WINDOW_MS = 60_000; // 1 dk
const LIMIT = 10;         // IP başına 10 istek
const BUCKET = new Map<string, { count: number; ts: number }>();

export function middleware(req: NextRequest) {
  if (!req.nextUrl.pathname.startsWith("/api/fast/")) return NextResponse.next();
  const ip = req.ip ?? req.headers.get("x-forwarded-for") ?? "anon";
  const now = Date.now();
  const b = BUCKET.get(ip) ?? { count: 0, ts: now };
  if (now - b.ts > WINDOW_MS) { b.count = 0; b.ts = now; }
  b.count++; BUCKET.set(ip, b);
  if (b.count > LIMIT) return new NextResponse("Too Many Requests", { status: 429 });
  return NextResponse.next();
}

export const config = { matcher: ["/api/fast/:path*"] };
