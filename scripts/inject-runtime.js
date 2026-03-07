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

        // Check if edge runtime is already exported
        if (!content.includes('export const runtime = "edge"') && !content.includes("export const runtime = 'edge'")) {
            // Find a good place to insert it (after imports)
            const lines = content.split('\n');
            let insertIndex = 0;

            for (let i = 0; i < lines.length; i++) {
                if (lines[i].startsWith('import ')) {
                    insertIndex = i + 1;
                }
            }

            lines.splice(insertIndex, 0, '\nexport const runtime = "edge";\n');
            fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
            console.log(`Added edge runtime to ${filePath}`);
        }
    } else {
        console.log(`File not found: ${filePath}`);
    }
});
