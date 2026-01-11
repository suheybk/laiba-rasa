const { execSync } = require('child_process');

// This script conditionally runs `prisma generate` only when DATABASE_URL is set.
// It prevents CI/build failures when the DB URL is not available (for local dev / preview builds).

const dbUrl = process.env.DATABASE_URL;
if (dbUrl) {
  console.log('DATABASE_URL found — running `npx prisma generate`');
  try {
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('prisma generate finished successfully');
  } catch (err) {
    console.error('prisma generate failed:', err && err.message);
    // Re-throw so CI/build fails if prisma generate is required and fails.
    throw err;
  }
} else {
  console.log('Skipping prisma generate because DATABASE_URL is not set');
}