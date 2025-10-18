'use client';
import { useEffect, useState } from 'react';

export default function RandevuPage() {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [when, setWhen] = useState('');

  async function bookAppointment() {
    setLoading(true);
    try {
      const res = await fetch('/api/bot/book', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ 
          name, 
          startsAtTR: when || undefined 
        })
      });
      const data = await res.json();
      alert(res.ok ? 'âœ… Randevu alÄ±ndÄ±' : âŒ Hata: );
    } finally { setLoading(false); }
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
            onChange={e=>setName(e.target.value)} 
            placeholder="AdÄ±nÄ±zÄ± girin" 
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Tarih/Saat</label>
          <input 
            className="w-full rounded border p-2" 
            type="datetime-local" 
            value={when} 
            onChange={e=>setWhen(e.target.value)} 
          />
        </div>
        
        <button 
          onClick={bookAppointment} 
          disabled={loading || !name}
          className="w-full rounded bg-black px-4 py-2 text-white hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Ã‡alÄ±ÅŸÄ±yorâ€¦' : 'Randevu Al'}
        </button>
      </div>
    </main>
  );
}
