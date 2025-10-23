import { prisma } from "@/lib/prisma";
import StaffLinkCard from "./link-card";

export default async function StaffDashboard() {
  const businessSlug = "demo"; // TODO: Dinamik hale getir

  const business = await prisma.business.findUnique({ where: { slug: businessSlug } });
  if (!business) return <div className="p-8">İşletme bulunamadı.</div>;

  const staff = await prisma.staff.findMany({
    where: { businessId: business.id, active: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <h1 className="text-3xl font-semibold tracking-tight">Personel Yönetimi</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {staff.map((s) => (
            <StaffLinkCard key={s.id} staff={s} businessSlug={businessSlug} />
          ))}
        </div>
      </div>
    </div>
  );
}

