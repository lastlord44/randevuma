'use client';
import { useEffect, useState } from 'react';

type Booking = { id: string; name: string; startsAt: string; createdAt?: string };

export default function Admin() {
  const [health, setHealth] = useState<any>(null);
  const [status, setStatus] = useState<any>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('Walk-in MÃ¼ÅŸteri');
  const [when, setWhen] = useState('');

  async function loadAll() {
    const [h, s, b] = await Promise.all([
      fetch('/api/health').then(r=>r.json()).catch(()=>null),
      fetch('/api/bot/status', { cache:'no-store' }).then(r=>r.json()).catch(()=>null),
      fetch('/api/business/demo', { cache:'no-store' }).then(r=>r.json()).catch(()=>[])
    ]);
    setHealth(h); setStatus(s); setBookings(Array.isArray(b)? b : (b?.items ?? []));
  }

  useEffect(()=>{ loadAll(); },[]);

  async function manualBook() {
    setLoading(true);
    try {
      const res = await fetch('/api/bot/auto-book', {
        method:'POST',
        headers:{ 'content-type':'application/json' },
        body: JSON.stringify({ name, startsAt: when || undefined })
      });
      const data = await res.json();
      await loadAll();
      alert(res.ok ? 'âœ… Randevu alÄ±ndÄ±' : âŒ Hata: );
    } finally { setLoading(false); }
  }

  return (
    <main className="mx-auto max-w-4xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Randevuma â€” Admin Panel</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border p-4">
          <div className="text-sm text-gray-500">Sistem</div>
          <div className="text-lg font-medium">{health?.ok ? 'âœ… SaÄŸlÄ±klÄ±' : 'âš ï¸ Kontrol et'}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-gray-500">Bot</div>
          <div className="text-sm">
            {status?.ok ? (
              <>
                <div>Env: <b>{status.env}</b></div>
                <div>Son KayÄ±t: <b>{status.lastBooking?.startsAtTR ?? 'â€”'}</b></div>
                <div>SonuÃ§: <b>{status.lastResult ?? 'â€”'}</b></div>
                <div>Cron: <b>{status.cron ?? 'â€”'}</b></div>
              </>
            ) : 'â€”'}
          </div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-gray-500">Toplam Son 20</div>
          <div className="text-lg font-medium">{bookings?.length ?? 0}</div>
        </div>
      </div>

      <section className="rounded-lg border p-4 space-y-3">
        <h2 className="text-lg font-semibold">HÄ±zlÄ± Randevu (Tek TÄ±k)</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input className="rounded border p-2" value={name} onChange={e=>setName(e.target.value)} placeholder="MÃ¼ÅŸteri AdÄ±" />
          <input className="rounded border p-2" type="datetime-local" value={when} onChange={e=>setWhen(e.target.value)} />
          <button onClick={manualBook} disabled={loading}
            className="rounded bg-black px-4 py-2 text-white hover:opacity-90 disabled:opacity-50">
            {loading ? 'Ã‡alÄ±ÅŸÄ±yorâ€¦' : 'Randevu OluÅŸtur'}
          </button>
        </div>
        <p className="text-xs text-gray-500">Tarih boÅŸsa bot otomatik yarÄ±n 10:00 (TR) slotu dener.</p>
      </section>

      <section className="rounded-lg border p-4">
        <h2 className="text-lg font-semibold mb-3">Son Randevular</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-3">Ad</th>
                <th className="py-2 pr-3">BaÅŸlangÄ±Ã§</th>
                <th className="py-2 pr-3">OluÅŸturma</th>
                <th className="py-2">ID</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(b=>(
                <tr key={b.id} className="border-b">
                  <td className="py-2 pr-3">{b.name}</td>
                  <td className="py-2 pr-3">{new Date(b.startsAt).toLocaleString()}</td>
                  <td className="py-2 pr-3">{b.createdAt ? new Date(b.createdAt).toLocaleString() : 'â€”'}</td>
                  <td className="py-2">{b.id.slice(0,8)}â€¦</td>
                </tr>
              ))}
              {bookings.length===0 && (
                <tr><td className="py-4 text-gray-500" colSpan={4}>KayÄ±t yok.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
