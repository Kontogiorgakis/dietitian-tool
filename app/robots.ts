import type { MetadataRoute } from "next";

// Μέτρο is a private practice tool: nothing is meant to be indexed, and there is no
// sitemap, so no public origin is needed to build. See .claude/rules/deployment-urls.md.
const robots = (): MetadataRoute.Robots => ({
  rules: {
    userAgent: "*",
    disallow: "/",
  },
});

export default robots;
