import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const toTR = (d = new Date()) => new Date(d.toLocaleString("en-US", { timeZone: "Europe/Istanbul" }));
const toUTC = (trDate: Date) => new Date(trDate.getTime() - trDate.getTimezoneOffset() * 60000);

export async function POST(req: Request) {
  try {
    const { name, startsAt } = await req.json().catch(() => ({}));
    
    if (!name) {
      return NextResponse.json({ error: "name gerekli" }, { status: 400 });
    }

    let startsUtc: Date;
    
    if (startsAt) {
      const parsed = new Date(startsAt);
      if (Number.isNaN(parsed.getTime())) {
        return NextResponse.json({ error: "geçersiz tarih" }, { status: 400 });
      }
      startsUtc = parsed;
    } else {
      // Otomatik: yarın 10:00
      let slotTR = toTR();
      slotTR.setDate(slotTR.getDate() + 1);
      slotTR.setHours(10, 0, 0, 0);
      startsUtc = toUTC(slotTR);
    }

    // Çakışma kontrolü
    const existing = await prisma.booking.findFirst({
      where: { startsAt: startsUtc }
    });
    
    if (existing) {
      return NextResponse.json({ error: "Bu slot dolu" }, { status: 409 });
    }

    const created = await prisma.booking.create({
      data: {
        name,
        startsAt: startsUtc
      },
      select: { id: true, name: true, startsAt: true }
    });

    return NextResponse.json({
      ok: true,
      booking: created
    });

  } catch (e: any) {
    return NextResponse.json({
      ok: false,
      error: e?.message || "Server error"
    }, { status: 500 });
  }
}