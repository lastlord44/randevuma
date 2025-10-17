import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Demo verileri
    const demoData = {
      business: {
        id: 'demo-business',
        name: 'Demo İşletme',
        description: 'Bu bir demo işletmedir',
        phone: '+90 555 123 45 67',
        address: 'Demo Adres, İstanbul',
      },
      services: [
        {
          id: 'demo-service-1',
          name: 'Saç Kesimi',
          description: 'Profesyonel saç kesimi hizmeti',
          duration: 30,
          price: 50,
        },
        {
          id: 'demo-service-2',
          name: 'Saç Boyama',
          description: 'Kaliteli saç boyama hizmeti',
          duration: 60,
          price: 120,
        },
        {
          id: 'demo-service-3',
          name: 'Saç Bakımı',
          description: 'Saç bakım ve nemlendirme',
          duration: 45,
          price: 80,
        },
      ],
      staff: [
        {
          id: 'demo-staff-1',
          name: 'Ayşe Yılmaz',
          title: 'Kuaför',
          services: ['demo-service-1', 'demo-service-2'],
        },
        {
          id: 'demo-staff-2',
          name: 'Fatma Demir',
          title: 'Saç Stilisti',
          services: ['demo-service-1', 'demo-service-3'],
        },
      ],
      appointments: [],
    };

    return NextResponse.json(demoData, { status: 200 });
  } catch (error) {
    console.error('Error fetching demo data:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
