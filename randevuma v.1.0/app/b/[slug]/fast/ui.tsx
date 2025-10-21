"use client";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type Service = { id: string; name: string; duration: number; bufferBefore: number; bufferAfter: number };
type Staff = { id: string; name: string };

export default function FastClient({
  businessSlug, services, staff
}: { businessSlug: string; services: Service[]; staff: Staff[] }) {
  const [serviceId, setServiceId] = useState<string>(services[0]?.id ?? "");
  const [staffId, setStaffId] = useState<string>("auto");
  const [dateStr, setDateStr] = useState<string>(new Date().toISOString().slice(0,10));
  const [slots, setSlots] = useState<{startISO:string; staffId:string; label:string}[]>([]);
  const [show, setShow] = useState(false);
  const [pending, setPending] = useState<{startISO:string; staffId:string}|null>(null);
  const [name, setName] = useState(""); const [tel, setTel] = useState("");

  async function load() {
    if (!serviceId) return;
    const qs = new URLSearchParams({ businessSlug, serviceId, date: dateStr });
    if (staffId !== "auto") qs.append("staffId", staffId);
    const res = await fetch(`/api/fast/next-slots?${qs.toString()}`, { cache: "no-store" });
    const j = await res.json();
    setSlots(j.slots || []);
  }
  useEffect(() => { load(); }, [serviceId, staffId, dateStr]);

  function openBook(s: {startISO:string; staffId:string}) { setPending(s); setShow(true); }

  async function onBook(e: React.FormEvent) {
    e.preventDefault();
    if (!pending || !serviceId) return;
    const res = await fetch("/api/fast/book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessSlug, serviceId,
        staffId: pending.staffId,
        startAtISO: pending.startISO,
        customerName: name, customerTel: tel
      })
    });
    const j = await res.json();
    if (j.ok) {
      alert("Randevunuz alındı ✅");
      setShow(false); setName(""); setTel("");
      load();
    } else {
      alert("Üzgünüz: " + (j.error || "Hata"));
      load();
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-semibold">Hızlı Randevu</h1>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card><CardHeader className="py-3"><CardTitle className="text-base">Hizmet</CardTitle></CardHeader>
          <CardContent className="pt-0">
            <Select value={serviceId} onValueChange={setServiceId}>
              <SelectTrigger><SelectValue placeholder="Hizmet" /></SelectTrigger>
              <SelectContent>
                {services.map(s => <SelectItem key={s.id} value={s.id}>{s.name} • {s.duration} dk</SelectItem>)}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card><CardHeader className="py-3"><CardTitle className="text-base">Personel</CardTitle></CardHeader>
          <CardContent className="pt-0">
            <Select value={staffId} onValueChange={setStaffId}>
              <SelectTrigger><SelectValue placeholder="Personel" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Otomatik (en uygun)</SelectItem>
                {staff.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card><CardHeader className="py-3"><CardTitle className="text-base">Tarih</CardTitle></CardHeader>
          <CardContent className="pt-0">
            <input className="w-full border rounded-md h-9 px-2" type="date" value={dateStr} onChange={(e)=>setDateStr(e.target.value)} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="py-3"><CardTitle className="text-base">3 Hızlı Slot</CardTitle></CardHeader>
        <CardContent className="pt-0">
          <div className="grid sm:grid-cols-3 gap-2">
            {slots.length === 0 && <div className="text-sm text-muted-foreground">Uygun hızlı slot yok.</div>}
            {slots.map(s => (
              <button key={s.startISO+s.staffId}
                className="rounded-xl border px-4 py-3 text-left hover:shadow-sm"
                onClick={()=>openBook(s)}>
                <div className="text-lg font-semibold">{s.label}</div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={show} onOpenChange={setShow}>
        <DialogContent>
          <DialogHeader><DialogTitle>Randevuyu Onayla</DialogTitle></DialogHeader>
          <form onSubmit={onBook} className="space-y-3">
            <div className="text-sm text-muted-foreground">
              {pending && format(new Date(pending.startISO), "d MMM EEE HH:mm", { locale: tr })}
            </div>
            <Input placeholder="Adınız" value={name} onChange={e=>setName(e.target.value)} required />
            <Input placeholder="5xx xxx xx xx" value={tel} onChange={e=>setTel(e.target.value)} required />
            <DialogFooter><Button type="submit" className="w-full">Onayla</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}