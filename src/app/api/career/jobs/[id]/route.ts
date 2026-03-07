import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions, isUserPremium } from "@/lib/auth";

// GET /api/career/jobs/[id] — Get a single job with full details
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const job = await (prisma as any).careerJob.findUnique({
            where: { id },
            include: {
                category: {
                    select: {
                        id: true,
                        slug: true,
                        nameTr: true,
                        nameEn: true,
                        icon: true,
                        colorHex: true,
                        worldNameTr: true,
                        worldNameEn: true,
                        heroNameTr: true,
                        heroNameEn: true,
                        worldImage: true,
                        heroImage: true,
                        descriptionTr: true,
                        descriptionEn: true,
                    },
                },
            },
        });

        if (!job) {
            return NextResponse.json(
                { success: false, error: "Job not found" },
                { status: 404 }
            );
        }

        // Also get related jobs from same category (max 6)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const relatedJobs = await (prisma as any).careerJob.findMany({
            where: {
                categoryId: job.categoryId,
                id: { not: job.id },
            },
            take: 6,
            orderBy: { sortOrder: "asc" },
            select: {
                id: true,
                nameTr: true,
                nameEn: true,
                yearPredicted: true,
                realizationStatus: true,
                heroRoleTr: true,
            },
        });

        // Check if user is premium
        const session = await getServerSession(authOptions);
        const isPremium = session?.user?.id ? await isUserPremium(session.user.id) : false;

        return NextResponse.json({
            success: true,
            data: {
                ...job,
                relatedJobs,
                isPremium,
            },
        });
    } catch (error) {
        console.error("Career job detail error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch job" },
            { status: 500 }
        );
    }
}
