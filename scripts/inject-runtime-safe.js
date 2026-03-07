const fs = require('fs');
const path = require('path');

const targetRoutes = [
    'src/app/[locale]/auth/forgot-password/page.tsx',
    'src/app/[locale]/auth/login/page.tsx',
    'src/app/[locale]/auth/register/page.tsx',
    'src/app/[locale]/career-onboarding/page.tsx',
    'src/app/[locale]/career-report/page.tsx',
    'src/app/[locale]/careers/[id]/page.tsx',
    'src/app/[locale]/careers/page.tsx',
    'src/app/[locale]/contact/page.tsx',
    'src/app/[locale]/dashboard/page.tsx',
    'src/app/[locale]/games/arena/page.tsx',
    'src/app/[locale]/games/dungeon/page.tsx',
    'src/app/[locale]/games/page.tsx',
    'src/app/[locale]/notes/[id]/page.tsx',
    'src/app/[locale]/notes/new/page.tsx',
    'src/app/[locale]/notes/page.tsx',
    'src/app/[locale]/onboarding/page.tsx',
    'src/app/[locale]/privacy/page.tsx',
    'src/app/[locale]/profile/page.tsx',
    'src/app/[locale]/settings/page.tsx',
    'src/app/[locale]/stats/page.tsx',
    'src/app/[locale]/teacher/page.tsx',
    'src/app/[locale]/terms/page.tsx',
    'src/app/[locale]/page.tsx',
    'src/middleware.ts',
    'src/app/api/ai/analyze/route.ts',
    'src/app/api/auth/register/route.ts',
    'src/app/api/auth/test-credentials/route.ts',
    'src/app/api/career/categories/route.ts',
    'src/app/api/career/jobs/[id]/route.ts',
    'src/app/api/career/jobs/route.ts',
    'src/app/api/career/onboarding/route.ts',
    'src/app/api/career/profile/route.ts',
    'src/app/api/career/questions/route.ts',
    'src/app/api/career/report/route.ts',
    'src/app/api/career/signal/route.ts',
    'src/app/api/dashboard/route.ts',
    'src/app/api/games/arena/start/route.ts',
    'src/app/api/games/complete/route.ts',
    'src/app/api/games/dungeon/start/route.ts',
    'src/app/api/leaderboard/route.ts',
    'src/app/api/notes/create/route.ts',
    'src/app/api/notes/route.ts',
    'src/app/api/profile/route.ts',
    'src/app/api/teacher/process-pdf/route.ts',
    'src/app/api/teacher/upload-pdf/route.ts',
    'src/app/api/user/update/route.ts'
];

targetRoutes.forEach(relPath => {
    const filePath = path.join(__dirname, '..', relPath);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');

        // Remove ANY previously badly placed exports
        content = content.replace(/\nexport const runtime = "edge";\n/g, '');
        content = content.replace(/export const runtime = "edge";\n/g, '');

        // Find the absolute last import statement
        const importRegex = /import\s+.*?(?:from\s+['"][^'"]+['"]|['"][^'"]+['"])[^;]*;?/gs;
        let match;
        let lastImportIndex = 0;

        while ((match = importRegex.exec(content)) !== null) {
            lastImportIndex = match.index + match[0].length;
        }

        // Insert exactly after the last import
        if (lastImportIndex > 0) {
            content = content.slice(0, lastImportIndex) + '\n\nexport const runtime = "edge";\n' + content.slice(lastImportIndex);
        } else {
            // If no imports, just put it at the very top (under ts-nocheck if present)
            if (content.startsWith('// @ts-nocheck')) {
                content = content.replace('// @ts-nocheck', '// @ts-nocheck\nexport const runtime = "edge";\n');
            } else {
                content = 'export const runtime = "edge";\n' + content;
            }
        }

        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Expertly injected edge runtime in ${filePath}`);
    }
});
