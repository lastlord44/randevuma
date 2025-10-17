import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://randevuma.com';
  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `/b/demo`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
  ];
}
