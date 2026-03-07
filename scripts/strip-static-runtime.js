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
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');

        // Remove the edge runtime export
        content = content.replace(/\nexport const runtime = "edge";\n/g, '\n');
        content = content.replace(/export const runtime = "edge";\n/g, '');
        content = content.replace(/export const runtime = 'edge';\n/g, '');

        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Removed edge runtime from mostly-static route: ${filePath}`);
    }
});
