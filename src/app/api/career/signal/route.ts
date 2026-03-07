import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import prisma from "@/lib/db";

// POST /api/career/signal — Record a career signal from gameplay
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { categoryId, sourceType, weight, signalData, sessionId } = body;

        if (!categoryId || !sourceType) {
            return NextResponse.json(
                { success: false, error: "categoryId and sourceType required" },
                { status: 400 }
            );
        }

        // Validate category exists
        const category = await prisma.careerCategory.findUnique({ where: { id: categoryId } });
        if (!category) {
            // Try by slug
            const catBySlug = await prisma.careerCategory.findUnique({ where: { slug: categoryId } });
            if (!catBySlug) {
                return NextResponse.json({ success: false, error: "Category not found" }, { status: 404 });
            }
            body.categoryId = catBySlug.id;
        }

        // Rate limiting: max 50 signals per hour per user
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const recentCount = await prisma.careerSignal.count({
            where: { userId: session.user.id, createdAt: { gte: oneHourAgo } },
        });
        if (recentCount >= 50) {
            return NextResponse.json(
                { success: false, error: "Rate limit: too many signals" },
                { status: 429 }
            );
        }

        // Create signal
        const signal = await prisma.careerSignal.create({
            data: {
                userId: session.user.id,
                categoryId: body.categoryId,
                sourceType,
                weight: weight || 1.0,
                signalData: signalData || null,
                sessionId: sessionId || null,
            },
        });

        return NextResponse.json({ success: true, data: signal });
    } catch (error) {
        console.error("Career signal error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to record signal" },
            { status: 500 }
        );
    }
}
