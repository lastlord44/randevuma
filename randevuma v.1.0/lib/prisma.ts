// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

let prismaInstance: PrismaClient | null = null

function initPrisma(): PrismaClient {
  if (prismaInstance) return prismaInstance

  try {
    // ENV'leri tam runtime'da oku + trimle
    const rawUrl = (process.env.TURSO_DATABASE_URL ?? process.env.DATABASE_URL ?? '').trim()
    const rawToken = (process.env.TURSO_AUTH_TOKEN ?? '').trim()

    console.log('[Prisma Init] Starting initialization...')
    console.log('[Prisma Init] Raw URL length:', rawUrl.length)
    console.log('[Prisma Init] URL preview:', rawUrl ? `${rawUrl.substring(0, 40)}...` : 'EMPTY')
    console.log('[Prisma Init] Token length:', rawToken.length)

    if (!rawUrl || rawUrl.length === 0) {
      throw new Error('DB_URL_MISSING: TURSO_DATABASE_URL or DATABASE_URL required (got empty string)')
    }

    if (!rawUrl.startsWith('libsql://')) {
      throw new Error(`DB_URL_INVALID: URL must start with libsql://, got: ${rawUrl.substring(0, 20)}`)
    }

    console.log('[Prisma Init] Creating libsql client...')
    
    // Dinamik require
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { createClient } = require('@libsql/client')
    
    const libsql = createClient({
      url: rawUrl,
      authToken: rawToken || undefined,
    })

    console.log('[Prisma Init] libsql client created, creating adapter...')

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { PrismaLibSQL } = require('@prisma/adapter-libsql')
    
    const adapter = new PrismaLibSQL(libsql)

    console.log('[Prisma Init] Adapter created, creating PrismaClient...')

    prismaInstance = new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === 'production' ? ['error'] : ['error', 'warn'],
    })

    console.log('[Prisma Init] ✅ PrismaClient created successfully!')
    return prismaInstance
  } catch (error) {
    console.error('[Prisma Init] ❌ FATAL ERROR:', error)
    throw error
  }
}

// Getter pattern
const handler: ProxyHandler<any> = {
  get(_target, prop) {
    if (prop === 'then' || prop === 'catch' || prop === 'finally') {
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
