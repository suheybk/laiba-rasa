const fs = require('fs');
const path = require('path');

const faultyRoutes = [
    'src/app/[locale]/career-onboarding/page.tsx',
    'src/app/[locale]/careers/[id]/page.tsx',
    'src/app/[locale]/careers/page.tsx',
    'src/app/[locale]/dashboard/page.tsx',
    'src/app/[locale]/games/arena/page.tsx',
    'src/app/[locale]/games/dungeon/page.tsx',
    'src/app/[locale]/games/page.tsx',
    'src/app/[locale]/notes/[id]/page.tsx',
    'src/app/[locale]/notes/page.tsx',
    'src/app/[locale]/onboarding/page.tsx',
    'src/app/[locale]/page.tsx',
    'src/app/[locale]/profile/page.tsx',
    'src/app/[locale]/settings/page.tsx',
    'src/app/[locale]/stats/page.tsx',
    'src/app/[locale]/teacher/page.tsx',
    'src/app/api/games/complete/route.ts'
];

faultyRoutes.forEach(relPath => {
    const filePath = path.join(__dirname, '..', relPath);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');

        // Remove the improperly placed edge export
        content = content.replace(/\nexport const runtime = "edge";\n/g, '');
        content = content.replace(/export const runtime = "edge";\n/g, '');

        // Safely append to the very top (right after // @ts-nocheck if present, or absolute top)
        if (content.startsWith('// @ts-nocheck')) {
            content = content.replace('// @ts-nocheck', '// @ts-nocheck\nexport const runtime = "edge";\n');
        } else {
            content = 'export const runtime = "edge";\n' + content;
        }

        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Fixed edge runtime in ${filePath}`);
    }
});
