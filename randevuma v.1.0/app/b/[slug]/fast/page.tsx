import { prisma } from "@/lib/db";
import FastClient from "./ui";
import { notFound } from "next/navigation";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const business = await prisma.business.findUnique({ where: { slug } });
  if (!business) return notFound();

  const services = await prisma.service.findMany({ where: { businessId: business.id, active: true }, orderBy: { name: "asc" } });
  const staff = await prisma.staff.findMany({ where: { businessId: business.id, active: true }, orderBy: { name: "asc" } });

  return <FastClient businessSlug={slug} services={services} staff={staff} />;
}
