// lib/prisma.ts
import type { PrismaClient as PrismaClientType } from '@prisma/client'

let prismaGlobal: PrismaClientType | undefined

export function getPrisma(): PrismaClientType {
  // TEMPORARY: Bypass cache to force fresh client creation for debugging
  // if (prismaGlobal) return prismaGlobal;
  console.log('[getPrisma] FORCE CREATING NEW CLIENT (cache bypassed for debug)');

  // ENV'leri *runtime*'da oku + temizle (CRLF, quotes - ama backslash'leri KORU!)
  const rawUrl = (process.env.TURSO_DATABASE_URL ?? process.env.DATABASE_URL ?? '')
    .replace(/[\r\n"']/g, '')  // Sadece \r, \n, quotes temizle (URL'deki // için backslash kalsın)
    .trim()
  const rawToken = (process.env.TURSO_AUTH_TOKEN ?? '')
    .replace(/[\r\n"']/g, '')
    .trim()

  // DEBUG: Log env values
  console.log('[getPrisma] rawUrl:', rawUrl || 'EMPTY')
  console.log('[getPrisma] rawUrl length:', rawUrl.length)
  console.log('[getPrisma] rawToken length:', rawToken.length)

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

  console.log('[getPrisma] Creating libsql client with url:', rawUrl.substring(0, 30) + '...')
  console.log('[getPrisma] authToken present:', !!rawToken)
  
  const libsql = createClient({
    url: rawUrl,
    authToken: rawToken || undefined,
  })

  console.log('[getPrisma] libsql client created, creating adapter...')
  const adapter = new PrismaLibSQL(libsql)

  console.log('[getPrisma] adapter created, creating PrismaClient...')
  prismaGlobal = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['error', 'warn'],
  }) as PrismaClientType

  console.log('[getPrisma] ✅ PrismaClient created successfully')
  return prismaGlobal
}
