import type { MetadataRoute } from "next";
import { getPublicSiteOrigin } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = getPublicSiteOrigin();
  const lastModified = new Date();

  return [
    {
      url: origin,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${origin}/intervenants`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.85,
    },
  ];
}

