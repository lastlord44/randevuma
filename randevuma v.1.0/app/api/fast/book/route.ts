import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { z } from "zod";
import crypto from "crypto";

// Force Node.js runtime (required for Prisma with Turso adapter)
export const runtime = 'nodejs';

const Body = z.object({
  businessSlug: z.string().min(1),
  serviceId: z.string().min(1),
  staffId: z.string().min(1),
  startAtISO: z.string().transform(v => new Date(v)),
  customerName: z.string().min(2),
  customerTel: z.string().min(10),
  note: z.string().optional(),
  _trap: z.string().optional(), // honeypot
});

function phoneHash(tel: string) {
  return crypto.createHash('sha256').update(tel).digest('hex').slice(0, 8);
}

export async function POST(req: NextRequest) {
  const prisma = await getPrisma();
  try {
    // --- 0) HONEYPOT
    const raw = await req.json();
    if (raw?._trap && raw._trap.trim().length > 0) {
      return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
    }

    // --- 1) Zod parse
    const body = Body.parse(raw);
    const phone = String(body.customerTel).replace(/\D/g, "");
    if (phone.length < 10) {
      return NextResponse.json({ ok: false, error: "Geçersiz telefon" }, { status: 400 });
    }

    // --- 2) Lookup business & service (parallel)
    const [business, service] = await Promise.all([
      prisma.business.findUnique({ 
        where: { slug: body.businessSlug },
        select: { id: true }
      }),
      prisma.service.findUnique({ 
        where: { id: body.serviceId },
        select: { durationMin: true, bufferBefore: true, bufferAfter: true }
      })
    ]);

    if (!business) return NextResponse.json({ error: "Business not found" }, { status: 404 });
    if (!service) return NextResponse.json({ error: "Service not found" }, { status: 404 });

    const startAt = body.startAtISO;
    const durationMs = (service.durationMin + (service.bufferBefore || 0) + (service.bufferAfter || 0)) * 60 * 1000;
    const endAt = new Date(startAt.getTime() + durationMs);

    // LOG (hafif)
    console.info('BOOK_REQ', {
      shop: body.businessSlug,
      startISO: startAt.toISOString(),
      ph: phoneHash(phone),
    });

    // --- 3) Transaction: idempotency + conflict check + create
    try {
      const result = await prisma.$transaction(async (tx) => {
        // Idempotency: aynı kişi aynı slot?
        const existing = await tx.appointment.findFirst({
          where: {
            staffId: body.staffId,
            startAt,
            customerTel: phone,
            status: { in: ['booked', 'done'] },
          },
          select: { id: true, startAt: true, endAt: true, customerName: true }
        });
        
        if (existing) {
          return { appointment: existing, idempotent: true, created: false };
        }

        // Conflict check: slot zaten alınmış mı?
        const conflict = await tx.appointment.findFirst({
          where: {
            staffId: body.staffId,
            startAt,
            status: { in: ['booked', 'done'] },
          },
          select: { id: true }
        });

        if (conflict) {
          return { appointment: null, idempotent: false, created: false, conflict: true };
        }

        // Create booking (DB unique constraint as backup)
        const appt = await tx.appointment.create({
          data: {
            businessId: business.id,
            staffId: body.staffId,
            serviceId: body.serviceId,
            startAt,
            endAt,
            status: 'booked',
            customerName: body.customerName,
            customerTel: phone,
            note: body.note,
          },
        });

        return { appointment: appt, idempotent: false, created: true };
      });

      // Response handling
      if (result.conflict) {
        return NextResponse.json({ ok: false, error: 'slot_taken' }, { status: 409 });
      }
      
      if (result.idempotent) {
        return NextResponse.json({ 
          ok: true, 
          idempotent: true, 
          appointment: result.appointment 
        }, { status: 200 });
      }

      return NextResponse.json({ 
        ok: true, 
        appointment: result.appointment 
      }, { status: 201 });

    } catch (txError: any) {
      // Race condition fallback: Unique constraint violation
      if (txError.code === 'P2002' || String(txError.message).includes('Unique constraint')) {
        return NextResponse.json({ 
          ok: false, 
          error: 'slot_taken', 
          message: 'Slot alındı (race condition)' 
        }, { status: 409 });
      }
      throw txError;
    }

  } catch (e: any) {
    console.error('[BOOKING ERROR]', e);
    return NextResponse.json({ 
      ok: false, 
      error: e.message ?? 'Internal error' 
    }, { status: 400 });
  }
}
