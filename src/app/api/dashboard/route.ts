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

        const userId = session.user.id;

        // Parallel data fetching
        const [
            notesCount,
            gameSessions,
            masteryEntries,
            recentNotes
        ] = await Promise.all([
            // 1. Total Notes
            prisma.note.count({
                where: { userId }
            }),
            // 2. Game Stats (Duration)
            prisma.gameSession.findMany({
                where: { userId },
                select: { durationSeconds: true }
            }),
            // 3. Mastery Entries
            prisma.masteryEntry.findMany({
                where: { userId },
                take: 3,
                orderBy: { mastery: 'desc' }
            }),
            // 4. Recent Notes
            prisma.note.findMany({
                where: { userId },
                take: 3,
                orderBy: { updatedAt: 'desc' },
                select: {
                    id: true,
                    title: true,
                    updatedAt: true,
                    qualityScore: true
                }
            })
        ]);

        // Calculate functionality
        const totalDurationSeconds = gameSessions.reduce((acc, curr) => acc + (curr.durationSeconds || 0), 0);
        const totalDurationHours = Math.round(totalDurationSeconds / 3600);

        // Calculate average mastery
        // If no mastery entries, we might check notes quality as a fallback or just return 0
        const avgMastery = masteryEntries.length > 0
            ? Math.round(masteryEntries.reduce((acc, curr) => acc + curr.mastery, 0) / masteryEntries.length)
            : 0;

        return NextResponse.json({
            stats: {
                totalNotes: notesCount,
                gameHours: totalDurationHours,
                avgMastery,
                rank: "#" + Math.floor(Math.random() * 500 + 1) // Mock rank for now as we don't have a leaderboard yet
            },
            recentNotes: recentNotes.map(note => ({
                ...note,
                updatedAt: new Date(note.updatedAt).toLocaleDateString('tr-TR', {
                    day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
                }) // Format relative time in client if preferred, or string here
            })),
            masteryData: masteryEntries.map(entry => ({
                subject: entry.subject,
                mastery: Math.round(entry.mastery),
                color: "violet" // Default color, can be randomized in client
            }))
        });

    } catch (error) {
        console.error("[DASHBOARD_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
