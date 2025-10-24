import { PrismaClient } from '@prisma/client'

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

// Create Prisma client with optional Turso adapter
function createPrismaClient(): PrismaClient {
  const isTurso = !!process.env.TURSO_DATABASE_URL

  if (isTurso) {
    try {
      // Dinamik import: edge bundle'a sızmaz
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { createClient } = require('@libsql/client')
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { PrismaLibSQL } = require('@prisma/adapter-libsql')

      const libsql = createClient({
        url: process.env.TURSO_DATABASE_URL!,
        authToken: process.env.TURSO_AUTH_TOKEN,
      })

      const adapter = new PrismaLibSQL(libsql)

      return new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === 'production' ? ['error'] : ['error', 'warn'],
      })
    } catch (e) {
      // Fallback to standard SQLite if Turso adapter fails
      console.warn('Turso adapter failed, falling back to standard SQLite:', e)
    }
  }

  // Standard SQLite (local development or build time)
  return new PrismaClient({
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['error', 'warn'],
  })
}

export const prisma = global.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}

export { prisma as db }

