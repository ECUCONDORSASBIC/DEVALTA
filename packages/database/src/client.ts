import { PrismaClient } from '@prisma/client'

// Singleton para evitar múltiples instancias de Prisma en desarrollo
// Modo ESM

// @ts-ignore
// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma: PrismaClient =
  globalForPrisma.prisma || new PrismaClient({ log: ['error', 'warn'] })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma