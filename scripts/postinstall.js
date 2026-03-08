const { execSync } = require('child_process');

// Always run prisma generate — the Prisma client must be generated at build time
// even when DATABASE_URL is not set (Cloudflare D1 uses runtime bindings).
try {
  console.log('Running `npx prisma generate`...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('prisma generate finished successfully');
} catch (err) {
  console.warn('prisma generate warning:', err && err.message);
  // Don't throw — allow the build to continue even if generate fails
  // (e.g., during CI where prisma is not yet installed)
}