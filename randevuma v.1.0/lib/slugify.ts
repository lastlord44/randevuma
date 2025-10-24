/**
 * Türkçe karakter desteği ile slug oluşturur
 * @param input - Slugify edilecek string
 * @returns URL-safe slug
 */
export function slugify(input: string): string {
  return input
    .toLocaleLowerCase('tr-TR')
    .normalize('NFKD')
    // Türkçe karakterleri dönüştür
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/i̇/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    // Sadece harf, rakam, tire ve boşluk bırak
    .replace(/[^\w\s-]/g, '')
    .trim()
    // Boşlukları tire yap
    .replace(/\s+/g, '-')
    // Çift tireleri tek yap
    .replace(/-+/g, '-')
    // Baştaki/sondaki tireleri temizle
    .replace(/^-+|-+$/g, '');
}

/**
 * İşletme içinde benzersiz staff slug üretir
 * @param prisma - Prisma client
 * @param businessId - İşletme ID
 * @param name - Staff adı
 * @returns Benzersiz slug
 */
export async function ensureUniqueStaffSlug(
  prisma: any,
  businessId: string,
  name: string
): Promise<string> {
  const base = slugify(name || 'personel');
  let slug = base;
  let counter = 2;

  while (
    await prisma.staff.findFirst({
      where: { businessId, slug },
    })
  ) {
    slug = `${base}-${counter++}`;
  }

  return slug;
}

