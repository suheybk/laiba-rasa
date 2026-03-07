import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export const runtime = "edge";



// GET /api/career/jobs — List jobs with filtering
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const categoryId = searchParams.get("category_id");
        const categorySlug = searchParams.get("category");
        const status = searchParams.get("status");
        const search = searchParams.get("search");
        const page = parseInt(searchParams.get("page") || "1");
        const pageSize = parseInt(searchParams.get("pageSize") || "50");
        const skip = (page - 1) * pageSize;

        // Build where clause
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: any = {};
        if (categoryId) where.categoryId = categoryId;
        if (categorySlug) where.category = { slug: categorySlug };
        if (status) where.realizationStatus = status;
        if (search) {
            where.OR = [
                { nameTr: { contains: search, mode: "insensitive" } },
                { nameEn: { contains: search, mode: "insensitive" } },
            ];
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const prismaClient = prisma as any;

        const [jobs, total] = await Promise.all([
            prismaClient.careerJob.findMany({
                where,
                orderBy: { sortOrder: "asc" },
                skip,
                take: pageSize,
                select: {
                    id: true,
                    nameTr: true,
                    nameEn: true,
                    yearPredicted: true,
                    realizationStatus: true,
                    category: {
                        select: { slug: true, nameTr: true, nameEn: true, icon: true, colorHex: true },
                    },
                },
            }),
            prismaClient.careerJob.count({ where }),
        ]);

        return NextResponse.json({
            success: true,
            data: {
                items: jobs,
                total,
                page,
                pageSize,
                hasMore: skip + pageSize < total,
            },
        });
    } catch (error) {
        console.error("Career jobs error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch jobs" },
            { status: 500 }
        );
    }
}
