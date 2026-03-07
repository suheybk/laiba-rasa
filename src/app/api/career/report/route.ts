import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isUserPremium } from "@/lib/auth";
import { getCareerReport, updateCareerProfile } from "@/lib/career-algorithm";

export const runtime = "edge";



// GET /api/career/report — Get full career report
export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        // Update profile before generating report
        await updateCareerProfile(session.user.id);

        const report = await getCareerReport(session.user.id);
        if (!report) {
            return NextResponse.json({
                success: true,
                data: null,
                message: "No career profile yet. Complete career onboarding first.",
            });
        }

        const isPremium = await isUserPremium(session.user.id);

        return NextResponse.json({
            success: true,
            data: { ...report, isPremium }
        });
    } catch (error) {
        console.error("Career report error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to generate report" },
            { status: 500 }
        );
    }
}
