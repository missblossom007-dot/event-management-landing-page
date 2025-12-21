const { PrismaClient } = require('@prisma/client');

const globalForPrisma = globalThis;

const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Test database connection
async function testConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Connected to database via Prisma');
    return true;
  } catch (error) {
    console.log('⚠️  Database not available:', error.message);
    console.log('   Using SQLite fallback or localStorage mode');
    return false;
  }
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

module.exports = { prisma, testConnection };