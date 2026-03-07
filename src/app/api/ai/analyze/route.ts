// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import { analyzeTextForCRAQ } from "@/lib/gemini";

export const runtime = "edge";



export const maxDuration = 60; // Allow longer timeout for AI generation

export async function POST(req: NextRequest) {
    try {
        const session = await auth();

        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { text } = body;

        if (!text || text.length < 50) {
            return NextResponse.json({ error: "Text too short for analysis" }, { status: 400 });
        }

        const result = await analyzeTextForCRAQ(text);

        if (!result) {
            return NextResponse.json({ error: "AI analysis failed" }, { status: 500 });
        }

        return NextResponse.json({ success: true, data: result });

    } catch (error: any) {
        console.error("Analysis API Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
