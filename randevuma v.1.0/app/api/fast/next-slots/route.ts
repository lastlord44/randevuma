import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { addMinutes } from "date-fns";
import { withBuffers, hasOverlap, weekday1to7, minutesToDate } from "@/lib/booking";
import { z } from "zod";

const Q = z.object({
  businessSlug: z.string(),
  serviceId: z.string(),
  staffId: z.string().optional(),
  date: z.string().optional(),        // YYYY-MM-DD
  limit: z.string().optional(),       // "3" (default) | "all" | "60"
  step: z.coerce.number().optional(), // dk (default 15)
});

export async function GET(req: NextRequest) {
  try {
    const q = Q.parse(Object.fromEntries(req.nextUrl.searchParams));
    const step = q.step ?? 15;
    const wantAll = (q.limit?.toLowerCase() === "all");
    const wanted = wantAll ? Number.MAX_SAFE_INTEGER : Number(q.limit ?? 3);

    const business = await prisma.business.findUnique({ where: { slug: q.businessSlug } });
    if (!business) return NextResponse.json({ error: "Business not found" }, { status: 404 });

    const service = await prisma.service.findUnique({ where: { id: q.serviceId } });
    if (!service) return NextResponse.json({ error: "Service not found" }, { status: 404 });

    const base = q.date ? new Date(`${q.date}T00:00:00`) : new Date();
    const weekday = weekday1to7(base);
    const wh = await prisma.workingHours.findFirst({ where: { businessId: business.id, weekday } });
    if (!wh) return NextResponse.json({ slots: [] });

    const staff = q.staffId
      ? await prisma.staff.findMany({ where: { businessId: business.id, id: q.staffId, active: true } })
      : await prisma.staff.findMany({
          where: { businessId: business.id, active: true, skills: { some: { serviceId: service.id } } },
          orderBy: { name: "asc" },
        });
    if (staff.length === 0) return NextResponse.json({ slots: [] });

    const open = minutesToDate(base, wh.openMin);
    const close = minutesToDate(base, wh.closeMin);

    const out: { startISO: string; staffId: string; label: string }[] = [];

    for (const s of staff) {
      const appts = await prisma.appointment.findMany({
        where: {
          businessId: business.id, staffId: s.id,
          startAt: { gte: open }, endAt: { lte: close },
          status: { in: ["booked", "done"] },
        },
        orderBy: { startAt: "asc" },
      });

      for (let t = new Date(open); t < close; t = addMinutes(t, step)) {
        const { startWithBefore, end } = withBuffers(t, {
          durationMin: service.durationMin,
          bufferBefore: service.bufferBefore,
          bufferAfter: service.bufferAfter,
        });
        const conflict = appts.some(a => hasOverlap(startWithBefore, end, a.startAt, a.endAt));
        if (!conflict) {
          out.push({
            startISO: t.toISOString(),
            staffId: s.id,
            label: t.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", hour12: false }),
          });
        }
        if (!wantAll && out.length >= wanted) break;
      }
      if (!wantAll && out.length >= wanted) break;
    }

    return NextResponse.json({ slots: out });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
