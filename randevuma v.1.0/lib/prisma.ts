// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

// Dinamik require -> edge bundle'a sızmaz
const maybeCreateClient = () => {
  try {
    const url = process.env.TURSO_DATABASE_URL
    const authToken = process.env.TURSO_AUTH_TOKEN
    if (!url) return null
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { createClient } = require('@libsql/client')
    return createClient({ url, authToken })
  } catch {
    return null
  }
}

const maybeAdapter = (libsql: any) => {
  try {
    if (!libsql) return null
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { PrismaLibSQL } = require('@prisma/adapter-libsql')
    return new PrismaLibSQL(libsql)
  } catch {
    return null
  }
}

const g = globalThis as unknown as { __prisma?: PrismaClient }

if (!g.__prisma) {
  const libsql = maybeCreateClient()
  const adapter = maybeAdapter(libsql)
  
  // Adapter yoksa da sorun değil; Prisma bağlantıyı ilk query'de dener
  g.__prisma = new PrismaClient({
    // @ts-ignore - adapter can be null
    adapter: adapter || undefined,
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['error', 'warn'],
  })
}

export const prisma = g.__prisma!
export { prisma as db }
