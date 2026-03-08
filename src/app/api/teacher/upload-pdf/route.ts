import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// const pdf = require("pdf-parse"); // Commented out for edge compatibility

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

        // --- CLOUDFLARE EDGE FIX ---
        // 'pdf-parse' requires DOMMatrix and full Node.js API support, which inherently crashes
        // the Cloudflare Edge runtime during build. We temporarily mock out the text extraction 
        // to complete the Vercel-to-Cloudflare migration. 
        // Future fix: Route this via a Serverless Function, Web Worker PDF.js, or API.

        console.log("PDF parsed mocked for edge compatibility");
        const extractedText = `PDF Metni Sunucu Tarafı Dönüşüm Aşamasında (Cloudflare Edge Optimizasyonu). Dosya adı: ${file.name}`;

        return NextResponse.json({
            success: true,
            filename: file.name,
            textLength: extractedText.length,
            extractedText: extractedText,
            info: { Title: file.name },
            pages: 1,
            message: "PDF geçici olarak Edge uyumluluğu için mocklandı"
        });

    } catch (error) {
        console.error("PDF upload error:", error);
        return NextResponse.json({
            error: "PDF işlenirken hata oluştu",
            details: error instanceof Error ? error.message : "Bilinmeyen hata"
        }, { status: 500 });
    }
}
