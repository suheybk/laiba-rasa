const fs = require('fs');
const path = require('path');

const filesToFix = [
    'src/app/[locale]/careers/page.tsx',
    'src/app/[locale]/dashboard/page.tsx',
    'src/app/[locale]/notes/new/page.tsx',
    'src/app/[locale]/teacher/page.tsx',
    'src/app/api/ai/analyze/route.ts',
    'src/app/api/auth/test-credentials/route.ts',
    'src/app/api/career/onboarding/route.ts',
    'src/app/api/career/profile/route.ts',
    'src/app/api/career/signal/route.ts',
    'src/app/api/games/dungeon/start/route.ts',
    'src/app/api/teacher/process-pdf/route.ts',
    'src/app/api/user/update/route.ts',
    'src/components/features/notes/pdf-upload.tsx'
];

filesToFix.forEach(relPath => {
    const filePath = path.join(__dirname, '..', relPath);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        let initialContent = content;

        // Fix catch (error) -> catch (error: any)
        content = content.replace(/catch\s*\(\s*error\s*\)/g, 'catch (error: any)');
        content = content.replace(/catch\s*\(\s*err\s*\)/g, 'catch (err: any)');

        // Replace setErrors(data.errors) where data is unknown
        content = content.replace(/setErrors\(data\.errors/g, 'setErrors((data as any).errors');
        content = content.replace(/setError\(data\.error/g, 'setError((data as any).error');

        // Replace data typing issues
        content = content.replace(/const data = await res\.json\(\);/g, 'const data = (await res.json()) as any;');
        content = content.replace(/const data = await response\.json\(\);/g, 'const data = (await response.json()) as any;');

        // Fix resData
        content = content.replace(/resData\.success/g, '(resData as any).success');
        content = content.replace(/resData\.noteId/g, '(resData as any).noteId');

        if (content !== initialContent) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Fixed TS in ${filePath}`);
        }
    }
});
