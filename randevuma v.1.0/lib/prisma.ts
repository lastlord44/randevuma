// lib/prisma.ts
import type { PrismaClient as PrismaClientType } from '@prisma/client'

let prismaGlobal: PrismaClientType | undefined

function cleanEnv(v: string | undefined) {
  if (!v) return ''
  // 1) uç boşlukları kırp
  let s = v.trim()
  // 2) sonda gerçek newline'ları at
  s = s.replace(/\r?\n+$/g, '')
  // 3) sonda *literal* \r\n kaçışlarını at (backslash-r backslash-n)
  s = s.replace(/\\r\\n$/g, '')
  // 4) başka bir şey elleme (özellikle //)
  return s
}

export async function getPrisma(): Promise<PrismaClientType> {
  if (prismaGlobal) return prismaGlobal

  const url = cleanEnv(process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL)
  const token = cleanEnv(process.env.TURSO_AUTH_TOKEN)

  if (!url) {
    // Fail fast: gizemli "URL undefined" yerine net mesaj
    throw new Error('DB_URL_MISSING: TURSO_DATABASE_URL veya DATABASE_URL boş. Vercel UI\'dan tek satır olarak girin.')
  }

  // ESM paketleri için *dynamic import* kullan
  const [{ PrismaClient }, { createClient }, { PrismaLibSQL }] = await Promise.all([
    import('@prisma/client'),
    import('@libsql/client'),
    import('@prisma/adapter-libsql'),
  ])

  const libsql = createClient({ url, authToken: token || undefined })
  const adapter = new PrismaLibSQL(libsql)

  prismaGlobal = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['error', 'warn'],
  }) as unknown as PrismaClientType

  return prismaGlobal
}
