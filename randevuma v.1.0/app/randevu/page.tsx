'use client';
import { useEffect, useState } from 'react';

export default function RandevuBot() {
  const [slot, setSlot] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    loadNextSlot();
  }, []);

  async function loadNextSlot() {
    try {
      const res = await fetch('/api/bot/next-slot', { cache: 'no-store' });
      const data = await res.json();
      if (data.ok) {
        setSlot(data);
      }
    } catch (e) {
      console.error('Slot yüklenemedi:', e);
    }
  }

  async function bookSlot() {
    if (!slot || !name.trim()) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/bot/book', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          note: note.trim() || undefined,
          startsAtTR: slot.slotTR
        })
      });
      
      const data = await res.json();
      if (res.ok) {
        alert('Randevu alindi! ID: ' + data.booking.id);
        setName(''); setEmail(''); setPhone(''); setNote('');
        loadNextSlot();
      } else {
        alert('Hata: ' + (data.error || 'Bilinmeyen hata'));
      }
    } catch (e) {
      alert('Baglanti hatasi');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Randevu Botu</h1>
      <p className="text-gray-600">
        Hızlı randevu almak için aşağıdaki formu doldurun.
      </p>

      {slot && (
        <div className="rounded-lg border p-4 bg-green-50">
          <h2 className="font-semibold text-green-800">Uygun Slot Bulundu</h2>
          <p className="text-green-700">
            {new Date(slot.slotTR).toLocaleString('tr-TR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); bookSlot(); }} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border p-2"
            placeholder="Adınız ve soyadınız"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">E-posta</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border p-2"
            placeholder="ornek@email.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Telefon</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-md border p-2"
            placeholder="0555 123 45 67"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Not</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full rounded-md border p-2"
            placeholder="Özel istekleriniz..."
            rows={3}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !slot}
          className="w-full rounded-lg bg-black px-4 py-2 text-white hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Isleniyor...' : 'Randevu Al'}
        </button>
      </form>

      <div className="text-center">
        <button
          onClick={loadNextSlot}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Farkli slot ara
        </button>
      </div>
    </main>
  );
}