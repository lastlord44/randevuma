import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const tr = (d = new Date()) => new Date(d.toLocaleString("en-US", { timeZone: "Europe/Istanbul" }));

export async function GET() {
  try {
    const last = await prisma.booking.findFirst({
      orderBy: { createdAt: "desc" },
      select: { id:true, name:true, startsAt:true, createdAt:true }
    });
    return NextResponse.json({
      ok: true,
      env: process.env.VERCEL_ENV || process.env.NODE_ENV,
      lastBooking: last ? {
        ...last,
        startsAtTR: tr(last.startsAt).toISOString(),
      } : null
    });
  } catch (e:any) {
    return NextResponse.json({ ok:false, error:e?.message||"server" }, { status:500 });
  }
}