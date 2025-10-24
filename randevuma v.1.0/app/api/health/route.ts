import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Force Node.js runtime (required for Prisma with Turso adapter)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();
  
  try {
    // Basic health checks
    const checks = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown',
      database: 'unknown',
      prismaVersion: '6.17.1',
      responseTime: 0,
    };

    // Test database connection
    try {
      await prisma.$queryRaw`SELECT 1`;
      checks.database = 'connected';
    } catch (error) {
      checks.database = 'disconnected';
      checks.status = 'degraded';
    }

    checks.responseTime = Date.now() - startTime;

    return NextResponse.json(checks, {
      status: checks.status === 'healthy' ? 200 : 503,
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString(),
        responseTime: Date.now() - startTime,
      },
      {
        status: 503,
        headers: {
          'Cache-Control': 'no-store, must-revalidate',
        },
      }
    );
  }
}

