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

    // Skip if already processed
    if (content.includes('setRequestLocale')) return;

    // Add import
    if (!content.includes('next-intl/server')) {
        content = `import { setRequestLocale } from 'next-intl/server';\n` + content;
    } else if (!content.includes('setRequestLocale')) {
        content = content.replace(/import\s+{([^}]*)}\s+from\s+['"]next-intl\/server['"];/, "import { $1, setRequestLocale } from 'next-intl/server';");
    }

    // Convert component to async and add params
    const componentMatch = content.match(/export default function ([A-Za-z0-9_]+)\(\)\s*{/);
    if (componentMatch) {
        const funcName = componentMatch[1];
        content = content.replace(
            /export default function [A-Za-z0-9_]+\(\)\s*{/,
            `export default async function ${funcName}({ params }: { params: Promise<{ locale: string }> }) {\n  const { locale } = await params;\n  setRequestLocale(locale);`
        );
    } else {
        // Try arrow function or existing params
        const paramMatch = content.match(/export default (?:async )?function ([A-Za-z0-9_]+)\(\{\s*params\s*}\s*:\s*\{\s*params:\s*Promise<\{\s*locale:\s*string\s*}\>\s*\}\)\s*{/);
        if (paramMatch) {
            content = content.replace(paramMatch[0], `${paramMatch[0]}\n  const { locale } = await params;\n  setRequestLocale(locale);`);
        }
    }

    // Find and update generateMetadata if exists
    const metaMatch = content.match(/export async function generateMetadata\(\{\s*params\s*}\s*:\s*\{\s*params:\s*Promise<\{\s*locale:\s*string\s*}\>\s*\}\)\s*{/);
    if (metaMatch && !content.includes('setRequestLocale(locale)', metaMatch.index)) {
        content = content.replace(metaMatch[0], `${metaMatch[0]}\n  const { locale } = await params;\n  setRequestLocale(locale);`);
    } else if (content.includes('export async function generateMetadata')) {
        console.warn(`Could not safely inject setRequestLocale in generateMetadata for ${filePath}. Check manually.`);
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Injected setRequestLocale into ${filePath}`);
});
