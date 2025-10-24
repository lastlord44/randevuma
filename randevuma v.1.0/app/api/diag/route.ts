import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';

// Force Node.js runtime (required for Prisma with Turso adapter)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // DEBUG: Check ENV before getPrisma
    const rawDbUrl = process.env.DATABASE_URL || '';
    const rawTursoUrl = process.env.TURSO_DATABASE_URL || '';
    const rawToken = process.env.TURSO_AUTH_TOKEN || '';
    
    let urlHost = 'EMPTY';
    let urlProtocol = 'EMPTY';
    try {
      const testUrl = (rawTursoUrl || rawDbUrl).trim().replace(/[\r\n"']/g, '');
      if (testUrl) {
        const parsed = new URL(testUrl);
        urlHost = parsed.host;
        urlProtocol = parsed.protocol;
      }
    } catch (e: any) {
      urlHost = `PARSE_ERROR: ${e.message}`;
    }
    
    const prisma = await getPrisma();
    const diagnostics: any = {
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV || 'local',
        commit: process.env.VERCEL_GIT_COMMIT_SHA?.substring(0, 7) || 'unknown',
        isTurso: !!process.env.TURSO_DATABASE_URL,
        hasAuthToken: !!process.env.TURSO_AUTH_TOKEN,
        siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'not set',
        // DEBUG: Show first 30 chars of env values
        dbUrlPreview: (process.env.DATABASE_URL || '').substring(0, 30) || 'EMPTY',
        tursoUrlPreview: (process.env.TURSO_DATABASE_URL || '').substring(0, 30) || 'EMPTY',
        tursoTokenPreview: (process.env.TURSO_AUTH_TOKEN || '').substring(0, 20) || 'EMPTY',
        // DEBUG: Parsed URL info
        urlHost,
        urlProtocol,
        rawDbUrlLen: rawDbUrl.length,
        rawTursoUrlLen: rawTursoUrl.length,
        tokenLen: rawToken.length,
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

