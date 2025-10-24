import { getPrisma } from "@/lib/prisma";
import FastClient from "./ui";
import { notFound } from "next/navigation";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ staffId?: string; serviceId?: string }>;
}) {
  const prisma = getPrisma();
  const { slug } = await params;
  const sp = searchParams ? await searchParams : {};
  
  const business = await prisma.business.findUnique({ where: { slug } });
  if (!business) return notFound();

  const services = await prisma.service.findMany({ where: { businessId: business.id, active: true }, orderBy: { name: "asc" } });
  const staff = await prisma.staff.findMany({ where: { businessId: business.id, active: true }, orderBy: { name: "asc" } });

  return (
    <FastClient
      businessSlug={slug}
      services={services}
      staff={staff}
      defaultStaffId={sp?.staffId}
      defaultServiceId={sp?.serviceId}
    />
  );
}
