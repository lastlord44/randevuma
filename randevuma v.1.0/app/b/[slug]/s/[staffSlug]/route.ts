import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request, { params }: { params: { slug: string; staffSlug: string } }) {
  const site = process.env.NEXT_PUBLIC_SITE_URL || "";
  const base = new URL(`/b/${params.slug}/fast`, site || "http://localhost:3000");

  const biz = await prisma.business.findUnique({ where: { slug: params.slug } });
  if (!biz) return NextResponse.redirect(base);

  const staff = await prisma.staff.findFirst({
    where: { businessId: biz.id, slug: params.staffSlug, active: true },
    select: { id: true },
  });

  if (staff) base.searchParams.set("staffId", staff.id);

  // Mevcut query'leri (örn serviceId) koru
  const inParams = new URL(req.url).searchParams;
  for (const [k, v] of inParams.entries()) base.searchParams.set(k, v);

  return NextResponse.redirect(base, {
    headers: { "Cache-Control": "public, max-age=3600, s-maxage=3600" }
  });
}

