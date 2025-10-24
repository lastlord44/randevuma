import { NextRequest, NextResponse } from "next/server";
import { prisma} from "@/lib/prisma";
import { withBuffers, weekday1to7 } from "@/lib/booking";
import { z } from "zod";

// Force Node.js runtime (required for Prisma with Turso adapter)
export const runtime = 'nodejs';

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

    // Log booking request (phone hashed for privacy)
    const phoneHash = require('crypto').createHash('sha256').update(phone).digest('hex').substring(0, 8);
    console.info('BOOK_REQ', {
      shopSlug: body.businessSlug,
      serviceId: body.serviceId,
      staffId: body.staffId,
      startISO: body.startAtISO.toISOString(),
      phoneHash,
    });

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

    // --- 4) İdempotency check: Aynı slot için zaten randevu var mı?
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        staffId: body.staffId,
        startAt,
        status: { in: ["booked", "done"] },
      },
    });

    if (existingAppointment) {
      // Aynı müşteri mi tekrar deniyor? → İdempotent response
      if (existingAppointment.customerTel === phone) {
        return NextResponse.json(
          { ok: true, appointment: existingAppointment, idempotent: true },
          { status: 200 }
        );
      }
      // Başka biri almış → 409 Conflict
      return NextResponse.json(
        { ok: false, error: "slot_taken", message: "Bu saat başka bir müşteri tarafından alındı" },
        { status: 409 }
      );
    }

    // --- 5) Klasik transaction + overlap kontrolü
    try {
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
    } catch (txError: any) {
      // Race condition fallback: Unique constraint violation
      if (txError.code === 'P2002' && txError.meta?.target?.includes('staffId_startAt')) {
        return NextResponse.json(
          { ok: false, error: "slot_taken", message: "Bu saat başka bir müşteri tarafından alındı (race condition)" },
          { status: 409 }
        );
      }
      throw txError; // Diğer hataları üst catch'e fırlat
    }
  } catch (e: any) {
    console.error("[BOOKING ERROR]", e);
    return NextResponse.json({ ok: false, error: e.message ?? "Error" }, { status: 400 });
  }
}
