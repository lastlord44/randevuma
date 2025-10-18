import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const trToUTC = (s: string) => {
  const tr = new Date(s);
  if (Number.isNaN(tr.getTime())) return null;
  return new Date(tr.getTime() - tr.getTimezoneOffset() * 60000);
};

export async function POST(req: Request) {
  try {
    const { name, email, phone, note, startsAtTR } = await req.json().catch(()=>({}));
    if (!name || !startsAtTR) return NextResponse.json({ error: "name & startsAtTR gerekli" }, { status: 400 });

    const startsUtc = trToUTC(startsAtTR);
    if (!startsUtc) return NextResponse.json({ error: "geçersiz tarih" }, { status: 400 });

    const created = await prisma.booking.create({
      data: { name, email, phone, note, startsAt: startsUtc },
      select: { id: true, name: true, startsAt: true },
    });

    return NextResponse.json({ ok: true, booking: created }, { headers: { "cache-control": "no-store" } });
  } catch (e: any) {
    const msg = String(e?.message || "");
    if (msg.includes("Unique") || msg.includes("unique")) {
      return NextResponse.json({ ok: false, error: "slot dolu" }, { status: 409 });
    }
    return NextResponse.json({ ok: false, error: "server" }, { status: 500 });
  }
}