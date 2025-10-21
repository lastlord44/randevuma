// lib/booking.ts
import { addMinutes } from "date-fns";

export type ServiceMeta = { durationMin: number; bufferBefore: number; bufferAfter: number };

export function hasOverlap(
  startA: Date, endA: Date,
  startB: Date, endB: Date
) {
  // Çakışmaması için: endA <= startB || startA >= endB
  return !(endA <= startB || startA >= endB);
}

export function withBuffers(slot: Date, s: ServiceMeta) {
  const startWithBefore = addMinutes(slot, -s.bufferBefore);
  const end = addMinutes(slot, s.durationMin + s.bufferAfter);
  return { startWithBefore, end };
}

export function weekday1to7(date: Date) {
  return ((date.getDay() + 6) % 7) + 1; // 1..7 (Mon..Sun)
}