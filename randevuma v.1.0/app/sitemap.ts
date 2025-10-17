import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://randevuma.com";
  const now = new Date().toISOString();

  return [
    { url: `${base}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${base}/b/demo`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    // Gerekirse burada dinamik sayfaları ekle
  ];
}