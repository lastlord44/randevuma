import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    // İşletmeyi getir
    const business = await prisma.business.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        description: true,
        phone: true,
        address: true,
      },
    });

    if (!business) {
      return NextResponse.json(
        { error: 'İşletme bulunamadı' },
        { status: 404 }
      );
    }

    // İşletmeye ait hizmetleri getir
    const services = await prisma.service.findMany({
      where: {
        businessId: business.id,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        duration: true,
        price: true,
      },
      orderBy: {
        price: 'asc',
      },
    });

    // İşletmeye ait personeli getir
    const staff = await prisma.staff.findMany({
      where: {
        businessId: business.id,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        title: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return new NextResponse(JSON.stringify({
      business,
      services,
      staff,
    }), {
      headers: {
        "content-type": "application/json",
        "cache-control": "no-store, no-cache, must-revalidate, max-age=0",
      },
    });
  } catch (error) {
    console.error('Business API Error:', error);
    return NextResponse.json(
      { error: 'Bir hata oluştu' },
      { status: 500 }
    );
  }
}
