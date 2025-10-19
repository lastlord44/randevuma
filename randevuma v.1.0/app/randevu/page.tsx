'use client';

import { useEffect, useState } from 'react';

export default function Randevu() {
  const [slotTR, setSlotTR] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('Musteri');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [result, setResult] = useState<any>(null);

  async function loadNext() {
    setResult(null);
    const r = await fetch('/api/bot/next-slot', { cache: 'no-store' });
    const d = await r.json().catch(() => null);
    if (r.ok && d?.slotTR) setSlotTR(d.slotTR);
    else setSlotTR('');
  }

  useEffect(() => { loadNext(); }, []);

  async function bookNow() {
    if (!slotTR) { alert('Uygun saat bulunamadi'); return; }
    setLoading(true);
    setResult(null);
    try {
      const r = await fetch('/api/bot/book', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name, email, phone, note, startsAtTR: slotTR }),
      });
      const data = await r.json().catch(() => null);

      if (r.ok) {
        alert('Randevu alindi');
        await loadNext();
      } else {
        alert(`Hata: ${data?.message ?? r.status}`);
        if (r.status === 409) await loadNext();
      }

      setResult({ status: r.status, data });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Hizli Randevu</h1>

      <div className="rounded border p-4 space-y-3">
        <div>
          Sonraki uygun saat (TR):{' '}
          <b>{slotTR ? new Date(slotTR).toLocaleString() : '—'}</b>
        </div>

        <input
          className="w-full rounded border p-2"
          placeholder="Ad Soyad"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="w-full rounded border p-2"
          placeholder="E-posta (ops.)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full rounded border p-2"
          placeholder="Telefon (ops.)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <textarea
          className="w-full rounded border p-2"
          placeholder="Not (ops.)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        <div className="flex gap-3">
          <button
            onClick={bookNow}
            disabled={loading || !slotTR}
            className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
          >
            {loading ? 'Aliniyor...' : 'Hemen Al'}
          </button>
          <button onClick={loadNext} className="rounded border px-4 py-2">
            Yenile
          </button>
        </div>

        {result && (
          <pre className="bg-gray-50 rounded p-3 text-xs whitespace-pre-wrap">
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </div>
    </main>
  );
}