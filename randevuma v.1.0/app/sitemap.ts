import type { MetadataRoute } from "next";

const base =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://randevuma.com");

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();
  return [
    { url: `${base}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    // Randevu sayfası deploy olduğunda burada da listelenecek:
    { url: `${base}/randevu`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
  ];
}