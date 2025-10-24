// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

let prisma: PrismaClient | undefined

export function getPrisma() {
  if (!prisma) {
    // ENV'leri *runtime*'da oku + temizle (CRLF, quotes, literal \r\n)
    const rawUrl = (process.env.TURSO_DATABASE_URL ?? process.env.DATABASE_URL ?? '')
      .replace(/\\r\\n/g, '')  // literal \r\n string
      .replace(/[\r\n"']/g, '')  // actual CRLF + quotes
      .trim()
    const rawToken = (process.env.TURSO_AUTH_TOKEN ?? '')
      .replace(/\\r\\n/g, '')
      .replace(/[\r\n"']/g, '')
      .trim()

    if (!rawUrl) {
      // Fail fast: env eksikse gizemli hatalar yerine net mesaj
      throw new Error('DB_URL_MISSING: Set TURSO_DATABASE_URL or DATABASE_URL in Vercel (no trailing CRLF).')
    }

    // Dinamik import — Edge bundle'a sızmaz
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { createClient } = require('@libsql/client')
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { PrismaLibSQL } = require('@prisma/adapter-libsql')

    const libsql = createClient({
      url: rawUrl,
      authToken: rawToken || undefined,
    })

    const adapter = new PrismaLibSQL(libsql)

    prisma = new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === 'production' ? ['error'] : ['error', 'warn'],
    })
  }
  return prisma
}

// Backward compatibility
export { prisma as db }
