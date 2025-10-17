import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Örnek: son 20 kaydı getir
    const items = await prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { id: true, name: true, startsAt: true, createdAt: true },
    });
    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { name, email, phone, note, startsAt } = body ?? {};

    // Basit doğrulama (ileride Zod ile geliştirebiliriz)
    if (!name || !startsAt) {
      return NextResponse.json(
        { error: "name ve startsAt zorunludur" },
        { status: 400 }
      );
    }

    const when = new Date(startsAt);
    if (Number.isNaN(when.getTime())) {
      return NextResponse.json({ error: "startsAt geçersiz tarih" }, { status: 400 });
    }

    // (Opsiyonel) basit anti-spam: 5 sn içinde aynı IP'den tekrar engelle vb.

    const created = await prisma.booking.create({
      data: { name, email, phone, note, startsAt: when },
      select: { id: true, name: true, startsAt: true },
    });

    return NextResponse.json({ ok: true, booking: created }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}