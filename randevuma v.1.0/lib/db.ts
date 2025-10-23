import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client/web";

// Turso (libSQL) ise adapter kullan
let prisma: PrismaClient;

const isTurso = !!process.env.TURSO_DATABASE_URL;

if (isTurso) {
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
