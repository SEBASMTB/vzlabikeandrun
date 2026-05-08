import { PrismaClient } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  // Support both DATABASE_URL and TURSO_DATABASE_URL
  const dbUrl = process.env.DATABASE_URL || process.env.TURSO_DATABASE_URL || ''
  const dbToken = process.env.TURSO_AUTH_TOKEN || ''

  if (dbUrl.startsWith('libsql://')) {
    // Remote Turso database - use LibSQL adapter
    const adapter = new PrismaLibSQL({
      url: dbUrl,
      authToken: dbToken || undefined,
    })
    return new PrismaClient({ adapter })
  }

  if (dbUrl.startsWith('file:')) {
    // Local SQLite database - use LibSQL adapter with file URL
    const adapter = new PrismaLibSQL({ url: dbUrl })
    return new PrismaClient({ adapter })
  }

  // Fallback: direct PrismaClient (local dev)
  return new PrismaClient()
}

export const db =
  globalForPrisma.prisma ??
  createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
