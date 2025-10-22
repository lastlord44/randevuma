"use client";
import { useEffect, useState, useCallback } from "react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { HydrationSanitizer } from "./sanitizer";

type Service = { id: string; name: string; durationMin: number; bufferBefore: number; bufferAfter: number };
type Staff = { id: string; name: string };

export default function FastClient({ businessSlug, services, staff }:{
  businessSlug: string; services: Service[]; staff: Staff[];
}) {
  const [serviceId, setServiceId] = useState<string>(services[0]?.id ?? "");
  const [staffId, setStaffId] = useState<string>("auto");
  const [dateStr, setDateStr] = useState<string>(new Date().toISOString().slice(0,10));
  const [slots, setSlots] = useState<{startISO:string; staffId:string; label:string}[]>([]);
  const [modal, setModal] = useState(false);
  const [pending, setPending] = useState<{startISO:string; staffId:string}|null>(null);
  const [name, setName] = useState(""); 
  const [tel, setTel] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    if (!serviceId) return;
    const qs = new URLSearchParams({ businessSlug, serviceId, date: dateStr });
    if (staffId !== "auto") qs.append("staffId", staffId);
    try {
      const res = await fetch(`/api/fast/next-slots?${qs.toString()}`, { cache: "no-store" });
      const j = await res.json();
      console.log("Slots loaded:", j);
      setSlots(j.slots || []);
    } catch (e) {
      console.error("Load error:", e);
      setSlots([]);
    }
  }, [businessSlug, serviceId, staffId, dateStr]);

  useEffect(() => { load(); }, [load]);

  async function onBook(e: React.FormEvent) {
    e.preventDefault();
    if (!pending || !serviceId || !name.trim() || !tel.trim()) {
      alert("Lütfen tüm alanları doldurun");
      return;
    }
    setSubmitting(true);
    try {
      const cleanTel = tel.replace(/\D/g, '');
      const res = await fetch("/api/fast/book", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessSlug, serviceId,
          staffId: pending.staffId, startAtISO: pending.startISO,
          customerName: name.trim(), customerTel: cleanTel,
        })
      });
      const j = await res.json();
      console.log("Book result:", j);
      if (j.ok) { 
        alert("Randevunuz alındı ✅"); 
        setModal(false); 
        setName(""); 
        setTel(""); 
        load(); 
      } else { 
        alert("Üzgünüz: " + (j.error || "Hata")); 
      }
    } catch (e: any) {
      alert("Bağlantı hatası: " + e.message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleTelChange(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    setTel(digits);
  }

  return (
    <>
      <HydrationSanitizer />
      <div className="max-w-4xl mx-auto p-4 space-y-4">
        <h1 className="text-xl font-semibold">Hızlı Randevu</h1>

      <div className="flex gap-2 flex-wrap">
        <select value={serviceId} onChange={(e)=>setServiceId(e.target.value)} className="border rounded px-2 h-9">
          {services.map(s => <option key={s.id} value={s.id}>{s.name} • {s.durationMin} dk</option>)}
        </select>
        <select value={staffId} onChange={(e)=>setStaffId(e.target.value)} className="border rounded px-2 h-9">
          <option value="auto">Otomatik</option>
          {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <input type="date" value={dateStr} onChange={(e)=>setDateStr(e.target.value)} className="border rounded px-2 h-9"/>
      </div>

      <div className="grid sm:grid-cols-3 gap-2">
        {slots.length === 0 && <div className="text-sm text-gray-500">Uygun hızlı slot yok.</div>}
        {slots.map(s => (
          <button key={s.startISO+s.staffId} className="rounded border px-4 py-3 text-left hover:shadow-sm"
            onClick={()=>{ setPending(s); setModal(true); }}>
            <div className="text-lg font-semibold">{s.label}</div>
          </button>
        ))}
      </div>

      {modal && pending && (
        <form onSubmit={onBook} className="border rounded p-3 space-y-2 max-w-md">
          <div className="text-sm text-gray-600">
            {format(new Date(pending.startISO), "d MMM EEE HH:mm", { locale: tr })}
          </div>
          <input className="border rounded px-2 h-9 w-full" placeholder="Adınız (en az 2 harf)" value={name} onChange={e=>setName(e.target.value)} required minLength={2} disabled={submitting}/>
          <input className="border rounded px-2 h-9 w-full" placeholder="5xx xxx xx xx (10-11 rakam)" value={tel} onChange={e=>handleTelChange(e.target.value)} required minLength={10} maxLength={11} inputMode="numeric" pattern="[0-9]{10,11}" disabled={submitting}/>
          <div className="flex gap-2">
            <button type="submit" className="rounded bg-black text-white px-3 h-9 disabled:opacity-50 disabled:cursor-not-allowed" disabled={submitting}>
              {submitting ? "Kaydediliyor..." : "Onayla"}
            </button>
            <button type="button" className="rounded border px-3 h-9" onClick={()=>setModal(false)} disabled={submitting}>İptal</button>
          </div>
        </form>
      )}
    </div>
    </>
  );
}
