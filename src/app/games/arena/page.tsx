
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSound } from "@/hooks/use-sound";
import {
    ArrowLeft,
    Timer,
    Zap,
    Trophy,
    Target,
    RotateCcw,
    Loader2,
    Flame
} from "lucide-react";

interface GameCard {
    id: string;
    question: string;
    options: string[];
    correctIndex: number;
    difficulty: number;
    hint: string;
}

export default function ArenaGamePage() {
    const router = useRouter();
    const { playCorrect, playWrong, playLevelUp } = useSound();

    // Game Data
    const [cards, setCards] = useState<GameCard[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Game State
    const [isPlaying, setIsPlaying] = useState(false);
    const [gameComplete, setGameComplete] = useState(false);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);

    // Stats
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(60); // 60 seconds start
    const [streak, setStreak] = useState(0);
    const [bestStreak, setBestStreak] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [wrongCount, setWrongCount] = useState(0);

    // Fetch Game
    useEffect(() => {
        const fetchGame = async () => {
            try {
                const res = await fetch("/api/games/arena/start", { method: "POST" });
                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.details || "Oyun yüklenemedi");
                }

                setCards(data.cards);
                setIsLoading(false);
                // Auto start
                setIsPlaying(true);
            } catch (err: any) {
                setError(err.message);
                setIsLoading(false);
            }
        };

        fetchGame();
    }, []);

    // Timer Logic
    useEffect(() => {
        if (!isPlaying || gameComplete) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    endGame();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isPlaying, gameComplete]);

    const endGame = () => {
        setIsPlaying(false);
        setGameComplete(true);
    };

    const handleAnswer = (optionIndex: number) => {
        if (gameComplete) return;

        const currentCard = cards[currentCardIndex];
        const isCorrect = optionIndex === currentCard.correctIndex;

        if (isCorrect) {
            playCorrect(); // 🔊 Doğru cevap sesi
            // Correct Logic
            setScore(s => s + 100 + (streak * 10)); // Base + Streak Bonus
            setStreak(s => {
                const newStreak = s + 1;
                setBestStreak(b => Math.max(b, newStreak));
                return newStreak;
            });
            setCorrectCount(c => c + 1);

            // Time Bonus!
            setTimeLeft(t => t + 2); // +2 Seconds for correct answer
        } else {
            playWrong(); // 🔊 Yanlış cevap sesi
            // Wrong Logic
            setStreak(0);
            setWrongCount(w => w + 1);

            // Time Penalty!
            setTimeLeft(t => Math.max(0, t - 5)); // -5 Seconds penalty

            // Visual feedback could be added here
        }

        // Next Card
        if (currentCardIndex < cards.length - 1) {
            setCurrentCardIndex(prev => prev + 1);
        } else {
            // Loop functionality? Or End?
            // For Arena, usually loop or generate more.
            // For MVP, if cards run out, we end game or loop back randomly
            // Let's loop back to index 0 but maybe shuffle cards?
            // Simple: Loop
            setCurrentCardIndex(0);
        }
    };

    const restartGame = () => {
        window.location.reload();
    };

    if (error) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
                <Card className="max-w-md w-full p-8 text-center bg-slate-900 border-slate-800">
                    <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                        <Target className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Arena Başlatılamadı</h2>
                    <p className="text-slate-400 mb-6">{error}</p>
                    <div className="flex gap-4 justify-center">
                        <Button variant="outline" onClick={() => router.push("/dashboard")}>
                            Ana Sayfa
                        </Button>
                        <Button onClick={() => router.push("/notes/new")}>
                            Not Ekle
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 text-rose-500 animate-spin mx-auto mb-4" />
                    <p className="text-slate-400">Rakipler aranıyor...</p>
                </div>
            </div>
        );
    }

    // GAME OVER SCREEN
    if (gameComplete) {
        const totalAnswers = correctCount + wrongCount;
        const accuracy = totalAnswers > 0 ? Math.round((correctCount / totalAnswers) * 100) : 0;
        const xpEarned = score + (bestStreak * 20);
        const isPerfect = wrongCount === 0 && correctCount > 0;

        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 page-transition">
                <Card className="max-w-md w-full p-8 text-center bg-slate-900 border-slate-800 relative overflow-hidden animate-fade-in">
                    {/* Background Glow */}
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-rose-500 via-orange-500 to-rose-500" />

                    {/* Trophy with Glow */}
                    <div className="relative w-24 h-24 mx-auto mb-6">
                        <div className="absolute inset-0 bg-rose-500/30 rounded-full blur-xl animate-pulse" />
                        <div className="relative w-full h-full rounded-2xl bg-gradient-to-br from-rose-500 to-orange-600 flex items-center justify-center shadow-lg shadow-rose-500/30">
                            <Trophy className="w-12 h-12 text-white" />
                        </div>
                    </div>

                    <h1 className="text-3xl font-bold mb-2 text-white">Süre Doldu!</h1>

                    {/* Score Display */}
                    <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-400 mb-6">
                        {score}
                    </div>

                    {/* Achievement Badge */}
                    {isPerfect && (
                        <div className="mb-6">
                            <Badge variant="premium" className="animate-pulse">
                                🔥 Hatasız Oyun!
                            </Badge>
                        </div>
                    )}

                    {/* Stats Grid */}
                    <div className="grid grid-cols-4 gap-2 mb-6">
                        <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700">
                            <div className="text-xl font-bold text-emerald-400">{correctCount}</div>
                            <div className="text-[10px] text-slate-400">Doğru</div>
                        </div>
                        <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700">
                            <div className="text-xl font-bold text-rose-400">{wrongCount}</div>
                            <div className="text-[10px] text-slate-400">Yanlış</div>
                        </div>
                        <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700">
                            <div className="text-xl font-bold text-amber-400">{bestStreak}</div>
                            <div className="text-[10px] text-slate-400">En İyi Seri</div>
                        </div>
                        <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700">
                            <div className="text-xl font-bold text-violet-400">{accuracy}%</div>
                            <div className="text-[10px] text-slate-400">Doğruluk</div>
                        </div>
                    </div>

                    {/* XP Earned Banner */}
                    <div className="p-4 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 rounded-xl border border-amber-500/20 mb-6">
                        <div className="flex items-center justify-center gap-3">
                            <Zap className="w-6 h-6 text-amber-400" />
                            <span className="text-2xl font-bold text-amber-400">+{xpEarned} XP</span>
                            <Zap className="w-6 h-6 text-amber-400" />
                        </div>
                        <p className="text-xs text-slate-400 mt-1">Toplam kazanılan deneyim puanı</p>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                        <Button size="lg" className="w-full bg-rose-600 hover:bg-rose-700" onClick={restartGame}>
                            <RotateCcw className="w-5 h-5 mr-2" />
                            Tekrar Oyna
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

    // GAME DISPLAY
    const currentCard = cards[currentCardIndex];
    const progress = (timeLeft / 60) * 100;
    const progressColor = timeLeft > 30 ? 'bg-emerald-500' : timeLeft > 10 ? 'bg-amber-500' : 'bg-red-500';

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col page-transition">
            {/* Top Bar */}
            <div className="bg-slate-900/50 border-b border-slate-800 p-4 sticky top-0 z-10 backdrop-blur-md">
                <div className="max-w-2xl mx-auto">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-4">
                            <Link href="/games">
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <ArrowLeft className="w-4 h-4" />
                                </Button>
                            </Link>
                            <div className="flex items-center gap-2">
                                <Badge variant="default" className="text-rose-400 border-rose-400/30 bg-rose-400/10">
                                    ARENA
                                </Badge>
                                <div className="text-slate-400 text-sm hidden sm:block">Zamana Karşı</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Flame className={`w-5 h-5 ${streak > 2 ? 'text-amber-500 animate-pulse' : 'text-slate-600'}`} />
                                <span className={`font-bold ${streak > 2 ? 'text-amber-500' : 'text-slate-500'}`}>x{streak}</span>
                            </div>
                            <div className="font-mono text-2xl font-bold text-white w-20 text-right">
                                {score}
                            </div>
                        </div>
                    </div>

                    {/* Timer Bar */}
                    <div className="h-4 bg-slate-800 rounded-full overflow-hidden relative">
                        <div
                            className={`h-full transition-all duration-1000 ease-linear ${progressColor}`}
                            style={{ width: `${progress}%` }}
                        />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] font-bold text-white mix-blend-difference">
                            {timeLeft}s
                        </div>
                    </div>
                </div>
            </div>

            {/* Game Content */}
            <main className="flex-1 flex items-center justify-center p-4">
                <div className="max-w-2xl w-full">
                    <Card className="bg-slate-900 border-slate-800 p-8 shadow-2xl relative overflow-hidden">
                        {streak > 4 && (
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Flame className="w-64 h-64" />
                            </div>
                        )}

                        <div className="mb-8 relative z-10">
                            <h2 className="text-2xl md:text-3xl font-bold text-center leading-relaxed">
                                {currentCard.question}
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                            {currentCard.options.map((option, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleAnswer(idx)}
                                    className="p-6 rounded-xl bg-slate-800/50 border-2 border-slate-700 
                                    hover:bg-slate-800 hover:border-rose-500 hover:shadow-lg hover:shadow-rose-500/20 
                                    transition-all duration-200 text-left group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-700 text-slate-300 flex items-center justify-center font-bold text-sm group-hover:bg-rose-500 group-hover:text-white transition-colors">
                                            {String.fromCharCode(65 + idx)}
                                        </div>
                                        <div className="font-medium text-lg">{option}</div>
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className="mt-8 text-center">
                            <p className="text-sm text-slate-500 animate-pulse">
                                Doğru cevap +2 sn kazandırır!
                            </p>
                        </div>
                    </Card>
                </div>
            </main>
        </div>
    );
}
