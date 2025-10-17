import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();

  return [
    { url: "https://randevuma.com/", lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: "https://randevuma.com/b/demo", lastModified: now, changeFrequency: "weekly", priority: 0.8 },
  ];
}