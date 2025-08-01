import { PrismaClient } from '@prisma/client'

// Declaración global para desarrollo en TypeScript
declare global {
  var prisma: PrismaClient | undefined
}

// Evitar múltiples instancias en desarrollo
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['query', 'error', 'warn'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://localhost:5432/altamedica?schema=public'
    }
  }
})

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Conexión inicial
prisma.$connect().catch((error) => {
  console.error('Error conectando a la base de datos:', error)
})

// Manejo de cierre graceful
process.on('beforeExit', async () => {
  await prisma.$disconnect()
})

export default prisma
