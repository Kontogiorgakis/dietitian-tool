import { existsSync } from "node:fs";

import { defineConfig } from "prisma/config";

// Prisma 7 does not load env files itself, so the CLI (migrate, studio) reads them here.
// Next.js loads the same files for the app. Later files win, matching Next's order.
for (const file of [".env", ".env.local"]) {
  if (existsSync(file)) process.loadEnvFile(file);
}

export default defineConfig({
  schema: "lib/db/schema.prisma",
  datasource: {
    // DATABASE_URL is the pooled string for production; DIRECT_URL alone is enough in
    // development. The placeholder keeps `prisma generate` working with no env at all.
    url: process.env.DATABASE_URL ?? process.env.DIRECT_URL ?? "postgresql://placeholder",
  },
});
