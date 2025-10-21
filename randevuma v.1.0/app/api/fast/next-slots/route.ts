import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { addMinutes } from "date-fns";
import { withBuffers, hasOverlap, minutesToDate } from "@/lib/booking";
import { z } from "zod";

const Q = z.object({
  businessSlug: z.string(),
  serviceId: z.string(),
  staffId: z.string().optional(),
  date: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const q = Q.parse(Object.fromEntries(req.nextUrl.searchParams));

    const business = await prisma.business.findUnique({
      where: { slug: q.businessSlug },
    });
    if (!business)
      return NextResponse.json({ error: "Business not found" }, { status: 404 });

    const service = await prisma.service.findUnique({
      where: { id: q.serviceId },
    });
    if (!service)
      return NextResponse.json({ error: "Service not found" }, { status: 404 });

    // tarih
    const base = q.date ? new Date(`${q.date}T00:00:00`) : new Date();
    base.setHours(0, 0, 0, 0);

    // çalışma saatleri (1=Mon..7=Sun)
    const weekday = ((base.getDay() + 6) % 7) + 1;
    const wh = await prisma.workingHours.findFirst({
      where: { businessId: business.id, weekday, isActive: true },
    });
    if (!wh) return NextResponse.json({ slots: [] });

    // erişilebilir personeller
    const staff = q.staffId
      ? await prisma.staff.findMany({
          where: { businessId: business.id, id: q.staffId, isActive: true },
        })
      : await prisma.staff.findMany({
          where: { businessId: business.id, isActive: true },
          orderBy: { name: "asc" },
        });

    if (staff.length === 0) return NextResponse.json({ slots: [] });

    // gün slotları (15dk)
    const slots: { startISO: string; staffId: string; label: string }[] = [];

    const open = minutesToDate(base, wh.openMin);
    const close = minutesToDate(base, wh.closeMin);
    const now = new Date();

    for (const s of staff) {
      // personelin gün içi randevuları
      const appts = await prisma.appointment.findMany({
        where: {
          businessId: business.id,
          staffId: s.id,
          startAt: { gte: open },
          endAt: { lte: close },
          status: { in: ["booked", "done"] },
        },
        orderBy: { startAt: "asc" },
      });

      for (
        let t = new Date(open);
        t < close;
        t = addMinutes(t, 15)
      ) {
        // Geçmiş slotları atla
        if (t < now) continue;

        const { startWithBefore, end } = withBuffers(t, {
          durationMin: service.duration,
          bufferBefore: service.bufferBefore,
          bufferAfter: service.bufferAfter,
        });

        const conflict = appts.some((a) =>
          hasOverlap(startWithBefore, end, a.startAt, a.endAt)
        );
        
        if (!conflict) {
          slots.push({
            startISO: t.toISOString(),
            staffId: s.id,
            label: t.toLocaleTimeString("tr-TR", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            }),
          });
          if (slots.length >= 3) break;
        }
      }
      if (slots.length >= 3) break;
    }

    return NextResponse.json({ slots });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}


