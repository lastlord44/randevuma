'use client';
import { useEffect, useState } from 'react';

type Booking = { id: string; name: string; startsAt: string; createdAt?: string };

export default function Admin() {
  const [health, setHealth] = useState<any>(null);
  const [status, setStatus] = useState<any>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('Walk-in Müşteri');
  const [when, setWhen] = useState('');

  async function loadAll() {
    const [h, s, b] = await Promise.all([
      fetch('/api/health').then(r => r.json()).catch(() => null),
      fetch('/api/bot/status', { cache: 'no-store' }).then(r => r.json()).catch(() => null),
      fetch('/api/business/demo', { cache: 'no-store' }).then(r => r.json()).catch(() => [])
    ]);
    setHealth(h);
    setStatus(s);
    setBookings(Array.isArray(b) ? b : (b?.items ?? []));
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function manualBook() {
    setLoading(true);
    try {
      const res = await fetch('/api/bot/auto-book', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name,
          startsAt: when || undefined
        })
      });
      const data = await res.json();
      await loadAll();
      alert(res.ok ? '✅ Randevu alındı' : `❌ Hata: ${data?.error || res.status}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-4xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Randevuma — Admin Panel</h1>
      
      {/* Özet kartları */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border p-4">
          <div className="text-sm text-gray-500">Sistem</div>
          <div className="text-lg font-medium">
            {health?.ok ? '✅ Sağlıklı' : '⚠️ Kontrol et'}
          </div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-gray-500">Bot</div>
          <div className="text-sm">
            {status?.ok ? (
              <>
                <div>Env: <b>{status.env}</b></div>
                <div>Son Kayıt: <b>{status.lastBooking?.startsAtTR ?? '—'}</b></div>
                <div>Sonuç: <b>{status.lastResult ?? '—'}</b></div>
                <div>Cron: <b>{status.cron ?? '—'}</b></div>
              </>
            ) : '—'}
          </div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-gray-500">Toplam Son 20</div>
          <div className="text-lg font-medium">{bookings?.length ?? 0}</div>
        </div>
      </div>

      {/* Manuel randevu */}
      <section className="rounded-lg border p-4 space-y-3">
        <h2 className="text-lg font-semibold">Hızlı Randevu (Tek Tık)</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            className="rounded border p-2"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Müşteri Adı"
          />
          <input
            className="rounded border p-2"
            type="datetime-local"
            value={when}
            onChange={e => setWhen(e.target.value)}
          />
          <button
            onClick={manualBook}
            disabled={loading}
            className="rounded bg-black px-4 py-2 text-white hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Çalışıyor…' : 'Randevu Oluştur'}
          </button>
        </div>
        <p className="text-xs text-gray-500">
          Tarih boşsa bot otomatik yarın 10:00 (TR) slotu dener.
        </p>
      </section>

      {/* Liste */}
      <section className="rounded-lg border p-4">
        <h2 className="text-lg font-semibold mb-3">Son Randevular</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-3">Ad</th>
                <th className="py-2 pr-3">Başlangıç</th>
                <th className="py-2 pr-3">Oluşturma</th>
                <th className="py-2">ID</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b.id} className="border-b">
                  <td className="py-2 pr-3">{b.name}</td>
                  <td className="py-2 pr-3">
                    {new Date(b.startsAt).toLocaleString()}
                  </td>
                  <td className="py-2 pr-3">
                    {b.createdAt ? new Date(b.createdAt).toLocaleString() : '—'}
                  </td>
                  <td className="py-2">{b.id.slice(0, 8)}…</td>
                </tr>
              ))}
              {bookings.length === 0 && (
                <tr>
                  <td className="py-4 text-gray-500" colSpan={4}>
                    Kayıt yok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}