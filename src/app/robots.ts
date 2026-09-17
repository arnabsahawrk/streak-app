import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // The app itself is private per account; the landing/sign-in page is
      // what should be discoverable.
      { userAgent: "*", allow: "/", disallow: ["/api/"] },
    ],
    sitemap: "https://streakment.vercel.app/sitemap.xml",
  };
}
