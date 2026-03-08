const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 1. Always run prisma generate — the Prisma client must be generated at build time
try {
  console.log('Running `npx prisma generate`...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('prisma generate finished successfully');
} catch (err) {
  console.warn('prisma generate warning:', err && err.message);
}

// 2. Patch @noble/ciphers to ensure ./utils export exists
// This fixes ERR_PACKAGE_PATH_NOT_EXPORTED on Node 22+ in Cloudflare Pages
try {
  const noblePkgPath = path.join(__dirname, '..', 'node_modules', '@noble', 'ciphers', 'package.json');
  if (fs.existsSync(noblePkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(noblePkgPath, 'utf8'));
    let patched = false;
    if (pkg.exports && !pkg.exports['./utils']) {
      pkg.exports['./utils'] = {
        types: './utils.d.ts',
        import: './utils.js',
        default: './utils.js'
      };
      patched = true;
    }
    if (patched) {
      fs.writeFileSync(noblePkgPath, JSON.stringify(pkg, null, 2), 'utf8');
      console.log('Patched @noble/ciphers package.json: added ./utils export');
    } else {
      console.log('@noble/ciphers already has ./utils export — no patch needed');
    }
  }
} catch (err) {
  console.warn('noble ciphers patch warning:', err && err.message);
}