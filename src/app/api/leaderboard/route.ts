
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';

// Demo leaderboard data
const DEMO_LEADERBOARD = [
    { id: "demo-1", name: "Ahmet Y.", xp: 2450, level: 8, avatar: null, gamesPlayed: 45 },
    { id: "demo-2", name: "Zeynep K.", xp: 2180, level: 7, avatar: null, gamesPlayed: 38 },
    { id: "demo-3", name: "Mehmet A.", xp: 1950, level: 7, avatar: null, gamesPlayed: 32 },
    { id: "demo-4", name: "Fatma S.", xp: 1720, level: 6, avatar: null, gamesPlayed: 28 },
    { id: "demo-5", name: "Ali R.", xp: 1580, level: 6, avatar: null, gamesPlayed: 25 },
    { id: "demo-6", name: "Ayşe B.", xp: 1320, level: 5, avatar: null, gamesPlayed: 22 },
    { id: "demo-7", name: "Mustafa D.", xp: 1150, level: 5, avatar: null, gamesPlayed: 18 },
    { id: "demo-8", name: "Elif T.", xp: 980, level: 4, avatar: null, gamesPlayed: 15 },
    { id: "demo-9", name: "Hasan Ç.", xp: 750, level: 4, avatar: null, gamesPlayed: 12 },
    { id: "demo-10", name: "Sena M.", xp: 520, level: 3, avatar: null, gamesPlayed: 8 },
];

export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        const { searchParams } = new URL(request.url);
        const period = searchParams.get('period') || 'all'; // 'all', 'weekly', 'monthly'

        // Try to get real leaderboard data
        try {
            const users = await prisma.user.findMany({
                select: {
                    id: true,
                    username: true,
                    displayName: true,
                    avatarUrl: true,
                    xp: true,
                    level: true,
                    totalGamesPlayed: true,
                },
                orderBy: {
                    xp: 'desc'
                },
                take: 20
            });

            // If we have real users with XP, use them
            if (users.length > 0 && users.some(u => u.xp > 0)) {
                const leaderboard = users
                    .filter(u => u.xp > 0) // Only show users who have played
                    .slice(0, 10)
                    .map((user, index) => ({
                        rank: index + 1,
                        id: user.id,
                        name: user.displayName || user.username || "Anonim",
                        avatar: user.avatarUrl,
                        xp: user.xp,
                        level: user.level,
                        gamesPlayed: user.totalGamesPlayed,
                        isCurrentUser: session?.user?.email ? false : false // Would need email check
                    }));

                // Find current user's rank if logged in
                let currentUserRank = null;
                if (session?.user?.email) {
                    const currentUser = await prisma.user.findUnique({
                        where: { email: session.user.email },
                        select: { id: true, xp: true, level: true, displayName: true, username: true, totalGamesPlayed: true }
                    });

                    if (currentUser) {
                        const rank = users.findIndex(u => u.id === currentUser.id) + 1;
                        currentUserRank = {
                            rank: rank > 0 ? rank : null,
                            id: currentUser.id,
                            name: currentUser.displayName || currentUser.username || "Sen",
                            xp: currentUser.xp,
                            level: currentUser.level,
                            gamesPlayed: currentUser.totalGamesPlayed,
                            isCurrentUser: true
                        };
                    }
                }

                return NextResponse.json({
                    leaderboard,
                    currentUser: currentUserRank,
                    period,
                    isDemo: false
                });
            }
        } catch (dbError) {
            console.error("Database error, falling back to demo:", dbError);
        }

        // Fallback to demo leaderboard
        const demoLeaderboard = DEMO_LEADERBOARD.map((user, index) => ({
            rank: index + 1,
            ...user,
            isCurrentUser: false
        }));

        // Add demo user if not logged in
        const demoCurrentUser = !session ? {
            rank: 15,
            id: "demo-you",
            name: "Sen (Demo)",
            xp: 150,
            level: 2,
            gamesPlayed: 3,
            isCurrentUser: true
        } : null;

        return NextResponse.json({
            leaderboard: demoLeaderboard,
            currentUser: demoCurrentUser,
            period,
            isDemo: true
        });

    } catch (error) {
        console.error("Leaderboard error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
