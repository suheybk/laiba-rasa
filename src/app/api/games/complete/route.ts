import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

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
        const session = await auth();

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

        // Career signal collection — async, non-blocking
        collectCareerSignals(user.id, noteId, gameMode, correctAnswers, totalQuestions, gameSessionId)
            .catch(() => { }); // silent fail — career signals are non-critical

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

// ============================================
// CAREER SIGNAL COLLECTION (Hidden Measurement)
// ============================================
async function collectCareerSignals(
    userId: string,
    noteId: string | undefined,
    gameMode: string,
    correctAnswers: number,
    totalQuestions: number,
    sessionId: string | null
) {
    try {
        if (!noteId || noteId.startsWith('demo')) return;

        // 1. Get note's subject/topic to infer category
        const note = await prisma.note.findUnique({
            where: { id: noteId },
            select: { subject: true, topic: true },
        });

        if (!note?.subject) return;

        // 2. Map subject/topic to career categories
        const subjectLower = (note.subject + ' ' + (note.topic || '')).toLowerCase();
        const categoryMappings: Record<string, string[]> = {
            'ai': ['yapay zeka', 'ai', 'machine learning', 'makine öğren', 'derin öğren', 'deep learning', 'neural', 'sinir ağ'],
            'data': ['veri', 'data', 'istatistik', 'analiz', 'büyük veri', 'big data'],
            'cyber': ['siber', 'güvenlik', 'security', 'şifre', 'kriptografi', 'blockchain'],
            'robotics': ['robot', 'otonom', 'drone', 'dron', 'mekatronik'],
            'health': ['sağlık', 'biyoloji', 'tıp', 'genom', 'biyoteknoloji', 'hücre', 'dna'],
            'environment': ['çevre', 'iklim', 'enerji', 'sürdürülebilir', 'ekoloji'],
            'law': ['hukuk', 'adalet', 'etik', 'yasa', 'regülasyon'],
            'marketing': ['pazarlama', 'reklam', 'medya', 'iletişim', 'sosyal medya'],
            'education': ['eğitim', 'öğretim', 'pedagoji', 'koçluk'],
            'design': ['tasarım', 'sanat', 'grafik', 'ux', 'ui', 'mimari'],
            'finance': ['finans', 'ekonomi', 'muhasebe', 'borsa', 'kripto'],
            'psychology': ['psikoloji', 'davranış', 'ruh sağlığı', 'nörobilim'],
            'gaming': ['oyun', 'game', 'e-spor', 'esport'],
            'science': ['fizik', 'kimya', 'uzay', 'astronomi', 'kuantum', 'nano', 'matematik'],
            'metaverse': ['metaverse', 'sanal gerçeklik', 'vr', 'ar', '3d'],
        };

        const matchedSlugs: string[] = [];
        for (const [slug, keywords] of Object.entries(categoryMappings)) {
            if (keywords.some(kw => subjectLower.includes(kw))) {
                matchedSlugs.push(slug);
            }
        }

        if (matchedSlugs.length === 0) return;

        // 3. Calculate signal weight based on performance
        const accuracy = totalQuestions > 0 ? correctAnswers / totalQuestions : 0;
        const baseWeight = gameMode === 'DUNGEON' ? 1.5 : gameMode === 'ARENA' ? 2.0 : 1.0;
        const performanceMultiplier = 0.5 + accuracy; // 0.5 to 1.5
        const signalWeight = baseWeight * performanceMultiplier;

        // 4. Record signals for matched categories
        const categories = await prisma.careerCategory.findMany({
            where: { slug: { in: matchedSlugs } },
        });

        for (const cat of categories) {
            await prisma.careerSignal.create({
                data: {
                    userId,
                    categoryId: cat.id,
                    sourceType: gameMode === 'DUNGEON' ? 'DUNGEON' : gameMode === 'ARENA' ? 'ARENA' : 'RAID',
                    weight: signalWeight,
                    signalData: {
                        noteSubject: note.subject,
                        noteTopic: note.topic,
                        accuracy,
                        correctAnswers,
                        totalQuestions,
                    },
                    sessionId,
                },
            });
        }
    } catch (err) {
        // Silent fail — career signals are non-critical
        console.log('Career signal collection skipped:', (err as Error).message);
    }
}
