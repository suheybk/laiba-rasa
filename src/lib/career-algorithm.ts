/**
 * LAIBA Career Profile Algorithm
 * Bayesian-style weighted signal aggregation for career profiling
 * 
 * Weights:
 * - Onboarding selections: 30%
 * - Dungeon gameplay: 25%  
 * - Game performance: 25%
 * - Content preferences: 20%
 */

import prisma from "@/lib/db";

const SOURCE_WEIGHTS: Record<string, number> = {
    ONBOARDING: 0.30,
    DUNGEON: 0.25,
    ARENA: 0.25,
    RAID: 0.25,
    PREFERENCE: 0.20,
    BUILDER: 0.20,
};

// Time decay: signals older than 30 days get reduced weight
const DECAY_DAYS = 30;

function timeDecay(createdAt: Date): number {
    const ageDays = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
    if (ageDays <= 7) return 1.0;
    if (ageDays <= DECAY_DAYS) return 0.85;
    return Math.max(0.5, 1.0 - (ageDays / 180));
}

// Anti-spam: detect repetitive patterns
function detectSpam(signals: Array<{ categoryId: string; createdAt: Date }>): boolean {
    if (signals.length < 5) return false;
    const recent = signals.slice(-10);
    const uniqueCats = new Set(recent.map((s) => s.categoryId));
    // If last 10 signals are all the same category, likely spam
    return uniqueCats.size === 1;
}

export async function updateCareerProfile(userId: string): Promise<void> {
    // Fetch all signals for user
    const signals = await prisma.careerSignal.findMany({
        where: { userId },
        orderBy: { createdAt: "asc" },
        include: { category: true },
    });

    if (signals.length === 0) return;

    // Check for spam patterns
    const isSpam = detectSpam(signals);

    // Calculate weighted scores per category
    const categoryScores: Record<string, number> = {};

    for (const signal of signals) {
        const sourceWeight = SOURCE_WEIGHTS[signal.sourceType] || 0.2;
        const decay = timeDecay(signal.createdAt);
        const spamPenalty = isSpam ? 0.5 : 1.0;
        const effectiveWeight = signal.weight * sourceWeight * decay * spamPenalty;

        const catId = signal.categoryId;
        categoryScores[catId] = (categoryScores[catId] || 0) + effectiveWeight;
    }

    // Normalize scores to sum to 100
    const total = Object.values(categoryScores).reduce((a, b) => a + b, 0);
    const normalized: Record<string, number> = {};
    if (total > 0) {
        for (const [catId, score] of Object.entries(categoryScores)) {
            normalized[catId] = Math.round((score / total) * 100 * 10) / 10; // 1 decimal
        }
    }

    // Sort categories by score
    const sorted = Object.entries(normalized).sort(([, a], [, b]) => b - a);
    const primaryCategoryId = sorted[0]?.[0] || null;
    const secondaryCategoryIds = sorted.slice(1, 3).map(([id]) => id);

    // Get top 5 jobs from top 3 categories
    const topCatIds = [primaryCategoryId, ...secondaryCategoryIds].filter(Boolean) as string[];
    const topJobs = topCatIds.length > 0
        ? await prisma.careerJob.findMany({
            where: { categoryId: { in: topCatIds } },
            take: 5,
            orderBy: { sortOrder: "asc" },
        })
        : [];

    // Determine hero type
    const primaryCat = primaryCategoryId
        ? await prisma.careerCategory.findUnique({ where: { id: primaryCategoryId } })
        : null;

    // Confidence score: based on number of sessions/signals
    const sessionCount = new Set(signals.map((s) => s.sessionId).filter(Boolean)).size + 1;
    const confidence = Math.min(1.0, Math.round((sessionCount / 10) * 100) / 100);

    // Upsert profile
    await prisma.careerProfile.upsert({
        where: { userId },
        update: {
            primaryCategoryId,
            secondaryCategoryIds,
            topJobs: topJobs.map((j) => ({ jobId: j.id, score: normalized[j.categoryId] || 0 })),
            categoryScores: normalized,
            confidenceScore: confidence,
            dataSessionsCount: sessionCount,
            heroType: primaryCat?.heroNameTr || "",
            version: { increment: 1 },
            lastUpdated: new Date(),
        },
        create: {
            userId,
            primaryCategoryId,
            secondaryCategoryIds,
            topJobs: topJobs.map((j) => ({ jobId: j.id, score: normalized[j.categoryId] || 0 })),
            categoryScores: normalized,
            confidenceScore: confidence,
            dataSessionsCount: sessionCount,
            heroType: primaryCat?.heroNameTr || "",
            version: 1,
        },
    });
}

export async function getCareerReport(userId: string) {
    const profile = await prisma.careerProfile.findUnique({ where: { userId } });
    if (!profile) return null;

    const categories = await prisma.careerCategory.findMany({ orderBy: { sortOrder: "asc" } });
    const scores = (profile.categoryScores as Record<string, number>) || {};

    // Build radar data
    const radarData = categories.map((cat) => ({
        category: cat.nameTr,
        categoryEn: cat.nameEn,
        slug: cat.slug,
        score: scores[cat.id] || 0,
        color: cat.colorHex,
        icon: cat.icon,
    }));

    // Get primary category details
    const primaryCategory = profile.primaryCategoryId
        ? categories.find((c) => c.id === profile.primaryCategoryId)
        : null;

    // Get top jobs with details
    const topJobEntries = (profile.topJobs as Array<{ jobId: string; score: number }>) || [];
    const jobIds = topJobEntries.map((j) => j.jobId);
    const jobs = jobIds.length > 0
        ? await prisma.careerJob.findMany({
            where: { id: { in: jobIds } },
            include: { category: true },
        })
        : [];

    return {
        heroType: profile.heroType,
        primaryCategory,
        radarData,
        topJobs: topJobEntries.map((entry) => ({
            ...jobs.find((j) => j.id === entry.jobId),
            matchScore: entry.score,
        })),
        confidenceScore: profile.confidenceScore,
        dataSessionsCount: profile.dataSessionsCount,
        version: profile.version,
    };
}
