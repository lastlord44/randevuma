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
    const d = await r.json();
    if (r.ok && d?.ok) setSlotTR(d.slotTR);
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
      const data = await r.json();

      if (r.ok) {
        alert('Randevu alindi');
        await loadNext(); // sonraki uygun slotu guncelle
      } else {
        alert(`Hata: ${data?.error ?? r.status}`);
        if (r.status === 409) await loadNext(); // slot doluysa siradaki slota gec
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
        <div>Sonraki uygun saat (TR): <b>{slotTR ? new Date(slotTR).toLocaleString() : '—'}</b></div>
        <input className="w-full rounded border p-2" placeholder="Ad Soyad" value={name} onChange={e=>setName(e.target.value)} />
        <input className="w-full rounded border p-2" placeholder="E-posta (ops.)" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="w-full rounded border p-2" placeholder="Telefon (ops.)" value={phone} onChange={e=>setPhone(e.target.value)} />
        <textarea className="w-full rounded border p-2" placeholder="Not (ops.)" value={note} onChange={e=>setNote(e.target.value)} rows={2} />
        <button 
          onClick={bookNow} 
          disabled={loading || !slotTR}
          className="w-full rounded bg-black px-4 py-2 text-white hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Isleniyor...' : 'Randevu Al'}
        </button>
      </div>
      {result && <div className="text-sm text-gray-600">Sonuc: {JSON.stringify(result)}</div>}
    </main>
  );
}
