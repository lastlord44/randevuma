import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

// Force Node.js runtime (required for Prisma with Turso adapter)
export const runtime = 'nodejs';

// GET: List risk logs (last 24h by default)
export async function GET(req: NextRequest) {
  const prisma = await getPrisma();
  try {
    const { searchParams } = req.nextUrl;
    const businessId = searchParams.get("businessId");
    const hours = parseInt(searchParams.get("hours") || "24");

    if (!businessId) {
      return NextResponse.json({ error: "businessId required" }, { status: 400 });
    }

    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    const logs = await prisma.riskLog.findMany({
      where: {
        businessId,
        createdAt: { gte: since },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    // Group by type
    const grouped = logs.reduce((acc, log) => {
      const key = log.type;
      if (!acc[key]) acc[key] = [];
      acc[key].push(log);
      return acc;
    }, {} as Record<string, typeof logs>);

    // Top offenders
    const byPhone = logs
      .filter((l) => l.phone)
      .reduce((acc, log) => {
        acc[log.phone!] = (acc[log.phone!] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const byIP = logs
      .filter((l) => l.ip)
      .reduce((acc, log) => {
        acc[log.ip!] = (acc[log.ip!] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const topPhones = Object.entries(byPhone)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    const topIPs = Object.entries(byIP)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    return NextResponse.json({
      logs,
      grouped,
      stats: {
        total: logs.length,
        topPhones,
        topIPs,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

