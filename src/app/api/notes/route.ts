import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        // Demo modu: Session yoksa demo notları döndür
        if (!session?.user?.id) {
            return NextResponse.json([
                {
                    id: "demo-1",
                    title: "Hücre Organelleri",
                    subject: "Biyoloji",
                    topic: "Hücre Biyolojisi",
                    qualityScore: 85,
                    updatedAt: new Date().toISOString(),
                    _count: { gameSessions: 3 }
                },
                {
                    id: "demo-2",
                    title: "Osmanlı Kuruluş Dönemi",
                    subject: "Tarih",
                    topic: "Osmanlı Tarihi",
                    qualityScore: 78,
                    updatedAt: new Date(Date.now() - 86400000).toISOString(),
                    _count: { gameSessions: 5 }
                },
                {
                    id: "demo-3",
                    title: "Türev ve İntegral",
                    subject: "Matematik",
                    topic: "Analiz",
                    qualityScore: 92,
                    updatedAt: new Date(Date.now() - 172800000).toISOString(),
                    _count: { gameSessions: 7 }
                }
            ]);
        }

        const notes = await prisma.note.findMany({
            where: {
                userId: session.user.id,
            },
            select: {
                id: true,
                title: true,
                subject: true,
                topic: true,
                qualityScore: true,
                updatedAt: true,
                _count: {
                    select: {
                        gameSessions: true,
                    },
                },
            },
            orderBy: {
                updatedAt: "desc",
            },
        });

        return NextResponse.json(notes);
    } catch (error) {
        console.error("[NOTES_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
