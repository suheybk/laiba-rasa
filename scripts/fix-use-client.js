const fs = require('fs');
const path = require('path');

const staticRoutes = [
    'src/app/[locale]/page.tsx',
    'src/app/[locale]/contact/page.tsx',
    'src/app/[locale]/privacy/page.tsx',
    'src/app/[locale]/terms/page.tsx',
    'src/app/[locale]/auth/login/page.tsx',
    'src/app/[locale]/auth/register/page.tsx',
    'src/app/[locale]/auth/forgot-password/page.tsx',
    'src/app/[locale]/onboarding/page.tsx',
];

staticRoutes.forEach(relPath => {
    const filePath = path.join(__dirname, '..', relPath);
    if (!fs.existsSync(filePath)) return;

    let content = fs.readFileSync(filePath, 'utf8');

    // Remove incorrectly placed dynamicParams
    content = content.replace(/^export const dynamicParams = false;\n?/gm, '');

    // Re-inject safely below "use client" if it exists
    if (content.match(/^["']use client["'];?\s*\n/m)) {
        content = content.replace(/(^["']use client["'];?\s*\n)/m, '$1\nexport const dynamicParams = false;\n');
    } else {
        content = `export const dynamicParams = false;\n` + content;
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed directive ordering in ${filePath}`);
});
