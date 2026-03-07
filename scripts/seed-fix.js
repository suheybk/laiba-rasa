const fs = require('fs');
const enums = ['Language', 'SubscriptionTier', 'SubscriptionPeriod', 'SubscriptionStatus', 'Visibility', 'ReviewStatus', 'RelationshipType', 'BloomLevel', 'CardType', 'GameMode', 'RealizationStatus', 'EducationLevel', 'SignalSource', 'Role', 'KycStatus'];

function fixEnums(path) {
    if (!fs.existsSync(path)) return;
    let c = fs.readFileSync(path, 'utf8');
    for (const en of enums) {
        c = c.replace(new RegExp('\\b' + en + '\\.([A-Z_]+)\\b', 'g'), '"$1"');
    }
    // Remove isolated PrismaClient enum imports
    c = c.replace(/import\s+\{\s*PrismaClient[\s\S]*?\}\s+from\s+['"]@prisma\/client['"];?/, 'import { PrismaClient } from "@prisma/client";');
    fs.writeFileSync(path, c);
    console.log(`Fixed seeds in ${path}`);
}

fixEnums('prisma/career-seed.ts');
fixEnums('prisma/seed.ts');
