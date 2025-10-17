'use client';

import { useEffect, useState } from 'react';

type DemoItem = { id: string; title: string; time?: string };

export default function DemoBookingPage() {
  const [items, setItems] = useState<DemoItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch('/api/business/demo', { cache: 'no-store' });
        if (!res.ok) throw new Error('API error');
        const data = await res.json();
        setItems(Array.isArray(data) ? data : data?.items ?? []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  return (
    <main className='mx-auto max-w-3xl p-6 space-y-6'>
      <h1 className='text-2xl font-semibold'>Demo Randevu</h1>
      <p className='text-gray-600'>Aşağıdaki demo verileri API'dan gelmektedir.</p>
      {loading ? (
        <p>Yükleniyor…</p>
      ) : items.length === 0 ? (
        <p className='text-gray-500'>Kayıt bulunamadı.</p>
      ) : (
        <ul className='space-y-3'>
          {items.map((x) => (
            <li key={x.id} className='rounded-lg border p-4'>
              <div className='font-medium'>{x.title}</div>
              {x.time && <div className='text-sm text-gray-500'>{x.time}</div>}
            </li>
          ))}
        </ul>
      )}
      <section className='space-y-3'>
        <h2 className='text-lg font-semibold'>Randevu Talep Et (Mock)</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            alert('Mock: Burada POST /api/business/demo (create) çağrısı yapılacak.');
          }}
          className='space-y-3'
        >
          <input type='text' name='name' placeholder='Ad Soyad' className='w-full rounded-md border p-2' required />
          <input type='datetime-local' name='when' className='w-full rounded-md border p-2' required />
          <button className='rounded-lg bg-black px-4 py-2 text-white hover:opacity-90'>Gönder</button>
        </form>
      </section>
    </main>
  );
}
