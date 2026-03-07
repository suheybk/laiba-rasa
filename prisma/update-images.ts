// eslint-disable-next-line @typescript-eslint/no-require-imports
const dotenv = require('dotenv');
dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local' });

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Updates all career categories with the correct image paths
 * based on uploaded images in public/images/career/
 */
async function updateCategoryImages() {
    console.log('🖼️  Updating category image paths...');

    const imageMap: Record<string, { worldImage: string; heroImage: string }> = {
        ai: {
            worldImage: '/images/career/worlds/zeka-kalesi.png',
            heroImage: '/images/career/heroes/kod-buyucusu.png',
        },
        metaverse: {
            worldImage: '/images/career/worlds/dijital-medine.png',
            heroImage: '/images/career/heroes/dijital-diyar-kurucusu.png',
        },
        data: {
            worldImage: '/images/career/worlds/veri-kalesi.png',
            heroImage: '/images/career/heroes/veri-kasifi.png',
        },
        cyber: {
            worldImage: '/images/career/worlds/sifre-burcu.png',
            heroImage: '/images/career/heroes/siber-kalkan.png',
        },
        robotics: {
            worldImage: '/images/career/worlds/mekanik-vadi.png',
            heroImage: '/images/career/heroes/makine-ustasi.png',
        },
        health: {
            worldImage: '/images/career/worlds/sifa-bahcesi.png',
            heroImage: '/images/career/heroes/sifa-bilgini.png',
        },
        environment: {
            worldImage: '/images/career/worlds/yesil-kule.png',
            heroImage: '/images/career/heroes/yesil-muhafiz.png',
        },
        law: {
            worldImage: '/images/career/worlds/adalet-sarayi.png',
            heroImage: '/images/career/heroes/adalet-bekcisi.png',
        },
        marketing: {
            worldImage: '/images/career/worlds/ses-kalesi.png',
            heroImage: '/images/career/heroes/ses-efsanesi.png',
        },
        education: {
            worldImage: '/images/career/worlds/bilgi-tapinagi.png',
            heroImage: '/images/career/heroes/bilge-mentor.png',
        },
        design: {
            worldImage: '/images/career/worlds/sanat-atolyesi.png',
            heroImage: '/images/career/heroes/sanat-ustasi.png',
        },
        finance: {
            worldImage: '/images/career/worlds/altin-kasa.png',
            heroImage: '/images/career/heroes/altin-stratejist.png',
        },
        psychology: {
            worldImage: '/images/career/worlds/zihin-bahcesi.png',
            heroImage: '/images/career/heroes/zihin-okuyucu.png',
        },
        gaming: {
            worldImage: '/images/career/worlds/arena-stadyumu.png',
            heroImage: '/images/career/heroes/arena-efsanesi.png',
        },
        science: {
            worldImage: '/images/career/worlds/yildiz-gozlemevi.png',
            heroImage: '/images/career/heroes/yildiz-kasifi.png',
        },
        cross: {
            worldImage: '/images/career/worlds/zeka-kalesi.png', // shares with AI
            heroImage: '/images/career/heroes/kod-buyucusu.png',
        },
    };

    for (const [slug, images] of Object.entries(imageMap)) {
        await prisma.careerCategory.update({
            where: { slug },
            data: {
                worldImage: images.worldImage,
                heroImage: images.heroImage,
            },
        });
        console.log(`  ✓ ${slug}: ${images.worldImage}`);
    }

    console.log('✅ All category images updated!');
}

updateCategoryImages()
    .catch((e) => {
        console.error('❌ Failed:', e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
