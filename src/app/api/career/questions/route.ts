import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/career/questions — Get career discovery questions by education level
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const level = searchParams.get("level"); // PRIMARY, MIDDLE, HIGH
        const count = parseInt(searchParams.get("count") || "0");

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: any = {};
        if (level) where.educationLevel = level;

        const questions = await prisma.careerDiscoveryQuestion.findMany({
            where,
            orderBy: { sortOrder: "asc" },
            ...(count > 0 ? { take: count } : {}),
        });

        return NextResponse.json({ success: true, data: questions });
    } catch (error) {
        console.error("Career questions error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch questions" },
            { status: 500 }
        );
    }
}
