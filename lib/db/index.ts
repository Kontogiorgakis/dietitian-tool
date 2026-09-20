import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

declare global {
   
  var prisma: PrismaClient | undefined;
}

const adapter = new PrismaPg({
  // DATABASE_URL is the pooled string for production; DIRECT_URL alone is enough in development.
  connectionString: (process.env.DATABASE_URL ?? process.env.DIRECT_URL)!,
});

export const prisma =
  global.prisma ||
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? [] : ["error"],
  });

export * from "@prisma/client";

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}
