// XP and Level calculation utilities

export const XP_CONFIG = {
    // Base XP values
    CORRECT_ANSWER: 10,
    WRONG_ANSWER: 0,

    // Bonuses
    PERFECT_GAME_BONUS: 50,      // 100% doğruluk
    FAST_ANSWER_BONUS: 5,        // <3 saniye cevap
    ARENA_WIN_BONUS: 25,         // Arena kazanma
    DUNGEON_COMPLETE_BONUS: 20,  // Dungeon tamamlama
    STREAK_BONUS_PER_DAY: 5,     // Her streak günü için

    // Level formula constants
    LEVEL_DIVISOR: 50,           // level = floor(sqrt(xp / DIVISOR)) + 1
};

/**
 * Calculate XP earned from a game session
 */
export function calculateGameXP(params: {
    correctAnswers: number;
    totalQuestions: number;
    averageResponseTimeMs?: number;
    gameMode: 'DUNGEON' | 'ARENA';
    isWinner?: boolean;
    currentStreak?: number;
}): {
    baseXP: number;
    bonusXP: number;
    totalXP: number;
    bonuses: string[];
} {
    const { correctAnswers, totalQuestions, averageResponseTimeMs, gameMode, isWinner, currentStreak } = params;

    let baseXP = correctAnswers * XP_CONFIG.CORRECT_ANSWER;
    let bonusXP = 0;
    const bonuses: string[] = [];

    // Perfect game bonus (100% accuracy)
    const accuracy = totalQuestions > 0 ? correctAnswers / totalQuestions : 0;
    if (accuracy === 1 && totalQuestions >= 5) {
        bonusXP += XP_CONFIG.PERFECT_GAME_BONUS;
        bonuses.push('Mükemmel Oyun! +50 XP');
    }

    // Fast answer bonus
    if (averageResponseTimeMs && averageResponseTimeMs < 3000) {
        bonusXP += XP_CONFIG.FAST_ANSWER_BONUS;
        bonuses.push('Hızlı Cevaplar! +5 XP');
    }

    // Game mode specific bonuses
    if (gameMode === 'DUNGEON') {
        bonusXP += XP_CONFIG.DUNGEON_COMPLETE_BONUS;
        bonuses.push('Zindan Tamamlandı! +20 XP');
    }

    if (gameMode === 'ARENA' && isWinner) {
        bonusXP += XP_CONFIG.ARENA_WIN_BONUS;
        bonuses.push('Arena Zaferi! +25 XP');
    }

    // Streak bonus
    if (currentStreak && currentStreak > 1) {
        const streakBonus = Math.min(currentStreak, 7) * XP_CONFIG.STREAK_BONUS_PER_DAY;
        bonusXP += streakBonus;
        bonuses.push(`${currentStreak} Günlük Seri! +${streakBonus} XP`);
    }

    return {
        baseXP,
        bonusXP,
        totalXP: baseXP + bonusXP,
        bonuses,
    };
}

/**
 * Calculate level from total XP
 */
export function calculateLevel(xp: number): number {
    return Math.floor(Math.sqrt(xp / XP_CONFIG.LEVEL_DIVISOR)) + 1;
}

/**
 * Calculate XP needed for next level
 */
export function getXPForLevel(level: number): number {
    return Math.pow(level - 1, 2) * XP_CONFIG.LEVEL_DIVISOR;
}

/**
 * Calculate XP needed to reach next level
 */
export function getXPToNextLevel(currentXP: number): {
    currentLevel: number;
    nextLevel: number;
    currentLevelXP: number;
    nextLevelXP: number;
    xpProgress: number;
    xpNeeded: number;
    progressPercent: number;
} {
    const currentLevel = calculateLevel(currentXP);
    const nextLevel = currentLevel + 1;
    const currentLevelXP = getXPForLevel(currentLevel);
    const nextLevelXP = getXPForLevel(nextLevel);
    const xpProgress = currentXP - currentLevelXP;
    const xpNeeded = nextLevelXP - currentXP;
    const levelRange = nextLevelXP - currentLevelXP;
    const progressPercent = levelRange > 0 ? (xpProgress / levelRange) * 100 : 0;

    return {
        currentLevel,
        nextLevel,
        currentLevelXP,
        nextLevelXP,
        xpProgress,
        xpNeeded,
        progressPercent: Math.min(100, Math.max(0, progressPercent)),
    };
}

/**
 * Check if user should level up
 */
export function shouldLevelUp(currentXP: number, currentLevel: number): boolean {
    const calculatedLevel = calculateLevel(currentXP);
    return calculatedLevel > currentLevel;
}

/**
 * Calculate streak based on last played date
 */
export function calculateStreak(lastPlayedAt: Date | null, currentStreak: number): {
    newStreak: number;
    streakBroken: boolean;
    streakContinued: boolean;
} {
    if (!lastPlayedAt) {
        return { newStreak: 1, streakBroken: false, streakContinued: false };
    }

    const now = new Date();
    const lastPlayed = new Date(lastPlayedAt);

    // Reset times to midnight for comparison
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastDay = new Date(lastPlayed.getFullYear(), lastPlayed.getMonth(), lastPlayed.getDate());

    const diffTime = today.getTime() - lastDay.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        // Same day - streak continues but doesn't increase
        return { newStreak: currentStreak, streakBroken: false, streakContinued: true };
    } else if (diffDays === 1) {
        // Next day - streak increases
        return { newStreak: currentStreak + 1, streakBroken: false, streakContinued: true };
    } else {
        // Streak broken - reset to 1
        return { newStreak: 1, streakBroken: true, streakContinued: false };
    }
}
