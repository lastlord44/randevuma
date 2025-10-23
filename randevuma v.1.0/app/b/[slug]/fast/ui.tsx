"use client";
import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { buildICS } from "@/lib/ics";

type Service = { id: string; name: string; durationMin: number; bufferBefore: number; bufferAfter: number };
type Staff = { id: string; name: string };

type Slot = { startISO: string; staffId: string; label: string };

export default function FastClient({
  businessSlug, services, staff
}: { businessSlug: string; services: Service[]; staff: Staff[] }) {
  const [serviceId, setServiceId] = useState<string>(services[0]?.id ?? "");
  const [staffId, setStaffId] = useState<string>("auto");
  const [dateStr, setDateStr] = useState<string>(new Date().toISOString().slice(0,10));

  const [fastSlots, setFastSlots] = useState<Slot[]>([]);
  const [allSlots, setAllSlots] = useState<Slot[]>([]);
  const [showAll, setShowAll] = useState<boolean>(true);

  const [modal, setModal] = useState(false);
  const [pending, setPending] = useState<{startISO:string; staffId:string}|null>(null);
  const [name, setName] = useState(""); const [tel, setTel] = useState("");
  const [trap, setTrap] = useState(""); // honeypot
  const [loading, setLoading] = useState(false);

  async function load() {
    if (!serviceId) return;
    const base = new URLSearchParams({ businessSlug, serviceId, date: dateStr });
    if (staffId !== "auto") base.set("staffId", staffId);

    // 3 hızlı slot
    const r1 = await fetch(`/api/fast/next-slots?${base.toString()}`, { cache: "no-store" });
    const j1 = await r1.json(); setFastSlots(j1.slots || []);

    // tüm uygun saatler
    if (showAll) {
      const q2 = new URLSearchParams(base); q2.set("limit","all"); q2.set("step","15");
      const r2 = await fetch(`/api/fast/next-slots?${q2.toString()}`, { cache: "no-store" });
      const j2 = await r2.json(); setAllSlots(j2.slots || []);
    } else {
      setAllSlots([]);
    }
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [serviceId, staffId, dateStr, showAll]);

  // grid'i personel başına grupla (ön izlemeyle aynı)
  const staffMap = useMemo(() => {
    const map: Record<string, Slot[]> = {};
    for (const s of allSlots) (map[s.staffId] ||= []).push(s);
    return map;
  }, [allSlots]);

  async function onBook(e: React.FormEvent) {
    e.preventDefault();
    if (!pending || !serviceId) return;
    setLoading(true);
    const res = await fetch("/api/fast/book", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessSlug, serviceId,
        staffId: pending.staffId, startAtISO: pending.startISO,
        customerName: name, customerTel: tel,
        _trap: trap, // honeypot
      })
    });
    const j = await res.json();
    setLoading(false);
    if (j.ok) {
      alert("Randevunuz alındı ✅");
      // ICS takvim dosyası oluştur ve indir
      const ics = buildICS({
        title: services.find(s=>s.id===serviceId)?.name ?? "Randevu",
        startISO: pending.startISO, 
        endISO: j.appointment?.endAt ?? pending.startISO,
        desc: "Randevunuz Randevuma ile oluşturuldu"
      });
      const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); 
      a.href = url; 
      a.download = "randevu.ics"; 
      a.click();
      URL.revokeObjectURL(url);
      
      setModal(false); setName(""); setTel(""); setTrap("");
      load();
    } else {
      alert("Üzgünüz: " + (j.error || "Hata"));
      load();
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Hızlı Randevu</h1>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={showAll} onChange={(e)=>setShowAll(e.target.checked)} />
            Tüm saatleri göster
          </label>
        </div>

        {/* Seçiciler */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rounded-xl border p-3">
            <div className="text-sm mb-1">Hizmet</div>
            <select value={serviceId} onChange={(e)=>setServiceId(e.target.value)} className="w-full border rounded-md h-9 px-2">
              {services.map(s => <option key={s.id} value={s.id}>{s.name} • {s.durationMin} dk</option>)}
            </select>
          </div>
          <div className="rounded-xl border p-3">
            <div className="text-sm mb-1">Personel</div>
            <select value={staffId} onChange={(e)=>setStaffId(e.target.value)} className="w-full border rounded-md h-9 px-2">
              <option value="auto">Otomatik (en uygun)</option>
              {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="rounded-xl border p-3">
            <div className="text-sm mb-1">Tarih</div>
            <input className="w-full border rounded-md h-9 px-2" type="date" value={dateStr} onChange={(e)=>setDateStr(e.target.value)} />
          </div>
        </div>

        {/* 3 Hızlı Slot */}
        <div className="rounded-2xl border p-3">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-base font-medium">3 Hızlı Slot</div>
            <div className="text-xs text-gray-500">En yakın uygun</div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {fastSlots.length === 0 && <div className="text-sm text-gray-500">Uygun hızlı slot yok.</div>}
            {fastSlots.map(s => (
              <button
                key={s.startISO+s.staffId}
                className="w-full rounded-2xl border px-4 py-3 text-left hover:shadow-sm active:scale-[0.98] transition"
                onClick={()=>{ setPending(s); setModal(true); }}
              >
                <div className="text-lg font-semibold">{s.label}</div>
                <div className="text-xs text-gray-500">{staff.find(x=>x.id===s.staffId)?.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Tüm Saatler Grid — personel sütunlarıyla */}
        {showAll && (
          <div className="rounded-2xl border p-3">
            <div className="mb-2 text-base font-medium">Tüm Saatler</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(staffId === "auto" ? staff : staff.filter(s=>s.id===staffId)).map((p) => (
                <div key={p.id} className="rounded-2xl border p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-gray-500">{services.find(s=>s.id===serviceId)?.durationMin} dk</div>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                    {(staffMap[p.id] ?? []).map((s) => (
                      <button
                        key={s.startISO+s.staffId}
                        className="rounded-xl px-2 py-2 text-sm border hover:shadow-sm active:scale-[0.98] transition"
                        onClick={()=>{ setPending(s); setModal(true); }}
                      >
                        {s.label}
                      </button>
                    ))}
                    {(staffMap[p.id] ?? []).length === 0 && (
                      <div className="text-sm text-gray-500">Uygun saat yok.</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Onay formu */}
        {modal && pending && (
          <form onSubmit={onBook} className="max-w-md rounded-2xl border p-3 space-y-2">
            <div className="text-sm text-gray-600">
              {format(new Date(pending.startISO), "d MMM EEE HH:mm", { locale: tr })} • {staff.find(x=>x.id===pending.staffId)?.name}
            </div>
            {/* Honeypot: bot doldurursa reddedilecek */}
            <input
              name="_trap"
              value={trap}
              onChange={(e)=>setTrap(e.target.value)}
              className="hidden"
              tabIndex={-1}
              aria-hidden="true"
              autoComplete="off"
            />
            <input
              className="border rounded px-2 h-9 w-full" placeholder="Adınız (min 2 karakter)"
              value={name} onChange={e=>setName(e.target.value)} minLength={2} required
            />
            <input
              className="border rounded px-2 h-9 w-full" placeholder="Telefon (10+ rakam)"
              value={tel} onChange={e=>setTel(e.target.value.replace(/\D/g,''))} inputMode="numeric" pattern="\d{10,}" required
            />
            <div className="flex gap-2">
              <button type="submit" disabled={loading} className={`rounded bg-black text-white px-3 h-9 ${loading ? "opacity-70 cursor-not-allowed" : ""}`}>
                {loading ? "Kaydediliyor..." : "Onayla"}
              </button>
              <button type="button" className="rounded border px-3 h-9" onClick={()=>{setModal(false); setTrap("");}}>İptal</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
