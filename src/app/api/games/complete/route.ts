import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
    calculateGameXP,
    calculateLevel,
    calculateStreak,
    shouldLevelUp
} from "@/lib/xp";

interface GameCompleteRequest {
    gameMode: 'DUNGEON' | 'ARENA';
    noteId?: string;
    correctAnswers: number;
    totalQuestions: number;
    durationSeconds: number;
    averageResponseTimeMs?: number;
    isWinner?: boolean;
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json(
                { success: false, error: "Giriş yapmanız gerekiyor" },
                { status: 401 }
            );
        }

        const body: GameCompleteRequest = await request.json();
        const {
            gameMode,
            noteId,
            correctAnswers,
            totalQuestions,
            durationSeconds,
            averageResponseTimeMs,
            isWinner
        } = body;

        // Get current user
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: {
                id: true,
                xp: true,
                level: true,
                currentStreak: true,
                bestStreak: true,
                lastPlayedAt: true,
                totalGamesPlayed: true,
                totalCorrectAnswers: true,
                totalQuestionsAnswered: true,
            },
        });

        if (!user) {
            return NextResponse.json(
                { success: false, error: "Kullanıcı bulunamadı" },
                { status: 404 }
            );
        }

        // Calculate streak
        const streakResult = calculateStreak(user.lastPlayedAt, user.currentStreak);

        // Calculate XP
        const xpResult = calculateGameXP({
            correctAnswers,
            totalQuestions,
            averageResponseTimeMs,
            gameMode,
            isWinner,
            currentStreak: streakResult.newStreak,
        });

        // Calculate new totals
        const newXP = user.xp + xpResult.totalXP;
        const newLevel = calculateLevel(newXP);
        const leveledUp = newLevel > user.level;
        const newBestStreak = Math.max(user.bestStreak, streakResult.newStreak);

        // Update user stats
        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                xp: newXP,
                level: newLevel,
                currentStreak: streakResult.newStreak,
                bestStreak: newBestStreak,
                lastPlayedAt: new Date(),
                totalGamesPlayed: user.totalGamesPlayed + 1,
                totalCorrectAnswers: user.totalCorrectAnswers + correctAnswers,
                totalQuestionsAnswered: user.totalQuestionsAnswered + totalQuestions,
            },
            select: {
                xp: true,
                level: true,
                currentStreak: true,
                bestStreak: true,
                totalGamesPlayed: true,
            },
        });

        // Create game session record (if noteId provided)
        let gameSessionId = null;
        if (noteId && noteId !== 'demo-1' && noteId !== 'demo-2') {
            try {
                const gameSession = await prisma.gameSession.create({
                    data: {
                        userId: user.id,
                        noteId,
                        mode: gameMode,
                        score: correctAnswers * 10,
                        correctCount: correctAnswers,
                        totalCount: totalQuestions,
                        durationSeconds,
                        isWinner: isWinner ?? null,
                    },
                });
                gameSessionId = gameSession.id;
            } catch (e) {
                // Note might not exist - that's okay for demo mode
                console.log("Could not create game session:", e);
            }
        }

        return NextResponse.json({
            success: true,
            data: {
                xpEarned: xpResult.totalXP,
                baseXP: xpResult.baseXP,
                bonusXP: xpResult.bonusXP,
                bonuses: xpResult.bonuses,
                newTotalXP: updatedUser.xp,
                newLevel: updatedUser.level,
                leveledUp,
                previousLevel: user.level,
                streak: {
                    current: updatedUser.currentStreak,
                    best: updatedUser.bestStreak,
                    broken: streakResult.streakBroken,
                    continued: streakResult.streakContinued,
                },
                stats: {
                    totalGamesPlayed: updatedUser.totalGamesPlayed,
                },
                gameSessionId,
            },
        });

    } catch (error) {
        console.error("Game complete error:", error);
        return NextResponse.json(
            { success: false, error: "Oyun kaydedilemedi" },
            { status: 500 }
        );
    }
}
