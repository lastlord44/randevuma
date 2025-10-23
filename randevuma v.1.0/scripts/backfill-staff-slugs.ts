import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

function slugify(s: string) {
  return s.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

async function main() {
  const all = await prisma.staff.findMany();
  for (const st of all) {
    if ((st as any).slug) continue;
    let base = slugify(st.name || "personel");
    let slug = base, k = 1;
    // işletme içinde benzersiz yap
    while (await prisma.staff.findFirst({ where: { businessId: st.businessId, slug } })) {
      slug = `${base}-${k++}`;
    }
    await prisma.staff.update({ where: { id: st.id }, data: { slug } });
    console.log(`Set slug for ${st.name} -> ${slug}`);
  }
}

main().finally(()=>prisma.$disconnect());

