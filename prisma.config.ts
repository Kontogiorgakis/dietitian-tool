import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "lib/db/schema.prisma",
  datasource: {
    // Falls back to a placeholder so `prisma generate` works without DATABASE_URL
    // (e.g. during CI install or before env vars are configured).
    // Migrations still require a real DATABASE_URL at runtime.
    url: process.env.DATABASE_URL ?? "postgresql://placeholder",
  },
});
