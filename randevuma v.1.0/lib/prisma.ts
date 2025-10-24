import { PrismaClient } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'

declare global {
  // Hot-reload'da tekil instance
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

// Turso için libSQL client oluştur
function createPrismaClient(): PrismaClient {
  const isTurso = !!process.env.TURSO_DATABASE_URL

  if (isTurso) {
    // Turso/LibSQL adapter - pass config directly
    const adapter = new PrismaLibSQL({
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN,
    })

    return new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === 'production' ? ['error'] : ['error', 'warn'],
    })
  }

  // Standard SQLite (local development)
  return new PrismaClient({
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['error', 'warn'],
  })
}

export const prisma = global.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}

export { prisma as db }

