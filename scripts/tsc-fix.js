const fs = require('fs');

function replaceFile(path, rules) {
    if (!fs.existsSync(path)) return;
    let content = fs.readFileSync(path, 'utf8');
    for (const [search, replace] of rules) {
        content = content.replace(search, replace);
    }
    fs.writeFileSync(path, content);
    console.log(`Fixed ${path}`);
}

replaceFile('prisma/career-seed.ts', [
    [/(import\s+\{[\s\S]*?SignalSource[\s\S]*?\})\s+from\s+['"]@prisma\/client['"];?/, 'const { PrismaClient } = require("@prisma/client");']
]);

// For seeds we actually might just remove the enums entirely or hardcode strings for seeding since they are strings now!
let seedContent = fs.readFileSync('prisma/seed.ts', 'utf8');
seedContent = seedContent.replace(/(import\s+\{[\s\S]*?Language[\s\S]*?\})\s+from\s+['"]@prisma\/client['"];?/, 'import { PrismaClient } from "@prisma/client";');
fs.writeFileSync('prisma/seed.ts', seedContent);


replaceFile('src/app/api/auth/register/route.ts', [
    [/import\s+bcrypt\s+from\s+['"]bcryptjs['"];?/g, 'import { hash } from "bcrypt-ts";'],
    [/await\s+bcrypt\.hash/g, 'await hash']
]);

replaceFile('src/app/api/auth/test-credentials/route.ts', [
    [/import\s+bcrypt\s+from\s+['"]bcryptjs['"];?/g, 'import { hash, compare } from "bcrypt-ts";'],
    [/await\s+bcrypt\.hash/g, 'await hash'],
    [/await\s+bcrypt\.compare/g, 'await compare']
]);

replaceFile('src/app/api/career/jobs/[id]/route.ts', [
    [/import\s+\{\s*authOptions\s*,\s*isUserPremium\s*\}\s+from\s+['"]@\/lib\/auth['"]/g, 'import { isUserPremium } from "@/lib/auth"'],
    [/import\s+\{\s*isUserPremium\s*,\s*authOptions\s*\}\s+from\s+['"]@\/lib\/auth['"]/g, 'import { isUserPremium } from "@/lib/auth"']
]);

replaceFile('src/app/api/career/report/route.ts', [
    [/import\s+\{\s*authOptions\s*,\s*isUserPremium\s*\}\s+from\s+['"]@\/lib\/auth['"]/g, 'import { isUserPremium } from "@/lib/auth"'],
    [/import\s+\{\s*isUserPremium\s*,\s*authOptions\s*\}\s+from\s+['"]@\/lib\/auth['"]/g, 'import { isUserPremium } from "@/lib/auth"']
]);

replaceFile('src/app/api/career/onboarding/route.ts', [
    [/import\s+\{\s*EducationLevel\s*\}\s+from\s+['"]@prisma\/client['"]/g, 'import { EducationLevel } from "@/types"']
]);
