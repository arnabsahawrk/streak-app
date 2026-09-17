import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://streakment.vercel.app", lastModified: new Date(), changeFrequency: "monthly", priority: 1 },
    { url: "https://streakment.vercel.app/signin", lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
  ];
}
