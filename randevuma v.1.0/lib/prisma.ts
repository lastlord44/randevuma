// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

let prismaInstance: PrismaClient | null = null

function initPrisma(): PrismaClient {
  if (prismaInstance) return prismaInstance

  // ENV'leri tam runtime'da oku + trimle
  const rawUrl = (process.env.TURSO_DATABASE_URL ?? process.env.DATABASE_URL ?? '').trim()
  const rawToken = (process.env.TURSO_AUTH_TOKEN ?? '').trim()

  console.log('[Prisma Init] URL:', rawUrl ? `${rawUrl.substring(0, 30)}...` : 'EMPTY')
  console.log('[Prisma Init] Token:', rawToken ? 'present' : 'EMPTY')

  if (!rawUrl) {
    throw new Error('DB_URL_MISSING: TURSO_DATABASE_URL or DATABASE_URL required')
  }

  // Dinamik require
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { createClient } = require('@libsql/client')
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { PrismaLibSQL } = require('@prisma/adapter-libsql')

  const libsql = createClient({
    url: rawUrl,
    authToken: rawToken || undefined,
  })

  const adapter = new PrismaLibSQL(libsql)

  prismaInstance = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['error', 'warn'],
  })

  console.log('[Prisma Init] ✅ Client created successfully')
  return prismaInstance
}

// Getter pattern - her property access'te kontrol et
const handler: ProxyHandler<any> = {
  get(_target, prop) {
    if (prop === 'then' || prop === 'catch' || prop === 'finally') {
      // Promise protokolü için undefined dön (async işlemler için)
      return undefined
    }
    const client = initPrisma()
    const value = client[prop as keyof PrismaClient]
    if (typeof value === 'function') {
      return value.bind(client)
    }
    return value
  },
}

export const prisma = new Proxy({}, handler) as PrismaClient
export { prisma as db }
