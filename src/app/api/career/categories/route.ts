import { NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/career/categories — List all career categories with job counts
export async function GET() {
    try {
        const categories = await prisma.careerCategory.findMany({
            orderBy: { sortOrder: "asc" },
            include: {
                _count: { select: { jobs: true } },
            },
        });

        const data = categories.map((cat) => ({
            id: cat.id,
            slug: cat.slug,
            nameTr: cat.nameTr,
            nameEn: cat.nameEn,
            nameAr: cat.nameAr,
            descriptionTr: cat.descriptionTr,
            icon: cat.icon,
            colorHex: cat.colorHex,
            worldNameTr: cat.worldNameTr,
            worldNameEn: cat.worldNameEn,
            worldImage: cat.worldImage,
            heroNameTr: cat.heroNameTr,
            heroNameEn: cat.heroNameEn,
            heroImage: cat.heroImage,
            jobCount: cat._count.jobs,
        }));

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error("Career categories error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch categories" },
            { status: 500 }
        );
    }
}
