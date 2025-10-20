import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Demo kullanıcı oluştur
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@randevuma.com' },
    update: {},
    create: {
      email: 'demo@randevuma.com',
      name: 'Demo İşletme',
      password: hashedPassword,
      role: 'user',
    },
  });

  console.log('✅ Demo user created:', demoUser.email);

  // Demo işletme oluştur
  const demoBusiness = await prisma.business.upsert({
    where: { slug: 'demo' },
    update: {},
    create: {
      name: 'Demo Berber Salonu',
      slug: 'demo',
      description: 'Profesyonel berber hizmetleri sunan modern salon',
      address: 'Örnek Mahallesi, Demo Sokak No:1',
      phone: '+90 555 123 4567',
      email: 'info@demo-berber.com',
      userId: demoUser.id,
    },
  });

  console.log('✅ Demo business created:', demoBusiness.name);

  // Hizmetler oluştur
  const services = await Promise.all([
    prisma.service.upsert({
      where: { id: 'service-1' },
      update: {},
      create: {
        id: 'service-1',
        name: 'Saç Kesimi',
        description: 'Klasik erkek saç kesimi',
        duration: 30,
        price: 150,
        businessId: demoBusiness.id,
      },
    }),
    prisma.service.upsert({
      where: { id: 'service-2' },
      update: {},
      create: {
        id: 'service-2',
        name: 'Sakal Tıraşı',
        description: 'Profesyonel sakal tıraşı ve şekillendirme',
        duration: 20,
        price: 100,
        businessId: demoBusiness.id,
      },
    }),
    prisma.service.upsert({
      where: { id: 'service-3' },
      update: {},
      create: {
        id: 'service-3',
        name: 'Saç + Sakal Paket',
        description: 'Saç kesimi ve sakal tıraşı paket',
        duration: 45,
        price: 200,
        businessId: demoBusiness.id,
      },
    }),
  ]);

  console.log('✅ Services created:', services.length);

  // Personel oluştur
  const staff = await Promise.all([
    prisma.staff.upsert({
      where: { id: 'staff-1' },
      update: {},
      create: {
        id: 'staff-1',
        name: 'Ahmet Yılmaz',
        email: 'ahmet@demo-berber.com',
        phone: '+90 555 111 2233',
        title: 'Kalfa Berber',
        businessId: demoBusiness.id,
      },
    }),
    prisma.staff.upsert({
      where: { id: 'staff-2' },
      update: {},
      create: {
        id: 'staff-2',
        name: 'Mehmet Demir',
        email: 'mehmet@demo-berber.com',
        phone: '+90 555 444 5566',
        title: 'Usta Berber',
        businessId: demoBusiness.id,
      },
    }),
  ]);

  console.log('✅ Staff created:', staff.length);

  // Çalışma saatleri oluştur (Hafta içi 09:00-18:00, Cumartesi 09:00-14:00)
  const workingHours = [];
  
  // Her personel için çalışma saatleri
  for (const staffMember of staff) {
    // Pazartesi - Cuma (0-4)
    for (let day = 1; day <= 5; day++) {
      workingHours.push(
        prisma.workingHours.upsert({
          where: { id: `wh-${staffMember.id}-${day}` },
          update: {},
          create: {
            id: `wh-${staffMember.id}-${day}`,
            dayOfWeek: day,
            startTime: '09:00',
            endTime: '18:00',
            businessId: demoBusiness.id,
            staffId: staffMember.id,
          },
        })
      );
    }
    
    // Cumartesi (6)
    workingHours.push(
      prisma.workingHours.upsert({
        where: { id: `wh-${staffMember.id}-6` },
        update: {},
        create: {
          id: `wh-${staffMember.id}-6`,
          dayOfWeek: 6,
          startTime: '09:00',
          endTime: '14:00',
          businessId: demoBusiness.id,
          staffId: staffMember.id,
        },
      })
    );
  }

  await Promise.all(workingHours);
  console.log('✅ Working hours created');

  // Demo randevu oluştur
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  const demoAppointment = await prisma.appointment.upsert({
    where: { id: 'appointment-1' },
    update: {},
    create: {
      id: 'appointment-1',
      customerName: 'Ali Veli',
      customerPhone: '+90 555 999 8877',
      customerEmail: 'ali.veli@example.com',
      date: tomorrow,
      status: 'confirmed',
      notes: 'İlk müşteri',
      businessId: demoBusiness.id,
      serviceId: services[0].id, // Saç Kesimi
      staffId: staff[0].id, // Ahmet Yılmaz
    },
  });

  console.log('✅ Demo appointment created:', demoAppointment.customerName);

  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });