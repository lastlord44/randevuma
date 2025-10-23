import { PrismaClient } from "@prisma/client";

// Turso (libSQL) ise adapter kullan
let prisma: PrismaClient;

const isTurso = !!process.env.TURSO_DATABASE_URL;

if (isTurso) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { createClient } = require("@libsql/client");
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { PrismaLibSQL } = require("@prisma/adapter-libsql");

  const libsql = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  });
  const adapter = new PrismaLibSQL(libsql);
  prisma = new PrismaClient({ adapter });
} else {
  prisma = new PrismaClient();
}

// Hot-reload safe (Next dev)
const globalForPrisma = global as unknown as { prisma?: PrismaClient };
export const db = globalForPrisma.prisma || prisma;
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

export { db as prisma };
