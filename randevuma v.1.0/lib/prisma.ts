// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

// Dinamik require -> edge bundle'a sızmaz
const maybeCreateClient = () => {
  try {
    // Try TURSO_DATABASE_URL first, then DATABASE_URL
    const url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL
    const authToken = process.env.TURSO_AUTH_TOKEN
    
    if (!url) {
      console.warn('[Prisma] No TURSO_DATABASE_URL or DATABASE_URL found, using standard client')
      return null
    }
    
    // Only use adapter for libsql:// URLs
    if (!url.startsWith('libsql://')) {
      console.warn('[Prisma] Not a libsql URL, using standard client')
      return null
    }
    
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { createClient } = require('@libsql/client')
    return createClient({ url, authToken })
  } catch (error) {
    console.error('[Prisma] Failed to create libsql client:', error)
    return null
  }
}

const maybeAdapter = (libsql: any) => {
  try {
    if (!libsql) return null
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { PrismaLibSQL } = require('@prisma/adapter-libsql')
    return new PrismaLibSQL(libsql)
  } catch (error) {
    console.error('[Prisma] Failed to create adapter:', error)
    return null
  }
}

const g = globalThis as unknown as { __prisma?: PrismaClient }

if (!g.__prisma) {
  const libsql = maybeCreateClient()
  const adapter = maybeAdapter(libsql)
  
  const clientConfig: any = {
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['error', 'warn'],
  }
  
  // Only add adapter if it was successfully created
  if (adapter) {
    clientConfig.adapter = adapter
  }
  
  g.__prisma = new PrismaClient(clientConfig)
}

export const prisma = g.__prisma!
export { prisma as db }
