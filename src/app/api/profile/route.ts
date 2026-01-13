import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getXPToNextLevel } from "@/lib/xp";

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            // Return demo stats for non-logged-in users
            return NextResponse.json({
                success: true,
                data: {
                    isDemo: true,
                    user: {
                        displayName: "Demo Kullanıcı",
                        username: "demo_user",
                        avatarUrl: null,
                    },
                    xp: {
                        total: 150,
                        level: 2,
                        progress: getXPToNextLevel(150),
                    },
                    stats: {
                        totalGamesPlayed: 5,
                        totalCorrectAnswers: 42,
                        totalQuestionsAnswered: 50,
                        accuracy: 84,
                        currentStreak: 2,
                        bestStreak: 3,
                    },
                },
            });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: {
                id: true,
                displayName: true,
                username: true,
                avatarUrl: true,
                xp: true,
                level: true,
                totalGamesPlayed: true,
                totalCorrectAnswers: true,
                totalQuestionsAnswered: true,
                currentStreak: true,
                bestStreak: true,
                lastPlayedAt: true,
                createdAt: true,
            },
        });

        if (!user) {
            return NextResponse.json(
                { success: false, error: "Kullanıcı bulunamadı" },
                { status: 404 }
            );
        }

        const accuracy = user.totalQuestionsAnswered > 0
            ? Math.round((user.totalCorrectAnswers / user.totalQuestionsAnswered) * 100)
            : 0;

        return NextResponse.json({
            success: true,
            data: {
                isDemo: false,
                user: {
                    displayName: user.displayName || user.username,
                    username: user.username,
                    avatarUrl: user.avatarUrl,
                },
                xp: {
                    total: user.xp,
                    level: user.level,
                    progress: getXPToNextLevel(user.xp),
                },
                stats: {
                    totalGamesPlayed: user.totalGamesPlayed,
                    totalCorrectAnswers: user.totalCorrectAnswers,
                    totalQuestionsAnswered: user.totalQuestionsAnswered,
                    accuracy,
                    currentStreak: user.currentStreak,
                    bestStreak: user.bestStreak,
                    lastPlayedAt: user.lastPlayedAt,
                    memberSince: user.createdAt,
                },
            },
        });

    } catch (error) {
        console.error("Profile fetch error:", error);
        return NextResponse.json(
            { success: false, error: "Profil yüklenemedi" },
            { status: 500 }
        );
    }
}
