import type { MetadataRoute } from "next";
import { getConfig } from "@/lib/content";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  const config = getConfig();
  const baseUrl = config.canonical_url || "";
  return {
    rules: { userAgent: "*", allow: "/" },
    ...(baseUrl && { sitemap: `${baseUrl}/sitemap.xml` }),
  };
}
