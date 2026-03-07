// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import prisma from "@/lib/db";
import { Prisma } from "@prisma/client";

// POST /api/career/onboarding/start — Start career onboarding
export async function POST() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        // Check if already completed
        const user = await prisma.user.findUnique({ where: { id: session.user.id } });
        if (user?.onboardingCareerDone) {
            return NextResponse.json({
                success: false,
                error: "Career onboarding already completed. Use profile reset to restart.",
            }, { status: 400 });
        }

        // Create or reset onboarding state
        const state = await prisma.onboardingCareerState.upsert({
            where: { userId: session.user.id },
            update: { currentScene: 1, selections: {}, completedAt: null },
            create: { userId: session.user.id, currentScene: 1, selections: {} },
        });

        // Get scene 1 content: categories for world selection
        const categories = await prisma.careerCategory.findMany({
            where: { slug: { not: "cross" } }, // Exclude cross-disciplinary from selection
            orderBy: { sortOrder: "asc" },
            select: {
                id: true, slug: true, nameTr: true, nameEn: true,
                icon: true, colorHex: true, worldNameTr: true, worldNameEn: true, worldImage: true,
            },
        });

        return NextResponse.json({
            success: true,
            data: {
                sessionId: state.id,
                currentScene: 1,
                totalScenes: 6,
                sceneContent: {
                    title: "Hangi dünyanın kahramanı olmak istiyorsun?",
                    titleEn: "Which world's hero do you want to be?",
                    instruction: "3 dünya seç",
                    maxSelections: 3,
                    options: categories,
                },
            },
        });
    } catch (error: any) {
        console.error("Career onboarding start error:", error);
        return NextResponse.json({ success: false, error: "Failed to start onboarding" }, { status: 500 });
    }
}

// PUT /api/career/onboarding/start — Submit scene selection and get next scene
export async function PUT(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { sceneId, selections } = body;

        const state = await prisma.onboardingCareerState.findUnique({
            where: { userId: session.user.id },
        });

        if (!state) {
            return NextResponse.json({ success: false, error: "No onboarding in progress" }, { status: 400 });
        }

        // Save selection for current scene
        const currentSelections = (state.selections as Record<string, unknown>) || {};
        currentSelections[`scene_${sceneId || state.currentScene}`] = selections;

        // Record career signals from selection
        if (selections?.categoryIds && Array.isArray(selections.categoryIds)) {
            for (const catId of selections.categoryIds) {
                await prisma.careerSignal.create({
                    data: {
                        userId: session.user.id,
                        categoryId: catId,
                        sourceType: "ONBOARDING",
                        weight: 3.0, // Onboarding selections carry high weight
                        signalData: { scene: sceneId || state.currentScene, type: "world_selection" },
                    },
                });
            }
        }

        if (selections?.categorySlug) {
            const cat = await prisma.careerCategory.findUnique({ where: { slug: selections.categorySlug } });
            if (cat) {
                await prisma.careerSignal.create({
                    data: {
                        userId: session.user.id,
                        categoryId: cat.id,
                        sourceType: "ONBOARDING",
                        weight: 2.0,
                        signalData: { scene: sceneId || state.currentScene, type: "value_choice" },
                    },
                });
            }
        }

        const nextScene = state.currentScene + 1;

        // Update state
        await prisma.onboardingCareerState.update({
            where: { userId: session.user.id },
            data: {
                currentScene: Math.min(nextScene, 6),
                selections: currentSelections as Prisma.InputJsonValue,
                ...(nextScene > 6 ? { completedAt: new Date() } : {}),
            },
        });

        // If completed (after scene 6), generate initial profile
        if (nextScene > 6) {
            // Calculate initial profile from signals
            const signals = await prisma.careerSignal.findMany({
                where: { userId: session.user.id },
                include: { category: true },
            });

            // Aggregate scores by category
            const categoryScores: Record<string, number> = {};
            for (const signal of signals) {
                const catId = signal.categoryId;
                categoryScores[catId] = (categoryScores[catId] || 0) + signal.weight;
            }

            // Normalize to 100
            const total = Object.values(categoryScores).reduce((a, b) => a + b, 0);
            if (total > 0) {
                for (const catId of Object.keys(categoryScores)) {
                    categoryScores[catId] = Math.round((categoryScores[catId] / total) * 100);
                }
            }

            // Sort and pick top categories
            const sorted = Object.entries(categoryScores).sort(([, a], [, b]) => b - a);
            const primaryCategoryId = sorted[0]?.[0] || null;
            const secondaryCategoryIds = sorted.slice(1, 3).map(([id]) => id);

            // Get top jobs from top 3 categories
            const topCatIds = [primaryCategoryId, ...secondaryCategoryIds].filter(Boolean) as string[];
            const topJobs = await prisma.careerJob.findMany({
                where: { categoryId: { in: topCatIds } },
                take: 5,
                orderBy: { sortOrder: "asc" },
            });

            // Determine hero type from primary category
            const primaryCat = primaryCategoryId
                ? await prisma.careerCategory.findUnique({ where: { id: primaryCategoryId } })
                : null;

            const profile = await prisma.careerProfile.upsert({
                where: { userId: session.user.id },
                update: {
                    primaryCategoryId,
                    secondaryCategoryIds,
                    topJobs: topJobs.map((j) => ({ jobId: j.id, score: categoryScores[j.categoryId] || 0 })),
                    categoryScores,
                    confidenceScore: 0.3, // Low confidence after just onboarding
                    dataSessionsCount: 1,
                    heroType: primaryCat?.heroNameTr || "",
                    version: 1,
                    lastUpdated: new Date(),
                },
                create: {
                    userId: session.user.id,
                    primaryCategoryId,
                    secondaryCategoryIds,
                    topJobs: topJobs.map((j) => ({ jobId: j.id, score: categoryScores[j.categoryId] || 0 })),
                    categoryScores,
                    confidenceScore: 0.3,
                    dataSessionsCount: 1,
                    heroType: primaryCat?.heroNameTr || "",
                    version: 1,
                },
            });

            await prisma.user.update({
                where: { id: session.user.id },
                data: { onboardingCareerDone: true },
            });

            return NextResponse.json({
                success: true,
                data: {
                    completed: true,
                    profile,
                    primaryCategory: primaryCat,
                    topCategories: sorted.slice(0, 3).map(([id, score]) => ({ id, score })),
                },
            });
        }

        // Return next scene content
        const sceneContent = await getSceneContent(nextScene, session.user.id);

        return NextResponse.json({
            success: true,
            data: {
                currentScene: nextScene,
                totalScenes: 6,
                sceneContent,
            },
        });
    } catch (error: any) {
        console.error("Career onboarding signal error:", error);
        return NextResponse.json({ success: false, error: "Failed to process selection" }, { status: 500 });
    }
}

