import { getPrisma } from '../lib/prisma';
import * as bcrypt from 'bcryptjs';
import { slugify } from '../lib/slugify';

async function main() {
  console.log('🌱 Seeding database...');
  const prisma = await getPrisma();

  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@randevuma.com' },
    update: {},
    create: {
      email: 'admin@randevuma.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'admin',
    },
  });

  console.log('✅ Admin user created');

  const demoBusiness = await prisma.business.upsert({
    where: { slug: 'demo' },
    update: {},
    create: {
      name: 'Demo Kuaför',
      slug: 'demo',
      description: 'Demo işletme - test için',
      address: 'İstanbul, Türkiye',
      phone: '+90 555 123 4567',
      email: 'demo@randevuma.com',
      userId: admin.id,
    },
  });

  console.log('✅ Demo business created');

  for (let day = 1; day <= 5; day++) {
    await prisma.workingHours.upsert({
      where: {
        businessId_weekday: {
          businessId: demoBusiness.id,
          weekday: day,
        },
      },
      update: {},
      create: {
        businessId: demoBusiness.id,
        weekday: day,
        openMin: 540,
        closeMin: 1080,
        isActive: true,
      },
    });
  }

  console.log('✅ Working hours created');

  const services = await Promise.all([
    prisma.service.upsert({
      where: { id: 'service-1' },
      update: {},
      create: {
        id: 'service-1',
        name: 'Saç Kesimi',
        description: 'Erkek saç kesimi',
        durationMin: 30,
        price: 150,
        bufferBefore: 5,
        bufferAfter: 5,
        businessId: demoBusiness.id,
        active: true,
      },
    }),
    prisma.service.upsert({
      where: { id: 'service-2' },
      update: {},
      create: {
        id: 'service-2',
        name: 'Sakal Tıraşı',
        description: 'Profesyonel sakal tıraşı',
        durationMin: 20,
        price: 150,
        bufferBefore: 5,
        bufferAfter: 5,
        businessId: demoBusiness.id,
        active: true,
      },
    }),
    prisma.service.upsert({
      where: { id: 'service-3' },
      update: {},
      create: {
        id: 'service-3',
        name: 'Saç + Sakal',
        description: 'Saç kesimi ve sakal tıraşı',
        durationMin: 45,
        price: 200,
        bufferBefore: 5,
        bufferAfter: 10,
        businessId: demoBusiness.id,
        active: true,
      },
    }),
  ]);

  console.log('✅ Services created');

  const staff = await Promise.all([
    prisma.staff.upsert({
      where: { id: 'staff-1' },
      update: {},
      create: {
        id: 'staff-1',
        name: 'Ahmet Yılmaz',
        slug: 'ahmet',
        email: 'ahmet@demo.com',
        phone: '+90 555 111 2233',
        title: 'Berber',
        businessId: demoBusiness.id,
        active: true,
      },
    }),
    prisma.staff.upsert({
      where: { id: 'staff-2' },
      update: {},
      create: {
        id: 'staff-2',
        name: 'Mehmet Kaya',
        slug: 'mehmet',
        email: 'mehmet@demo.com',
        phone: '+90 555 444 5566',
        title: 'Kuaför',
        businessId: demoBusiness.id,
        active: true,
      },
    }),
  ]);

  console.log('✅ Staff created');

  // Staff skills ekle
  for (const s of services) {
    for (const st of staff) {
      await prisma.staffSkill.upsert({
        where: {
          staffId_serviceId: {
            staffId: st.id,
            serviceId: s.id,
          },
        },
        update: {},
        create: {
          staffId: st.id,
          serviceId: s.id,
        },
      });
    }
  }

  console.log('✅ Staff skills created');
  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    const prisma = await getPrisma();
    await prisma.$disconnect();
  });



