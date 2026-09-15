import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/general/site-url";

const robots = (): MetadataRoute.Robots => ({
  rules: {
    userAgent: "*",
    allow: "/",
    disallow: ["/api/", "/admin/"],
  },
  sitemap: `${SITE_URL}/sitemap.xml`,
});

export default robots;
