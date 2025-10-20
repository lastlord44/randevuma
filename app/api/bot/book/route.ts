// ping
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { name, startsAtTR } = body ?? {};

    if (!name) {
      return NextResponse.json({ error: "name zorunludur" }, { status: 400 });
    }

    // EÄŸer startsAtTR yoksa, yarÄ±n 10:00 (TR) slotu dene
    let when: Date;
    if (startsAtTR) {
      when = new Date(startsAtTR);
      if (Number.isNaN(when.getTime())) {
        return NextResponse.json({ error: "startsAtTR geÃ§ersiz tarih" }, { status: 400 });
      }
    } else {
      // YarÄ±n 10:00 (TR) slotu
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);
      when = tomorrow;
    }

    // Burada gerÃ§ek booking logic'i olacak
    return NextResponse.json({ 
      ok: true, 
      booking: { 
        id: "demo-" + Date.now(), 
        name, 
        startsAt: when.toISOString() 
      } 
    }, { status: 201 });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
