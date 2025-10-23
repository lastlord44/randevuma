export function buildICS({ title, startISO, endISO, desc }: { title: string; startISO: string; endISO: string; desc?: string }) {
  const uid = crypto.randomUUID();
  return [
    "BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Randevuma//EN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${toICS(new Date())}`,
    `DTSTART:${toICS(new Date(startISO))}`,
    `DTEND:${toICS(new Date(endISO))}`,
    `SUMMARY:${escapeICS(title)}`,
    `DESCRIPTION:${escapeICS(desc ?? "")}`,
    "END:VEVENT","END:VCALENDAR"
  ].join("\r\n");
}
function toICS(d: Date){ const p=(n:number)=>String(n).padStart(2,"0");
  return `${d.getUTCFullYear()}${p(d.getUTCMonth()+1)}${p(d.getUTCDate())}T${p(d.getUTCHours())}${p(d.getUTCMinutes())}00Z`;
}
function escapeICS(s:string){ return s.replace(/([,;])/g,"\\$1"); }
