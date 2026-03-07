import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const missingHeroRoleEn = await prisma.careerJob.count({
        where: { OR: [{ heroRoleEn: '' }, { heroRoleEn: null }] }
    });
    const missingSuperPowerEn = await prisma.careerJob.count({
        where: { OR: [{ superPowerEn: '' }, { superPowerEn: null }] }
    });

    console.log(`Missing heroRoleEn: ${missingHeroRoleEn}`);
    console.log(`Missing superPowerEn: ${missingSuperPowerEn}`);
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
