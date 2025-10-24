import { PrismaClient } from '@prisma/client'

// Dinamik import: edge bundle'a sızmaz
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { createClient } = require('@libsql/client')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PrismaLibSQL } = require('@prisma/adapter-libsql')

const url = process.env.TURSO_DATABASE_URL!
const authToken = process.env.TURSO_AUTH_TOKEN

// Global libsql client (tek kez) + Prisma instance
const g = globalThis as unknown as { __libsql?: any; __prisma?: PrismaClient }

// LibSQL client'i bir kez oluştur ve reuse et
if (!g.__libsql && url) {
  g.__libsql = createClient({ url, authToken })
}

// Prisma adapter + client
const adapter = g.__libsql ? new PrismaLibSQL(g.__libsql) : undefined

export const prisma =
  g.__prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['error', 'warn'],
  })

if (!g.__prisma) g.__prisma = prisma

export { prisma as db }

