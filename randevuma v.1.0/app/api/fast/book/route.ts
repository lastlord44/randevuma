import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withBuffers, weekday1to7 } from "@/lib/booking";
import { z } from "zod";

const Body = z.object({
  businessSlug: z.string(),
  serviceId: z.string(),
  staffId: z.string(),
  startAtISO: z.string().transform(v => new Date(v)),
  customerName: z.string().min(2),
  customerTel: z.string().min(10),
  note: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = Body.parse(await req.json());

    const business = await prisma.business.findUnique({ where: { slug: body.businessSlug } });
    if (!business) return NextResponse.json({ error: "Business not found" }, { status: 404 });

    const service = await prisma.service.findUnique({ where: { id: body.serviceId } });
    if (!service) return NextResponse.json({ error: "Service not found" }, { status: 404 });

    const startAt = body.startAtISO;
    const { startWithBefore, end } = withBuffers(startAt, {
      durationMin: service.durationMin, bufferBefore: service.bufferBefore, bufferAfter: service.bufferAfter,
    });

    const appt = await prisma.$transaction(async (tx) => {
      const weekday = weekday1to7(startAt);
      const wh = await tx.workingHours.findFirst({ where: { businessId: business.id, weekday } });
      if (!wh) throw new Error("Working hours missing");

      const mins = startAt.getHours() * 60 + startAt.getMinutes();
      const endM = end.getHours() * 60 + end.getMinutes();
      if (mins < wh.openMin || endM > wh.closeMin) throw new Error("Outside working hours");

      const timeoff = await tx.staffTimeOff.findFirst({
        where: { staffId: body.staffId, NOT: [{ endAt: { lte: startWithBefore } }, { startAt: { gte: end } }] },
      });
      if (timeoff) throw new Error("Staff unavailable");

      const conflict = await tx.appointment.findFirst({
        where: {
          businessId: business.id, staffId: body.staffId, status: { in: ["booked", "done"] },
          NOT: [{ endAt: { lte: startWithBefore } }, { startAt: { gte: end } }],
        },
      });
      if (conflict) throw new Error("Time slot already taken");

      return tx.appointment.create({
        data: {
          businessId: business.id, staffId: body.staffId, serviceId: body.serviceId,
          customerName: body.customerName, customerTel: body.customerTel,
          startAt, endAt: end, status: "booked", note: body.note,
        },
      });
    });

    return NextResponse.json({ ok: true, appointment: appt }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
  }
}
