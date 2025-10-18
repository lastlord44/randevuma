import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const toTR = (d = new Date()) => new Date(d.toLocaleString("en-US", { timeZone: "Europe/Istanbul" }));
const toUTC = (trDate: Date) => new Date(trDate.getTime() - trDate.getTimezoneOffset() * 60000);

export async function GET() {
  let slotTR = toTR(); slotTR.setDate(slotTR.getDate() + 1); slotTR.setHours(10,0,0,0);
  for (let i = 0; i < 16; i++) {
    const exists = await prisma.booking.findFirst({ where: { startsAt: toUTC(slotTR) } });
    if (!exists) {
      return NextResponse.json(
        { ok: true, slotTR: slotTR.toISOString(), slotUTC: toUTC(slotTR).toISOString() },
        { headers: { "cache-control": "no-store" } }
      );
    }
    slotTR = new Date(slotTR.getTime() + 30 * 60 * 1000);
  }
  return NextResponse.json({ ok: false, error: "Bugün için uygun slot yok" }, { status: 409 });
}