const fs = require('fs');

const files = [
    "src/app/api/user/update/route.ts",
    "src/app/api/teacher/upload-pdf/route.ts",
    "src/app/api/teacher/process-pdf/route.ts",
    "src/app/api/profile/route.ts",
    "src/app/api/notes/route.ts",
    "src/app/api/leaderboard/route.ts",
    "src/app/api/notes/create/route.ts",
    "src/app/api/games/dungeon/start/route.ts",
    "src/app/api/games/arena/start/route.ts",
    "src/app/api/career/signal/route.ts",
    "src/app/api/dashboard/route.ts",
    "src/app/api/career/profile/route.ts",
    "src/app/api/career/report/route.ts",
    "src/app/api/career/onboarding/route.ts",
    "src/app/api/games/complete/route.ts",
    "src/app/api/career/jobs/[id]/route.ts",
    "src/app/api/ai/analyze/route.ts"
];

for (const file of files) {
    if (!fs.existsSync(file)) continue;
    let content = fs.readFileSync(file, 'utf8');

    // Replace imports
    content = content.replace(/import\s+\{\s*getServerSession\s*\}\s+from\s+["']next-auth["'];?/g, 'import { auth } from "@/lib/auth";');
    content = content.replace(/import\s+\{\s*authOptions\s*\}\s+from\s+["']@\/lib\/auth["'];?\n?/g, '');

    // Replace function calls
    content = content.replace(/await\s+getServerSession\s*\(\s*authOptions\s*\)/g, 'await auth()');
    content = content.replace(/getServerSession\s*\(\s*authOptions\s*\)/g, 'auth()');

    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
}
