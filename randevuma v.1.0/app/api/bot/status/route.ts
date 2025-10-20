import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export const runtime = 'nodejs';
export const dynamic = "force-dynamic";
export const revalidate = 0;

function tr(d = new Date()) {
  return new Date(d.toLocaleString("en-US", { timeZone: "Europe/Istanbul" }));
}

export async function GET() {
  try {
    const last = await prisma.booking.findFirst({
      orderBy: { createdAt: "desc" },
      select: { id:true, startsAt:true, createdAt:true, name:true }
    });
    return NextResponse.json({
      ok: true,
      env: process.env.VERCEL_ENV || process.env.NODE_ENV,
      cron: process.env.VERCEL ? "Vercel Cron (varsa vercel.json)" : "—",
      lastBooking: last ? {
        id: last.id,
        name: last.name,
        startsAt: last.startsAt,
        createdAt: last.createdAt,
        startsAtTR: tr(last.startsAt).toISOString()
      } : null,
      lastResult: "OK"
    });
  } catch (e:any) {
    return NextResponse.json({ ok:false, error:e?.message||"server" }, { status:500 });
  }
}