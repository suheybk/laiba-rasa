const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const email = process.argv[2] || 'nextauth-test@example.com';
const password = process.argv[3] || 'Password1';

(async () => {
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return console.log('User not found');
    const ok = await bcrypt.compare(password, user.password || '');
    console.log('Authorize result:', ok, 'user id:', user.id);
    process.exit(ok ? 0 : 2);
  } catch (e) {
    console.error('Error:', e.message || e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();