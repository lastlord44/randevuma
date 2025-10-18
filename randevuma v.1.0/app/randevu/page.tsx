'use client';
import { useEffect, useState } from 'react';

export default function RandevuBot() {
  const [slotTR, setSlotTR] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [name, setName] = useState('Müşteri');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');

  async function loadNext() {
    setResult(null);
    const r = await fetch('/api/bot/next-slot', { cache: 'no-store' });
    const d = await r.json();
    if (r.ok && d?.ok) setSlotTR(d.slotTR); else setSlotTR('');
  }
  useEffect(() => { loadNext(); }, []);

  async function bookNow() {
    if (!slotTR) { alert('Uygun saat yok'); return; }
    setLoading(true); setResult(null);
    try {
      const r = await fetch('/api/bot/book', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name, email, phone, note, startsAtTR: slotTR })
      });
      const d = await r.json();
      setResult({ status: r.status, data: d });
      if (r.ok) { alert('✅ Randevu alındı'); await loadNext(); }
      else if (r.status === 409) { alert('❌ Slot dolu'); await loadNext(); }
    } finally { setLoading(false); }
  }

  return (
    <main className="mx-auto max-w-xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Hızlı Randevu (Web)</h1>
      <div className="rounded-lg border p-4 space-y-3">
        <div className="text-sm text-gray-500">Sonraki uygun saat (TR):</div>
        <div className="text-lg font-medium">
          {slotTR ? new Date(slotTR).toLocaleString() : '—'}
        </div>

        <div className="grid gap-3">
          <input className="rounded border p-2" placeholder="Ad Soyad" value={name} onChange={e=>setName(e.target.value)} />
          <input className="rounded border p-2" placeholder="E-posta (ops.)" value={email} onChange={e=>setEmail(e.target.value)} />
          <input className="rounded border p-2" placeholder="Telefon (ops.)" value={phone} onChange={e=>setPhone(e.target.value)} />
          <textarea className="rounded border p-2" placeholder="Not (ops.)" value={note} onChange={e=>setNote(e.target.value)} />
        </div>

        <div className="flex gap-3">
          <button onClick={bookNow} disabled={loading || !slotTR}
            className="rounded bg-black px-4 py-2 text-white hover:opacity-90 disabled:opacity-50">
            {loading ? 'Alınıyor…' : 'Hemen Al'}
          </button>
          <button onClick={loadNext} className="rounded border px-4 py-2 hover:bg-gray-50">Yenile</button>
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