// Helper: Get content for each scene
async function getSceneContent(scene: number, userId: string) {
    switch (scene) {
        case 2:
            return {
                title: "Sen kimsin?",
                titleEn: "Who are you?",
                type: "level_select",
                options: [
                    { key: "PRIMARY", label: "İlkokul (1-4)", labelEn: "Primary (1-4)" },
                    { key: "MIDDLE", label: "Ortaokul (5-8)", labelEn: "Middle (5-8)" },
                    { key: "HIGH", label: "Lise (9-12)", labelEn: "High School (9-12)" },
                    { key: "UNIVERSITY", label: "Üniversite", labelEn: "University" },
                    { key: "ADULT", label: "Yetişkin", labelEn: "Adult" },
                ],
            };

        case 3:
        case 4: {
            // Get user's education level from their scene 2 selection
            const state = await prisma.onboardingCareerState.findUnique({ where: { userId } });
            const sels = (state?.selections as Record<string, unknown>) || {};
            const levelSel = sels.scene_2 as { level?: string } | undefined;
            const level = levelSel?.level || "PRIMARY";

            const questions = await prisma.careerDiscoveryQuestion.findMany({
                where: { educationLevel: level as EducationLevel },
                orderBy: { sortOrder: "asc" },
                take: scene === 3 ? 5 : 3,
                skip: scene === 3 ? 0 : 5,
            });

            return {
                title: scene === 3 ? "İlk Görev" : "Kapasite Bölümü",
                titleEn: scene === 3 ? "First Quest" : "Capacity Zone",
                type: "dungeon_questions",
                questions: questions.map((q) => ({
                    id: q.id,
                    text: q.questionTr,
                    textEn: q.questionEn || q.questionTr,
                    suggestedJobs: q.suggestedJobs,
                    categoryTag: q.categoryTag,
                })),
            };
        }

        case 5:
            return {
                title: "Kahraman olarak sana en önemli şey nedir?",
                titleEn: "What matters most to you as a hero?",
                type: "value_choice",
                options: [
                    { key: "justice", label: "Adalet", labelEn: "Justice", categorySlugs: ["law"] },
                    { key: "discovery", label: "Keşif", labelEn: "Discovery", categorySlugs: ["science", "data"] },
                    { key: "build", label: "İnşa Etmek", labelEn: "Building", categorySlugs: ["design", "metaverse"] },
                    { key: "protect", label: "Korumak", labelEn: "Protecting", categorySlugs: ["cyber", "environment"] },
                    { key: "tell", label: "Anlatmak", labelEn: "Storytelling", categorySlugs: ["marketing", "education"] },
                ],
            };

        case 6:
            return {
                title: "Kahraman Profilin Hazır!",
                titleEn: "Your Hero Profile is Ready!",
                type: "first_report",
            };

        default:
            return { title: "Unknown scene", type: "unknown" };
    }
}

// Need this import for the helper to work
import { EducationLevel } from "@/types";

export const runtime = "edge";


