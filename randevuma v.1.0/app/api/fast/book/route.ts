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
  _trap: z.string().optional(), // honeypot
});

export async function POST(req: NextRequest) {
  try {
    // --- 0) HONEYPOT (botlar için - sadece doluysa reject et)
    const raw = await req.json();
    if (raw?._trap && raw._trap.trim().length > 0) {
      // Log honeypot trigger
      const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip");
      await prisma.riskLog.create({
        data: {
          businessId: raw.businessSlug || "unknown",
          type: "honeypot",
          ip: ip || undefined,
          phone: raw.customerTel || undefined,
          deviceId: req.cookies.get("rdid")?.value,
          userAgent: req.headers.get("user-agent") || undefined,
          path: req.nextUrl.pathname,
        },
      }).catch(() => {}); // silent fail
      return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
    }

    // --- 1) Zod parse
    const body = Body.parse(raw);

    // --- 2) Temiz telefon + basit kotalar
    const phone = String(body.customerTel).replace(/\D/g, ""); // sadece rakam
    if (phone.length < 10) {
      return NextResponse.json({ ok: false, error: "Geçersiz telefon" }, { status: 400 });
    }

    const business = await prisma.business.findUnique({ where: { slug: body.businessSlug } });
    if (!business) return NextResponse.json({ error: "Business not found" }, { status: 404 });

    const service = await prisma.service.findUnique({ where: { id: body.serviceId } });
    if (!service) return NextResponse.json({ error: "Service not found" }, { status: 404 });

    const startAt = body.startAtISO;
    const { startWithBefore, end } = withBuffers(startAt, {
      durationMin: service.durationMin,
      bufferBefore: service.bufferBefore,
      bufferAfter: service.bufferAfter,
    });

    // --- 3) Günlük / saatlik limitler (SMS yokken hızlı koruma)
    const now = new Date();
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const [dayCount, hourCount, futureDup] = await Promise.all([
      prisma.appointment.count({
        where: {
          businessId: business.id,
          customerTel: phone,
          startAt: { gte: dayStart },
          status: { in: ["booked", "done"] },
        },
      }),
      prisma.appointment.count({
        where: {
          businessId: business.id,
          customerTel: phone,
          createdAt: { gte: oneHourAgo },
        },
      }),
      prisma.appointment.findFirst({
        where: {
          businessId: business.id,
          customerTel: phone,
          // Aynı gün aynı pencereyi ikinci kez kapatma (30dk yakınında)
          startAt: { gte: new Date(startAt.getTime() - 30 * 60 * 1000) },
          endAt: { lte: new Date(end.getTime() + 30 * 60 * 1000) },
          status: { in: ["booked", "done"] },
        },
      }),
    ]);

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip");
    const deviceId = req.cookies.get("rdid")?.value;

    if (dayCount >= 2) {
      await prisma.riskLog.create({
        data: { businessId: business.id, type: "quota", ip, phone, deviceId, path: req.nextUrl.pathname },
      }).catch(() => {});
      return NextResponse.json({ ok: false, error: "Bu telefonla bugün en fazla 2 randevu alınabilir." }, { status: 429 });
    }
    if (hourCount >= 1) {
      await prisma.riskLog.create({
        data: { businessId: business.id, type: "ratelimit", ip, phone, deviceId, path: req.nextUrl.pathname },
      }).catch(() => {});
      return NextResponse.json({ ok: false, error: "Lütfen biraz sonra tekrar deneyin." }, { status: 429 });
    }
    if (futureDup) {
      await prisma.riskLog.create({
        data: { businessId: business.id, type: "duplicate", ip, phone, deviceId, path: req.nextUrl.pathname },
      }).catch(() => {});
      return NextResponse.json({ ok: false, error: "Seçilen saate benzer bir randevunuz zaten var." }, { status: 409 });
    }

    // --- 4) Klasik transaction + overlap kontrolü
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
          businessId: business.id,
          staffId: body.staffId,
          status: { in: ["booked", "done"] },
          NOT: [{ endAt: { lte: startWithBefore } }, { startAt: { gte: end } }],
        },
      });
      if (conflict) throw new Error("Time slot already taken");

      return tx.appointment.create({
        data: {
          businessId: business.id,
          staffId: body.staffId,
          serviceId: body.serviceId,
          customerName: body.customerName,
          customerTel: phone,
          startAt,
          endAt: end,
          status: "booked",
          note: body.note,
        },
      });
    });

    return NextResponse.json({ ok: true, appointment: appt }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message ?? "Error" }, { status: 400 });
  }
}
