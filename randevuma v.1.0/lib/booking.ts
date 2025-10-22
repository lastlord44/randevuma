// lib/booking.ts
import { addMinutes } from "date-fns";
export type ServiceMeta = { durationMin: number; bufferBefore: number; bufferAfter: number };

export function hasOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return !(aEnd <= bStart || aStart >= bEnd);
}
export function withBuffers(slot: Date, s: ServiceMeta) {
  const startWithBefore = addMinutes(slot, -s.bufferBefore);
  const end = addMinutes(slot, s.durationMin + s.bufferAfter);
  return { startWithBefore, end };
}
export function weekday1to7(date: Date) { return ((date.getDay() + 6) % 7) + 1; }
export function minutesToDate(base: Date, min: number) {
  const d = new Date(base); d.setHours(Math.floor(min/60), min%60, 0, 0); return d;
}
