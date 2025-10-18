import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const appointmentSchema = z.object({
  businessId: z.string(),
  serviceId: z.string(),
  staffId: z.string(),
  customerName: z.string().min(2, 'Ad Soyad en az 2 karakter olmalıdır'),
  customerPhone: z.string().min(10, 'Geçerli bir telefon numarası giriniz'),
  customerEmail: z.string().email('Geçerli bir e-posta adresi giriniz').optional().or(z.literal('')),
  date: z.string().or(z.date()),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validatedData = appointmentSchema.parse(body);

    // Convert businessId (slug) to actual business ID
    const business = await prisma.business.findUnique({
      where: { slug: validatedData.businessId },
      select: { id: true },
    });

    if (!business) {
      return NextResponse.json(
        { error: 'İşletme bulunamadı' },
        { status: 404 }
      );
    }

    // Validate service exists and belongs to business
    const service = await prisma.service.findFirst({
      where: {
        id: validatedData.serviceId,
        businessId: business.id,
      },
    });

    if (!service) {
      return NextResponse.json(
        { error: 'Hizmet bulunamadı' },
        { status: 404 }
      );
    }

    // Validate staff exists and belongs to business
    const staff = await prisma.staff.findFirst({
      where: {
        id: validatedData.staffId,
        businessId: business.id,
      },
    });

    if (!staff) {
      return NextResponse.json(
        { error: 'Personel bulunamadı' },
        { status: 404 }
      );
    }

    // Parse appointment date
    const appointmentDate = new Date(validatedData.date);
    
    // Validate appointment is in the future
    if (appointmentDate < new Date()) {
      return NextResponse.json(
        { error: 'Randevu tarihi geçmişte olamaz' },
        { status: 400 }
      );
    }

    // Calculate end time based on service duration
    const endTime = new Date(appointmentDate);
    endTime.setMinutes(endTime.getMinutes() + service.duration);

    // Check for time conflicts
    const conflictingAppointments = await prisma.appointment.findMany({
      where: {
        staffId: validatedData.staffId,
        date: {
          gte: appointmentDate,
          lt: endTime,
        },
        status: {
          not: 'cancelled',
        },
      },
    });

    if (conflictingAppointments.length > 0) {
      return NextResponse.json(
        { error: 'Seçilen saat için başka bir randevu mevcut' },
        { status: 409 }
      );
    }

    // Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        customerName: validatedData.customerName,
        customerPhone: validatedData.customerPhone,
        customerEmail: validatedData.customerEmail || undefined,
        date: appointmentDate,
        status: 'pending',
        businessId: business.id,
        serviceId: validatedData.serviceId,
        staffId: validatedData.staffId,
      },
      include: {
        service: {
          select: {
            name: true,
            duration: true,
            price: true,
          },
        },
        staff: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      appointment: {
        id: appointment.id,
        customerName: appointment.customerName,
        date: appointment.date,
        service: appointment.service.name,
        staff: appointment.staff.name,
        duration: appointment.service.duration,
        price: appointment.service.price,
      },
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Geçersiz veri', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Appointment API Error:', error);
    return NextResponse.json(
      { error: 'Randevu oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
}