"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSound } from "@/hooks/use-sound";
import { Badge } from "@/components/ui/badge";
import {

    ArrowLeft,
    Heart,
    Zap,
    Clock,
    Check,
    X,
    ChevronRight,
    Trophy,
    Star,
    Flame,
    HelpCircle,
    RotateCcw,
    Loader2
} from "lucide-react";

// Types
interface GameCard {
    id: string;
    type: string;
    question: string;
    options: string[];
    correctIndex: number;
    difficulty: number;
    hint: string;
    feedback: {
        correct: string;
        incorrect: string;
    };
    cardId?: string;
}

function DungeonContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const noteId = searchParams.get("noteId");
    const { playCorrect, playWrong, playLevelUp, playClick, playBgMusic, stopBgMusic } = useSound();

    const [cards, setCards] = useState<GameCard[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [sessionId, setSessionId] = useState<string | null>(null);

    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isRevealed, setIsRevealed] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const [hintsUsed, setHintsUsed] = useState(0);

    // Game state
    const [hearts, setHearts] = useState(3);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [correctAnswers, setCorrectAnswers] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [gameOver, setGameOver] = useState(false);
    const [gameComplete, setGameComplete] = useState(false);
    const [gameStartTime] = useState(Date.now());
    const [gameResult, setGameResult] = useState<{
        xpEarned: number;
        bonuses: string[];
        newLevel: number;
        leveledUp: boolean;
        streak: { current: number; best: number };
    } | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Fetch Game Data
    useEffect(() => {
        async function fetchGame() {
            if (!noteId) {
                // If no noteId, maybe redirect or show error (or load demo)
                // For now, load demo/mock if no ID, or handle error
                // alert("Not ID eksik!"); 
                setIsLoading(false);
                return;
            }

            try {
                const res = await fetch("/api/games/dungeon/start", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ noteId })
                });

                if (!res.ok) throw new Error("Oyun başlatılamadı");

                const data = (await res.json()) as any;
                setCards(data.cards);
                setSessionId(data.sessionId);
            } catch (error) {
                console.error(error);
                alert("Oyun verisi yüklenirken hatayla karşılaşıldı");
            } finally {
                setIsLoading(false);
            }
        }
        fetchGame();
    }, [noteId]);

    // 🎵 Arka plan müziği
    useEffect(() => {
        if (!isLoading && cards.length > 0) {
            playBgMusic("dungeon");
        }
        return () => {
            stopBgMusic();
        };
    }, [isLoading, cards.length, playBgMusic, stopBgMusic]);

    // Oyun bittiğinde müziği durdur
    useEffect(() => {
        if (gameOver || gameComplete) {
            stopBgMusic();
        }
    }, [gameOver, gameComplete, stopBgMusic]);

    const currentCard = cards[currentCardIndex];
    const progress = cards.length > 0 ? ((currentCardIndex) / cards.length) * 100 : 0;

    // Timer
    useEffect(() => {
        if (gameOver || gameComplete || isRevealed || isLoading || !currentCard) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    handleTimeout();
                    return 30;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [currentCardIndex, gameOver, gameComplete, isRevealed, isLoading, currentCard]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center dungeon-bg">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-violet-500 animate-spin mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-white">Zindan Hazırlanıyor...</h2>
                </div>
            </div>
        );
    }

    if (!currentCard) {
        return (
            <div className="min-h-screen flex items-center justify-center dungeon-bg text-center p-4">
                <Card gradient className="p-8">
                    <h2 className="text-xl font-bold mb-4">Oyun Bulunamadı</h2>
                    <p className="mb-4">Bu not için henüz yeterli içerik yok veya bir hata oluştu.</p>
                    <Link href="/dashboard">
                        <Button>Dashboard'a Dön</Button>
                    </Link>
                </Card>
            </div>
        );
    }


    const handleTimeout = () => {
        setHearts((prev) => prev - 1);
        setStreak(0);
        if (hearts <= 1) {
            setGameOver(true);
            saveGameResult(false); // Save failed game
        } else {
            handleNextCard();
        }
    };

    const handleOptionSelect = (index: number) => {
        if (isRevealed) return;
        setSelectedOption(index);
    };

    const handleSubmit = () => {
        if (selectedOption === null) return;
        setIsRevealed(true);

        const isCorrect = selectedOption === currentCard.correctIndex;

        if (isCorrect) {
            playCorrect(); // 🔊 Doğru cevap sesi
            // Calculate score
            const basePoints = 100;
            const timeBonus = Math.floor(timeLeft * 2);
            const streakBonus = streak >= 3 ? (streak >= 5 ? 30 : 15) : 0;
            const hintPenalty = showHint ? 40 : 0;
            const totalPoints = basePoints + timeBonus + streakBonus - hintPenalty;

            setScore((prev) => prev + totalPoints);
            setStreak((prev) => prev + 1);
            setCorrectAnswers((prev) => prev + 1);
        } else {
            playWrong(); // 🔊 Yanlış cevap sesi
            setHearts((prev) => prev - 1);
            setStreak(0);

            if (hearts <= 1) {
                setGameOver(true);
                saveGameResult(false); // Save failed game
            }
        }
    };

    // Save game result to server
    const saveGameResult = async (completed: boolean) => {
        if (isSaving) return;
        setIsSaving(true);

        const durationSeconds = Math.floor((Date.now() - gameStartTime) / 1000);
        const totalAnswered = completed ? cards.length : currentCardIndex;

        try {
            const res = await fetch('/api/games/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    gameMode: 'DUNGEON',
                    noteId: noteId || undefined,
                    correctAnswers,
                    totalQuestions: totalAnswered,
                    durationSeconds,
                    averageResponseTimeMs: durationSeconds > 0 ? (durationSeconds * 1000) / totalAnswered : undefined,
                }),
            });

            if (res.ok) {
                const data = (await res.json()) as any;
                if (data.success) {
                    setGameResult(data.data);
                }
            }
        } catch (error) {
            console.error('Failed to save game:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleNextCard = () => {
        if (currentCardIndex >= cards.length - 1) {
            playLevelUp(); // 🔊 Oyun tamamlama sesi
            setGameComplete(true);
            saveGameResult(true); // Save completed game
            return;
        }
        playClick(); // 🔊 Sonraki kart sesi

        setCurrentCardIndex((prev) => prev + 1);
        setSelectedOption(null);
        setIsRevealed(false);
        setShowHint(false);
        setTimeLeft(30);
    };

    const handleUseHint = () => {
        if (!showHint && !isRevealed) {
            setShowHint(true);
            setHintsUsed((prev) => prev + 1);
        }
    };

    const handleRestart = () => {
        setCurrentCardIndex(0);
        setSelectedOption(null);
        setIsRevealed(false);
        setShowHint(false);
        setHearts(3);
        setScore(0);
        setStreak(0);
        setCorrectAnswers(0);
        setTimeLeft(30);
        setGameOver(false);
        setGameComplete(false);
        setHintsUsed(0);
    };

    // Game Over Screen
    if (gameOver) {
        const accuracy = currentCardIndex > 0 ? Math.round((correctAnswers / currentCardIndex) * 100) : 0;
        const xpEarned = Math.floor(score * 0.1);

        return (
            <div className="min-h-screen flex items-center justify-center px-4 dungeon-bg">
                <Card gradient glow className="w-full max-w-md p-8 text-center animate-fade-in">
                    {/* Icon */}
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center mx-auto mb-6 animate-bounce">
                        <X className="w-12 h-12 text-red-400" />
                    </div>

                    <h2 className="text-3xl font-bold mb-2">Oyun Bitti!</h2>
                    <p className="text-slate-400 mb-8">Canların tükendi, ama endişelenme - tekrar deneyebilirsin!</p>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700">
                            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center mx-auto mb-2">
                                <Zap className="w-5 h-5 text-amber-400" />
                            </div>
                            <div className="text-2xl font-bold text-gradient">{score}</div>
                            <div className="text-xs text-slate-500">Puan</div>
                        </div>
                        <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700">
                            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center mx-auto mb-2">
                                <Check className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div className="text-2xl font-bold text-emerald-400">{correctAnswers}/{currentCardIndex}</div>
                            <div className="text-xs text-slate-500">Doğru Cevap</div>
                        </div>
                        <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700">
                            <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center mx-auto mb-2">
                                <Trophy className="w-5 h-5 text-violet-400" />
                            </div>
                            <div className="text-2xl font-bold text-violet-400">{accuracy}%</div>
                            <div className="text-xs text-slate-500">Doğruluk</div>
                        </div>
                        <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700">
                            <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center mx-auto mb-2">
                                <Star className="w-5 h-5 text-indigo-400" />
                            </div>
                            <div className="text-2xl font-bold text-indigo-400">+{xpEarned}</div>
                            <div className="text-xs text-slate-500">XP Kazandın</div>
                        </div>
                    </div>

                    {/* Encouragement */}
                    <div className="p-4 bg-gradient-to-r from-violet-500/10 to-indigo-500/10 rounded-xl border border-violet-500/20 mb-6">
                        <p className="text-sm text-slate-300">
                            💡 <strong>İpucu:</strong> Zor sorularda ipucu kullanmayı dene!
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                        <Button onClick={handleRestart} className="w-full" size="lg">
                            <RotateCcw className="w-5 h-5 mr-2" />
                            Tekrar Dene
                        </Button>
                        <Link href="/games">
                            <Button variant="secondary" className="w-full">
                                Diğer Oyunlar
                            </Button>
                        </Link>
                        <Link href="/dashboard">
                            <Button variant="ghost" className="w-full text-slate-400 hover:text-white">
                                Dashboard'a Dön
                            </Button>
                        </Link>
                    </div>
                </Card>
            </div>
        );
    }

    // Game Complete Screen
    if (gameComplete) {
        const accuracy = Math.round((correctAnswers / cards.length) * 100);
        const stars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : accuracy >= 50 ? 1 : 0;
        const xpEarned = score + (stars * 50) + (hearts * 25);
        const perfectGame = correctAnswers === cards.length;
        const noHints = hintsUsed === 0;

        return (
            <div className="min-h-screen flex items-center justify-center px-4 dungeon-bg">
                <Card gradient glow className="w-full max-w-md p-8 text-center animate-fade-in">
                    {/* Trophy Icon with Glow */}
                    <div className="relative w-28 h-28 mx-auto mb-6">
                        <div className="absolute inset-0 bg-emerald-500/30 rounded-full blur-xl animate-pulse" />
                        <div className="relative w-full h-full rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                            <Trophy className="w-14 h-14 text-emerald-400" />
                        </div>
                    </div>

                    <h2 className="text-3xl font-bold mb-2">Tebrikler! 🎉</h2>
                    <p className="text-slate-400 mb-4">Bu zindanı başarıyla tamamladın!</p>

                    {/* Stars Animation */}
                    <div className="flex justify-center gap-3 mb-6">
                        {[1, 2, 3].map((star, i) => (
                            <div
                                key={star}
                                className="transform transition-all duration-500"
                                style={{
                                    animationDelay: `${i * 0.2}s`,
                                    transform: star <= stars ? 'scale(1)' : 'scale(0.8)',
                                    opacity: star <= stars ? 1 : 0.3
                                }}
                            >
                                <Star
                                    className={`w-12 h-12 ${star <= stars
                                        ? "text-amber-400 fill-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]"
                                        : "text-slate-700"
                                        }`}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Achievements */}
                    {(perfectGame || noHints) && (
                        <div className="flex justify-center gap-2 mb-6">
                            {perfectGame && (
                                <Badge variant="premium" className="animate-pulse">
                                    🏆 Mükemmel Oyun!
                                </Badge>
                            )}
                            {noHints && (
                                <Badge variant="success">
                                    💪 İpucusuz Tamamladın!
                                </Badge>
                            )}
                        </div>
                    )}

                    {/* Stats Grid */}
                    <div className="grid grid-cols-4 gap-2 mb-6">
                        <div className="p-3 bg-slate-800/80 rounded-xl">
                            <div className="text-xl font-bold text-gradient">{score}</div>
                            <div className="text-[10px] text-slate-500">Puan</div>
                        </div>
                        <div className="p-3 bg-slate-800/80 rounded-xl">
                            <div className="text-xl font-bold text-emerald-400">{accuracy}%</div>
                            <div className="text-[10px] text-slate-500">Doğruluk</div>
                        </div>
                        <div className="p-3 bg-slate-800/80 rounded-xl">
                            <div className="text-xl font-bold text-red-400">{hearts}/3</div>
                            <div className="text-[10px] text-slate-500">Can</div>
                        </div>
                        <div className="p-3 bg-slate-800/80 rounded-xl">
                            <div className="text-xl font-bold text-amber-400">{hintsUsed}</div>
                            <div className="text-[10px] text-slate-500">İpucu</div>
                        </div>
                    </div>

                    {/* XP Earned Banner */}
                    <div className="p-4 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 rounded-xl border border-amber-500/20 mb-6">
                        <div className="flex items-center justify-center gap-3">
                            <Star className="w-6 h-6 text-amber-400" />
                            <span className="text-2xl font-bold text-amber-400">+{xpEarned} XP</span>
                            <Star className="w-6 h-6 text-amber-400" />
                        </div>
                        <p className="text-xs text-slate-400 mt-1">Toplam kazanılan deneyim puanı</p>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                        <Button className="w-full" size="lg">
                            <ChevronRight className="w-5 h-5 mr-2" />
                            Sonraki Zindan
                        </Button>
                        <div className="grid grid-cols-2 gap-3">
                            <Button variant="secondary" onClick={handleRestart}>
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Tekrarla
                            </Button>
                            <Link href="/games">
                                <Button variant="secondary" className="w-full">
                                    Diğer Oyunlar
                                </Button>
                            </Link>
                        </div>
                        <Link href="/dashboard">
                            <Button variant="ghost" className="w-full text-slate-400 hover:text-white">
                                Dashboard'a Dön
                            </Button>
                        </Link>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen dungeon-bg">
            {/* Header */}
            <header className="sticky top-0 z-50 glass border-b border-slate-800">
                <div className="max-w-3xl mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <Link href="/dashboard">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>

                        {/* Hearts */}
                        <div className="flex items-center gap-1">
                            {[...Array(3)].map((_, i) => (
                                <Heart
                                    key={i}
                                    className={`w-6 h-6 ${i < hearts ? "text-red-500 fill-red-500" : "text-slate-700"}`}
                                />
                            ))}
                        </div>

                        {/* Score & Streak */}
                        <div className="flex items-center gap-4">
                            {streak >= 3 && (
                                <Badge variant="warning" className="animate-pulse">
                                    <Flame className="w-3 h-3 mr-1" />
                                    {streak}x
                                </Badge>
                            )}
                            <div className="flex items-center gap-1 text-amber-400">
                                <Zap className="w-5 h-5" />
                                <span className="font-bold">{score}</span>
                            </div>
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-3">
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-500"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <div className="flex justify-between mt-1 text-xs text-slate-500">
                            <span>Oda {currentCardIndex + 1}/{cards.length}</span>
                            <span>
                                <Clock className="w-3 h-3 inline mr-1" />
                                {timeLeft}s
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main content */}
            <main className="max-w-3xl mx-auto px-4 py-8">
                <Card gradient glow className="p-6">
                    {/* Question */}
                    <div className="mb-8">
                        <Badge variant={currentCard.difficulty <= 2 ? "success" : currentCard.difficulty <= 3 ? "warning" : "error"} className="mb-4">
                            {currentCard.difficulty <= 2 ? "Kolay" : currentCard.difficulty <= 3 ? "Orta" : "Zor"}
                        </Badge>
                        <h2 className="text-xl md:text-2xl font-semibold">{currentCard.question}</h2>
                    </div>

                    {/* Hint */}
                    {showHint && (
                        <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                            <div className="flex items-start gap-2">
                                <HelpCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                                <p className="text-amber-300 text-sm">{currentCard.hint}</p>
                            </div>
                        </div>
                    )}

                    {/* Options */}
                    <div className="space-y-3 mb-6">
                        {currentCard.options.map((option: string, index: number) => {
                            const isSelected = selectedOption === index;
                            const isCorrect = index === currentCard.correctIndex;
                            const showResult = isRevealed;

                            let optionClass = "p-4 rounded-xl border-2 transition-all cursor-pointer ";

                            if (showResult) {
                                if (isCorrect) {
                                    optionClass += "bg-emerald-500/20 border-emerald-500 text-emerald-300";
                                } else if (isSelected && !isCorrect) {
                                    optionClass += "bg-red-500/20 border-red-500 text-red-300";
                                } else {
                                    optionClass += "bg-slate-800/50 border-slate-700 text-slate-500";
                                }
                            } else {
                                if (isSelected) {
                                    optionClass += "bg-violet-500/20 border-violet-500 text-white";
                                } else {
                                    optionClass += "bg-slate-800/50 border-slate-700 text-slate-300 hover:border-slate-600 hover:bg-slate-800";
                                }
                            }

                            return (
                                <div
                                    key={index}
                                    onClick={() => handleOptionSelect(index)}
                                    className={optionClass}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-medium ${showResult && isCorrect ? "bg-emerald-500/30 text-emerald-400" :
                                            showResult && isSelected && !isCorrect ? "bg-red-500/30 text-red-400" :
                                                isSelected ? "bg-violet-500/30 text-violet-400" :
                                                    "bg-slate-700 text-slate-400"
                                            }`}>
                                            {showResult && isCorrect ? <Check className="w-4 h-4" /> :
                                                showResult && isSelected && !isCorrect ? <X className="w-4 h-4" /> :
                                                    String.fromCharCode(65 + index)}
                                        </div>
                                        <span>{option}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Feedback */}
                    {isRevealed && (
                        <div className={`mb-6 p-4 rounded-xl ${selectedOption === currentCard.correctIndex
                            ? "bg-emerald-500/10 border border-emerald-500/30"
                            : "bg-red-500/10 border border-red-500/30"
                            }`}>
                            <p className={selectedOption === currentCard.correctIndex ? "text-emerald-300" : "text-red-300"}>
                                {selectedOption === currentCard.correctIndex
                                    ? currentCard.feedback.correct
                                    : currentCard.feedback.incorrect}
                            </p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                        {!isRevealed ? (
                            <>
                                <Button
                                    variant="secondary"
                                    onClick={handleUseHint}
                                    disabled={showHint}
                                    className="flex-shrink-0"
                                >
                                    <HelpCircle className="w-4 h-4 mr-2" />
                                    İpucu
                                </Button>
                                <Button
                                    onClick={handleSubmit}
                                    disabled={selectedOption === null}
                                    className="flex-1"
                                >
                                    Cevapla
                                </Button>
                            </>
                        ) : (
                            <Button onClick={handleNextCard} className="w-full">
                                {currentCardIndex >= cards.length - 1 ? "Tamamla" : "Sonraki Soru"}
                                <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                        )}
                    </div>
                </Card>
            </main>
        </div>
    );
}

export default function DungeonPlayPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center dungeon-bg">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-violet-500 animate-spin mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-white">Zindan Hazırlanıyor...</h2>
                </div>
            </div>
        }>
            <DungeonContent />
        </Suspense>
    );
}
