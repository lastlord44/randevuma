import { prisma } from "@/lib/db";
import FastClient from "./ui";
import { notFound } from "next/navigation";

export default async function Page({ params }: { params: { slug: string } }) {
  const business = await prisma.business.findUnique({ where: { slug: params.slug } });
  if (!business) return notFound();

  const services = await prisma.service.findMany({ where: { businessId: business.id, isActive: true }, orderBy: { name: "asc" } });
  const staff = await prisma.staff.findMany({ where: { businessId: business.id, isActive: true }, orderBy: { name: "asc" } });

  return <FastClient businessSlug={params.slug} services={services} staff={staff} />;
}