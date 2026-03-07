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

    if (content.includes('"use client"') || content.includes("'use client'")) {
        // Remove the import
        content = content.replace(/import\s*{\s*([^,]+,\s*)?setRequestLocale(,\s*[^}]+)?\s*}\s*from\s+['"]next-intl\/server['"];\n?/g, (match, p1, p2) => {
            if (p1 || p2) {
                // If there are other imports, keep them
                return `import { ${p1 ? p1 : ''}${p2 ? p2.replace(/^,\s*/, '') : ''} } from 'next-intl/server';\n`;
            }
            return '';
        });

        // Next-intl/server remaining empty import fix
        content = content.replace(/import\s*{\s*}\s*from\s+['"]next-intl\/server['"];\n?/g, '');
        content = content.replace(/import\s*{\s*setRequestLocale\s*}\s*from\s+['"]next-intl\/server['"];\n?/g, '');

        // Remove the function call
        content = content.replace(/\s*setRequestLocale\(locale\);\s*/g, '');

        // Revert async and params for client components
        content = content.replace(/export default async function ([A-Za-z0-9_]+)\(\{\s*params\s*}\s*:\s*\{\s*params:\s*Promise<\{\s*locale:\s*string\s*}\>\s*\}\)\s*{\n\s*const { locale } = await params;/g, 'export default function $1() {');

        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Cleaned 'use client' component: ${filePath}`);
    }
});
