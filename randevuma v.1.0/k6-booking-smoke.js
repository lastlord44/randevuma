import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 10, // 10 eşzamanlı kullanıcı (başlangıç)
  duration: '20s', // 20 saniye
  thresholds: {
    http_req_failed: ['rate<0.05'],     // < %5 hata (gevşetildi)
    http_req_duration: ['p(95)<3000'],  // 95p < 3000ms (gerçekçi)
  },
};

const BASE = 'https://randevuma.com';

export default function () {
  // 1) Slot sorgu (read)
  const r1 = http.get(`${BASE}/api/fast/next-slots?businessSlug=demo&serviceId=service-2`);
  check(r1, { 
    'slots 200': (res) => res.status === 200,
    'slots has data': (res) => JSON.parse(res.body).slots?.length > 0
  });

  // 2) Realistic booking (write) - Farklı telefon, farklı slot
  const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 gün sonra
  const randomHour = 10 + (__VU % 8); // 10:00-17:00 arası
  const randomMin = (__VU % 4) * 15; // 0, 15, 30, 45
  futureDate.setHours(randomHour, randomMin, 0, 0);
  
  // Her VU için benzersiz telefon (phone quota bypass için)
  const uniquePhone = `+9055512${String(__VU).padStart(5, '0')}`;
  
  const payload = JSON.stringify({
    businessSlug: 'demo',
    serviceId: 'service-2',
    staffId: 'staff-1',
    startAtISO: futureDate.toISOString(),
    customerName: `k6 User #${__VU}`,
    customerTel: uniquePhone
  });
  
  const r2 = http.post(`${BASE}/api/fast/book`, payload, { 
    headers: { 'Content-Type': 'application/json' }
  });
  
  check(r2, {
    'book 2xx/409': (res) => [200, 201, 409].includes(res.status),
  });

  sleep(1);
}

