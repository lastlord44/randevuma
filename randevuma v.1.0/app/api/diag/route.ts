import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';

// Force Node.js runtime (required for Prisma with Turso adapter)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const prisma = await getPrisma();
    const diagnostics: any = {
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV || 'local',
        commit: process.env.VERCEL_GIT_COMMIT_SHA?.substring(0, 7) || 'unknown',
        siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'not set',
      },
      database: {
        status: 'unknown',
        businessCount: 0,
        staffCount: 0,
        appointmentCount: 0,
      },
    };

    // Database diagnostics
    try {
      const [businesses, staff, appointments] = await Promise.all([
        prisma.business.count(),
        prisma.staff.count(),
        prisma.appointment.count(),
      ]);

      diagnostics.database = {
        status: 'connected',
        businessCount: businesses,
        staffCount: staff,
        appointmentCount: appointments,
      };
    } catch (error: any) {
      diagnostics.database = {
        status: 'error',
        error: error.message,
      };
    }

    return NextResponse.json(diagnostics, {
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store, must-revalidate',
        },
      }
    );
  }
}

