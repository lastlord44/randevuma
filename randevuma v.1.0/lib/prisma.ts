import { PrismaClient } from "@prisma/client";

// Global type for hot-reload
declare global {
  // eslint-disable-next-line no-var
  var cachedPrisma: PrismaClient | undefined;
}

// Create Prisma client with optional Turso adapter
function createPrismaClient(): PrismaClient {
  const isTurso = !!process.env.TURSO_DATABASE_URL;

  if (isTurso) {
    try {
      // Dynamic require to avoid build-time errors
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { PrismaLibSQL } = require("@prisma/adapter-libsql");
      const adapter = new PrismaLibSQL({
        url: process.env.TURSO_DATABASE_URL!,
        authToken: process.env.TURSO_AUTH_TOKEN!,
      });
      return new PrismaClient({ adapter });
    } catch (error) {
      console.warn("Turso adapter not available, using standard SQLite:", error);
      return new PrismaClient();
    }
  }

  return new PrismaClient();
}

// Hot-reload safe (Next dev)
let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  prisma = createPrismaClient();
} else {
  if (!global.cachedPrisma) {
    global.cachedPrisma = createPrismaClient();
  }
  prisma = global.cachedPrisma;
}

export const db = prisma;
export { db as prisma };

