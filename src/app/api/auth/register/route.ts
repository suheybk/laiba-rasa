import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcrypt-ts";
import { z } from "zod";

export const runtime = "edge";

// Inline schema to avoid Prisma dependency issues during build
const registerSchema = z.object({
    email: z.string().email("Geçerli bir e-posta adresi girin"),
    password: z
        .string()
        .min(8, "Şifre en az 8 karakter olmalı")
        .regex(/[A-Z]/, "En az bir büyük harf içermeli")
        .regex(/[0-9]/, "En az bir rakam içermeli"),
    username: z
        .string()
        .min(3, "Kullanıcı adı en az 3 karakter olmalı")
        .max(50, "Kullanıcı adı en fazla 50 karakter olabilir")
        .regex(/^[a-zA-Z0-9_]+$/, "Sadece harf, rakam ve alt çizgi kullanılabilir"),
    language: z.enum(["TR", "AR", "EN"]).default("TR"),
});

export async function POST(request: NextRequest) {
    try {
        // Check if DATABASE_URL is available
        if (!process.env.DATABASE_URL) {
            console.error("DATABASE_URL is not set!");
            return NextResponse.json(
                {
                    success: false,
                    error: "DATABASE_URL yapılandırılmamış",
                    debug: "Environment variable missing"
                },
                { status: 500 }
            );
        }

        const body = await request.json();
        const parsed = registerSchema.safeParse(body);

        if (!parsed.success) {
            const errorMessages = parsed.error.issues.map((e) => e.message);
            return NextResponse.json(
                { success: false, errors: errorMessages },
                { status: 400 }
            );
        }

        const { email, password, username, language } = parsed.data;

        // Dynamic import Prisma to avoid build issues
        const { prisma } = await import("@/lib/db");

        // Check if user exists
        const existingEmail = await prisma.user.findUnique({
            where: { email },
        });

        if (existingEmail) {
            return NextResponse.json(
                { success: false, error: "Bu e-posta adresi zaten kullanılıyor" },
                { status: 409 }
            );
        }

        const existingUsername = await prisma.user.findUnique({
            where: { username },
        });

        if (existingUsername) {
            return NextResponse.json(
                { success: false, error: "Bu kullanıcı adı zaten kullanılıyor" },
                { status: 409 }
            );
        }

        // Hash password
        const hashedPassword = await hash(password, 12);

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                username,
                password: hashedPassword,
                language: language as "TR" | "AR" | "EN",
                displayName: username,
            },
            select: {
                id: true,
                email: true,
                username: true,
                displayName: true,
                language: true,
                createdAt: true,
            },
        });

        return NextResponse.json(
            { success: true, data: { user } },
            { status: 201 }
        );
    } catch (error: unknown) {
        console.error("Registration error:", error);

        // Detaylı hata bilgisi
        let errorMessage = "Kayıt sırasında bir hata oluştu";
        let errorDetails = "";

        if (error instanceof Error) {
            errorDetails = error.message;

            // Prisma/DB hatalarını kontrol et
            if (error.message.includes("prisma") || error.message.includes("database")) {
                errorMessage = "Veritabanı bağlantı hatası";
            } else if (error.message.includes("Unique constraint")) {
                errorMessage = "Bu kullanıcı zaten mevcut";
            }
        }

        return NextResponse.json(
            {
                success: false,
                error: errorMessage,
                details: errorDetails // Temporarily show in production for debugging
            },
            { status: 500 }
        );
    }
}
