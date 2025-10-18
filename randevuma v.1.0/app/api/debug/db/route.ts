import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  if (process.env.VERCEL_ENV !== "preview") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  
  try {
    const now = await prisma.$queryRawUnsafe<{ now: Date }[]>("select now()");
    const dbUrlTail = (process.env.DATABASE_URL || "").replace(/.+@/, "***@").slice(-40);
    
    return NextResponse.json({
      env: process.env.VERCEL_ENV,
      vercelUrl: process.env.VERCEL_URL,
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
      dbUrlTail: dbUrlTail,
      now: now?.[0]?.now ?? null,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ 
      error: "DB connection failed", 
      env: process.env.VERCEL_ENV,
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
