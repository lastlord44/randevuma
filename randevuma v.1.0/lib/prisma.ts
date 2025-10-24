// lib/prisma.ts
import type { PrismaClient as PrismaClientType } from '@prisma/client'

let prismaGlobal: PrismaClientType | undefined

export function getPrisma(): PrismaClientType {
  if (prismaGlobal) return prismaGlobal

  // ENV'leri *runtime*'da oku + AGRESSIVELY temizle (CRLF, quotes, backslashes)
  const rawUrl = (process.env.TURSO_DATABASE_URL ?? process.env.DATABASE_URL ?? '')
    .replace(/[\r\n"'\\]/g, '')  // Tüm \r, \n, quotes, backslash'leri temizle
    .trim()
  const rawToken = (process.env.TURSO_AUTH_TOKEN ?? '')
    .replace(/[\r\n"'\\]/g, '')
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
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { PrismaClient } = require('@prisma/client')

  const libsql = createClient({
    url: rawUrl,
    authToken: rawToken || undefined,
  })

  const adapter = new PrismaLibSQL(libsql)

  prismaGlobal = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['error', 'warn'],
  }) as PrismaClientType

  return prismaGlobal
}
