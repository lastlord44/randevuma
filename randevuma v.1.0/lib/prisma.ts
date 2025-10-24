// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

declare global {
  // eslint-disable-next-line no-var
  var __prismaClient: PrismaClient | undefined
}

// Lazy initialization: only create client on first access (runtime)
function getPrismaClient(): PrismaClient {
  if (global.__prismaClient) {
    return global.__prismaClient
  }

  // Try TURSO_DATABASE_URL first, then DATABASE_URL (trim whitespace/newlines)
  const rawUrl = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL
  const url = rawUrl?.trim()
  const authToken = process.env.TURSO_AUTH_TOKEN?.trim()

  // Check if we should use Turso adapter
  if (url && url.startsWith('libsql://')) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { createClient } = require('@libsql/client')
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { PrismaLibSQL } = require('@prisma/adapter-libsql')

      const libsql = createClient({ url, authToken })
      const adapter = new PrismaLibSQL(libsql)

      global.__prismaClient = new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === 'production' ? ['error'] : ['error', 'warn'],
      })

      return global.__prismaClient
    } catch (error) {
      console.error('[Prisma] Failed to create Turso client, falling back to standard:', error)
    }
  }

  // Fallback to standard PrismaClient (for build time or non-Turso URLs)
  global.__prismaClient = new PrismaClient({
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['error', 'warn'],
  })

  return global.__prismaClient
}

// Export as getter
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    return getPrismaClient()[prop as keyof PrismaClient]
  },
})

export { prisma as db }
