// app/sitemap.ts
import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://randevuma.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Businesses & Staff'ı çek
  const businesses = await prisma.business.findMany({
    select: { id: true, slug: true },
  })
  const staff = await prisma.staff.findMany({
    where: { active: true },
    select: { slug: true, businessId: true },
  })

  const pages: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, changeFrequency: 'weekly', priority: 0.8 },
  ]

  for (const b of businesses) {
    pages.push({
      url: `${BASE}/b/${b.slug}/fast`,
      changeFrequency: 'daily',
      priority: 0.9,
    })
  }

  for (const st of staff) {
    const business = businesses.find(x => x.id === st.businessId)
    if (!business) continue
    pages.push({
      url: `${BASE}/b/${business.slug}/s/${st.slug}`,
      changeFrequency: 'daily',
      priority: 0.7,
    })
  }

  return pages
}

