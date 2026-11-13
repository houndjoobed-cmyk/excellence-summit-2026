import type { MetadataRoute } from "next";
import { getPublicSiteOrigin } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const origin = getPublicSiteOrigin();

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/intervenants"],
        disallow: ["/dashboard", "/dashboard/", "/badge", "/api/"],
      },
    ],
    sitemap: `${origin}/sitemap.xml`,
  };
}

