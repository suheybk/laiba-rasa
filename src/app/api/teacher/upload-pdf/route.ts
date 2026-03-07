import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const pdf = require("pdf-parse");

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const session = await auth();

        if (!session || !session.user?.email) {
            return NextResponse.json({ error: "Giriş yapmanız gerekiyor" }, { status: 401 });
        }

        // Get the uploaded file
        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            console.log("Upload failed: No file found in form data");
            return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 400 });
        }

        if (!file.name.endsWith('.pdf')) {
            console.log("Upload failed: Invalid file extension:", file.name);
            return NextResponse.json({ error: "Sadece PDF dosyaları kabul edilir" }, { status: 400 });
        }

        // Read file buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Extract text from PDF using pdf-parse
        try {
            const data = await pdf(buffer);
            const extractedText = data.text;

            return NextResponse.json({
                success: true,
                filename: file.name,
                textLength: extractedText.length,
                extractedText: extractedText.substring(0, 30000), // Limit to 30k chars for AI context window
                info: data.info,
                pages: data.numpages,
                message: "PDF başarıyla okundu"
            });
        } catch (pdfError) {
            console.error("PDF Parse Error Detailed:", pdfError);
            return NextResponse.json({ error: "PDF içeriği okunamadı. Dosya bozuk veya şifreli olabilir." }, { status: 400 });
        }

    } catch (error) {
        console.error("PDF upload error:", error);
        return NextResponse.json({
            error: "PDF işlenirken hata oluştu",
            details: error instanceof Error ? error.message : "Bilinmeyen hata"
        }, { status: 500 });
    }
}
