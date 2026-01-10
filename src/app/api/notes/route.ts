import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
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
