import type { MetadataRoute } from "next";
import { getConfig } from "@/lib/content";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const config = getConfig();
  if (!config.canonical_url) return [];
  return [
    {
      url: config.canonical_url,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
