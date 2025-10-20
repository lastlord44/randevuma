'use client';
import { useState } from 'react';

export default function RandevuPage() {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [when, setWhen] = useState('');

  async function bookAppointment() {
    if (!name) {
      alert('Lutfen ad soyad girin');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/bot/book', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name,
          startsAtTR: when || undefined,
        }),
      });

      // JSON parse hatasina dusmemek icin korumali
      let data: any = null;
      try { data = await res.json(); } catch { /* ignore */ }

      if (res.ok) {
        alert('Randevu alindi');
        setWhen('');
      } else {
        const msg = (data && (data.message || data.error)) ?? `HTTP ${res.status}`;
        alert(`Hata: ${msg}`);
      }
    } catch (e: any) {
      alert(`Hata: ${String(e?.message || e)}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Randevu Al</h1>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Ad Soyad</label>
          <input
            className="w-full rounded border p-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ad Soyad"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Tarih/Saat</label>
          <input
            className="w-full rounded border p-2"
            type="datetime-local"
            value={when}
            onChange={(e) => setWhen(e.target.value)}
          />
        </div>

        <button
          onClick={bookAppointment}
          disabled={loading || !name}
          className="w-full rounded bg-black px-4 py-2 text-white hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Calisiyor...' : 'Randevu Al'}
        </button>
      </div>
    </main>
  );
}
