const { PrismaClient } = require('@prisma/client');

(async () => {
  const prisma = new PrismaClient();
  try {
    const users = await prisma.user.findMany({ take: 3 });
    console.log('Sample users:', users);
    const counts = await prisma.$queryRaw`SELECT COUNT(*)::int as cnt FROM "User"`;
    console.log('User count (raw):', counts[0]?.cnt ?? 0);
  } catch (e) {
    console.error('DB check error:', e.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();