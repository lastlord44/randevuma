// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

let prismaGlobal: PrismaClient | undefined

export function getPrisma(): PrismaClient {
  if (prismaGlobal) return prismaGlobal

  // ENV'leri tam runtime'da oku + trimle
  const rawUrl = (process.env.TURSO_DATABASE_URL ?? process.env.DATABASE_URL ?? '').trim()
  const rawToken = (process.env.TURSO_AUTH_TOKEN ?? '').trim()

  if (!rawUrl) {
    // Net ve hızlı hata: deploy/ENV sorunu hemen belli olsun
    throw new Error('DB_URL_MISSING: TURSO_DATABASE_URL or DATABASE_URL is required (non-empty, trimmed)')
  }

  // Dinamik require -> edge bundle'a sızmaz
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { createClient } = require('@libsql/client')
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { PrismaLibSQL } = require('@prisma/adapter-libsql')

  // libsql client
  const libsql = createClient({
    url: rawUrl,
    authToken: rawToken || undefined,
  })

  // Prisma adapter
  const adapter = new PrismaLibSQL(libsql)

  prismaGlobal = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['error', 'warn'],
  })

  return prismaGlobal
}

// Backward-compat: eski import'ları kırmamak için
export const prisma = getPrisma()
export { prisma as db }
