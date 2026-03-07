import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import prisma from "@/lib/db";

// GET /api/career/profile — Get current user's career profile
export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const profile = await prisma.careerProfile.findUnique({
            where: { userId: session.user.id },
        });

        if (!profile) {
            return NextResponse.json({
                success: true,
                data: null,
                message: "No career profile yet. Complete career onboarding to create one.",
            });
        }

        // Enrich with category data
        const primaryCategory = profile.primaryCategoryId
            ? await prisma.careerCategory.findUnique({ where: { id: profile.primaryCategoryId } })
            : null;

        const secondaryIds = (profile.secondaryCategoryIds as string[]) || [];
        const secondaryCategories = secondaryIds.length > 0
            ? await prisma.careerCategory.findMany({ where: { id: { in: secondaryIds } } })
            : [];

        // Get top jobs details
        const topJobEntries = (profile.topJobs as Array<{ jobId: string; score: number }>) || [];
        const jobIds = topJobEntries.map((j) => j.jobId);
        const jobs = jobIds.length > 0
            ? await prisma.careerJob.findMany({
                where: { id: { in: jobIds } },
                include: { category: true },
            })
            : [];

        const topJobs = topJobEntries.map((entry) => {
            const job = jobs.find((j) => j.id === entry.jobId);
            return { ...job, matchScore: entry.score };
        });

        return NextResponse.json({
            success: true,
            data: {
                ...profile,
                primaryCategory,
                secondaryCategories,
                topJobs,
            },
        });
    } catch (error) {
        console.error("Career profile error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch career profile" },
            { status: 500 }
        );
    }
}

// PUT /api/career/profile — Reset career profile
export async function PUT(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();

        if (body.action === "reset") {
            // Delete existing profile and signals
            await prisma.careerProfile.deleteMany({ where: { userId: session.user.id } });
            await prisma.careerSignal.deleteMany({ where: { userId: session.user.id } });
            await prisma.onboardingCareerState.deleteMany({ where: { userId: session.user.id } });
            await prisma.user.update({
                where: { id: session.user.id },
                data: { onboardingCareerDone: false },
            });

            return NextResponse.json({ success: true, message: "Career profile reset" });
        }

        return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
    } catch (error) {
        console.error("Career profile reset error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to reset career profile" },
            { status: 500 }
        );
    }
}
