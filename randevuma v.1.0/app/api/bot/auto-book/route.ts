import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { name, startsAt } = body ?? {};

    if (!name) {
      return NextResponse.json({ error: "name zorunludur" }, { status: 400 });
    }

    // EÄŸer startsAt yoksa, yarÄ±n 10:00 (TR) slotu dene
    let when: Date;
    if (startsAt) {
      when = new Date(startsAt);
      if (Number.isNaN(when.getTime())) {
        return NextResponse.json({ error: "startsAt geÃ§ersiz tarih" }, { status: 400 });
      }
    } else {
      // YarÄ±n 10:00 (TR) slotu
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);
      when = tomorrow;
    }

    const created = await prisma.booking.create({
      data: { 
        name, 
        email: null, 
        phone: null, 
        note: "Admin panelinden oluÅŸturuldu", 
        startsAt: when 
      },
      select: { id: true, name: true, startsAt: true },
    });

    return NextResponse.json({ ok: true, booking: created }, { status: 201 });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
