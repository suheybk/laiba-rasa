
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Fetch users with note counts
        // In a real app with thousands of users, we would need a dedicated 'score' field indexed for sorting.
        // For V1, fetching all and sorting in memory is acceptable.
        const users = await prisma.user.findMany({
            select: {
                id: true,
                username: true,
                displayName: true,
                avatarUrl: true,
                _count: {
                    select: { notes: true }
                }
            }
        });

        // Calculate score and sort
        const leaderboard = users
            .map(user => ({
                id: user.id,
                name: user.displayName || user.username || "Anonim",
                avatar: user.avatarUrl,
                // Score formula: Note Count * 50
                score: user._count.notes * 50,
                noteCount: user._count.notes
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 10); // Top 10

        return NextResponse.json({ leaderboard });

    } catch (error) {
        console.error("Leaderboard error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
