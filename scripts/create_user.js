const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

(async () => {
  const prisma = new PrismaClient();
  try {
    const email = `neon-auto-${Date.now()}@example.com`;
    const username = `neon_auto_${Date.now() % 10000}`;
    const password = await bcrypt.hash('Password1', 12);
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password,
        language: 'TR',
        displayName: username,
      },
    });
    console.log('Created user:', user);
  } catch (e) {
    console.error('Create user error:', e.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();