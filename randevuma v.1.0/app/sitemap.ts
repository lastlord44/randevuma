import type { MetadataRoute } from "next";
import { baseUrl } from "@/lib/baseUrl";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();

  return [
    { url: `${baseUrl}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/b/demo`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
  ];
}