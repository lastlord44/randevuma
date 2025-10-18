// ping
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // YarÄ±n 10:00 (TR) slotu
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    
    return NextResponse.json({
      ok: true,
      nextSlot: tomorrow.toISOString(),
      timezone: "Europe/Istanbul"
    });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
