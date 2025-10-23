import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const BanSchema = z.object({
  businessId: z.string(),
  type: z.enum(["ip", "phone", "device"]),
  value: z.string(),
  reason: z.string().optional(),
  durationMinutes: z.number().optional(), // undefined = permanent
});

const UnbanSchema = z.object({
  banId: z.string(),
});

// GET: List all active bans
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const businessId = searchParams.get("businessId");

    if (!businessId) {
      return NextResponse.json({ error: "businessId required" }, { status: 400 });
    }

    const bans = await prisma.ban.findMany({
      where: { businessId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ bans });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST: Add ban
export async function POST(req: NextRequest) {
  try {
    const body = BanSchema.parse(await req.json());

    const expiresAt = body.durationMinutes
      ? new Date(Date.now() + body.durationMinutes * 60 * 1000)
      : null;

    const ban = await prisma.ban.upsert({
      where: {
        businessId_type_value: {
          businessId: body.businessId,
          type: body.type,
          value: body.value,
        },
      },
      update: {
        reason: body.reason,
        expiresAt,
      },
      create: {
        businessId: body.businessId,
        type: body.type,
        value: body.value,
        reason: body.reason,
        expiresAt,
      },
    });

    return NextResponse.json({ ok: true, ban }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

// DELETE: Remove ban
export async function DELETE(req: NextRequest) {
  try {
    const body = UnbanSchema.parse(await req.json());

    await prisma.ban.delete({
      where: { id: body.banId },
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

