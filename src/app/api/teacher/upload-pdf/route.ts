"use server";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';

// Simple PDF text extraction using regex patterns
// In production, you'd use a proper PDF parser like pdf-parse
async function extractTextFromPDF(buffer: Buffer): Promise<string> {
    const text = buffer.toString('latin1');

    // Extract text between stream/endstream tags (simplified PDF parsing)
    const streamMatches = text.match(/stream[\r\n]+(.+?)[\r\n]+endstream/gs) || [];

    let extractedText = "";
    for (const match of streamMatches) {
        // Try to decode text content
        const content = match
            .replace(/stream[\r\n]+/, '')
            .replace(/[\r\n]+endstream/, '');

        // Extract readable text (simplified)
        const readable = content.replace(/[^\x20-\x7E\xC0-\xFF]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();

        if (readable.length > 10) {
            extractedText += readable + "\n";
        }
    }

    // If stream parsing didn't work well, try direct text extraction
    if (extractedText.length < 100) {
        extractedText = text
            .replace(/[^\x20-\x7E\xC0-\xFF\n]/g, ' ')
            .replace(/\s+/g, ' ')
            .split(/(?=[A-Z][a-z])/).join('\n')
            .trim();
    }

    return extractedText || "PDF içeriği okunamadı. Lütfen metin tabanlı bir PDF yükleyin.";
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.email) {
            return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
        }

        // Check if user is teacher or admin
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true, role: true }
        });

        if (!user) {
            return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
        }

        // Role check - only TEACHER or ADMIN can upload
        if (user.role !== "TEACHER" && user.role !== "ADMIN") {
            return NextResponse.json({
                error: "Bu özellik sadece öğretmenler için aktif",
                requiredRole: "TEACHER veya ADMIN"
            }, { status: 403 });
        }

        // Get the uploaded file
        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 400 });
        }

        if (!file.name.endsWith('.pdf')) {
            return NextResponse.json({ error: "Sadece PDF dosyaları kabul edilir" }, { status: 400 });
        }

        // Read file buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Extract text from PDF
        const extractedText = await extractTextFromPDF(buffer);

        return NextResponse.json({
            success: true,
            filename: file.name,
            textLength: extractedText.length,
            extractedText: extractedText.substring(0, 10000), // Limit to 10k chars
            message: "PDF başarıyla okundu"
        });

    } catch (error) {
        console.error("PDF upload error:", error);
        return NextResponse.json({
            error: "PDF işlenirken hata oluştu",
            details: error instanceof Error ? error.message : "Bilinmeyen hata"
        }, { status: 500 });
    }
}
