"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
    RotateCcw
} from "lucide-react";

// Mock game data
const mockCards = [
    {
        id: "1",
        type: "DEFINITION",
        question: "Mitokondri nedir?",
        options: [
            "ATP üreten, çift zarlı bir hücre organeli",
            "Protein sentezi yapan organel",
            "Hücre bölünmesini kontrol eden yapı",
            "Hücre zarını oluşturan yapı"
        ],
        correctIndex: 0,
        difficulty: 2,
        hint: "Hücrenin enerji santrali olarak bilinir.",
        feedback: {
            correct: "Harika! Mitokondri gerçekten ATP üreten organeldir.",
            incorrect: "Mitokondri hücrenin enerji santralidir ve ATP üretir."
        }
    },
    {
        id: "2",
        type: "DEFINITION",
        question: "ATP'nin açılımı nedir?",
        options: [
            "Adenin Tri Protein",
            "Adenozin Trifosfat",
            "Amino Tri Polimer",
            "Asit Tri Peptit"
        ],
        correctIndex: 1,
        difficulty: 1,
        hint: "Adenozin ile başlar.",
        feedback: {
            correct: "Doğru! ATP = Adenozin Trifosfat",
            incorrect: "ATP, Adenozin Trifosfat anlamına gelir."
        }
    },
    {
        id: "3",
        type: "GAP_FILL",
        question: "Kas yorgunluğu ____ tükendiğinde oluşur.",
        options: ["ATP", "DNA", "RNA", "Protein"],
        correctIndex: 0,
        difficulty: 3,
        hint: "Enerji molekülü ile ilgili.",
        feedback: {
            correct: "Mükemmel! ATP kasların çalışması için gerekli enerjiyi sağlar.",
            incorrect: "Kas yorgunluğu ATP tükendiğinde oluşur."
        }
    },
    {
        id: "4",
        type: "DEFINITION",
        question: "Hücre solunumu hangi organelde gerçekleşir?",
        options: [
            "Ribozom",
            "Golgi aygıtı",
            "Mitokondri",
            "Endoplazmik retikulum"
        ],
        correctIndex: 2,
        difficulty: 2,
        hint: "ATP üretimi ile ilgili.",
        feedback: {
            correct: "Doğru! Hücre solunumu mitokondride gerçekleşir.",
            incorrect: "Hücre solunumu mitokondride gerçekleşir ve ATP üretilir."
        }
    },
    {
        id: "5",
        type: "DEFINITION",
        question: "Mitokondri kaç zara sahiptir?",
        options: ["Bir", "İki", "Üç", "Dört"],
        correctIndex: 1,
        difficulty: 1,
        hint: "Çift zarlı bir organeldir.",
        feedback: {
            correct: "Harika! Mitokondri çift zarlıdır.",
            incorrect: "Mitokondri çift zarlı bir organeldir."
        }
    }
];

export default function DungeonPlayPage() {
    const router = useRouter();
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

    const currentCard = mockCards[currentCardIndex];
    const progress = ((currentCardIndex) / mockCards.length) * 100;

    // Timer
    useEffect(() => {
        if (gameOver || gameComplete || isRevealed) return;

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
    }, [currentCardIndex, gameOver, gameComplete, isRevealed]);

    const handleTimeout = () => {
        setHearts((prev) => prev - 1);
        setStreak(0);
        if (hearts <= 1) {
            setGameOver(true);
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
            setHearts((prev) => prev - 1);
            setStreak(0);

            if (hearts <= 1) {
                setGameOver(true);
            }
        }
    };

    const handleNextCard = () => {
        if (currentCardIndex >= mockCards.length - 1) {
            setGameComplete(true);
            return;
        }

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
        return (
            <div className="min-h-screen flex items-center justify-center px-4 dungeon-bg">
                <Card gradient glow className="w-full max-w-md p-8 text-center">
                    <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
                        <X className="w-10 h-10 text-red-400" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Oyun Bitti!</h2>
                    <p className="text-slate-400 mb-6">Canların tükendi, ama endişelenme - tekrar deneyebilirsin!</p>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="p-4 bg-slate-800 rounded-xl">
                            <div className="text-2xl font-bold text-gradient">{score}</div>
                            <div className="text-sm text-slate-500">Puan</div>
                        </div>
                        <div className="p-4 bg-slate-800 rounded-xl">
                            <div className="text-2xl font-bold text-emerald-400">{correctAnswers}/{currentCardIndex + 1}</div>
                            <div className="text-sm text-slate-500">Doğru</div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Button onClick={handleRestart} className="w-full">
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Tekrar Dene
                        </Button>
                        <Link href="/dashboard">
                            <Button variant="secondary" className="w-full">
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
        const accuracy = Math.round((correctAnswers / mockCards.length) * 100);
        const stars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : accuracy >= 50 ? 1 : 0;

        return (
            <div className="min-h-screen flex items-center justify-center px-4 dungeon-bg">
                <Card gradient glow className="w-full max-w-md p-8 text-center">
                    <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                        <Trophy className="w-10 h-10 text-emerald-400" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Tebrikler! 🎉</h2>
                    <p className="text-slate-400 mb-4">Bu zindanı başarıyla tamamladın!</p>

                    {/* Stars */}
                    <div className="flex justify-center gap-2 mb-6">
                        {[1, 2, 3].map((star) => (
                            <Star
                                key={star}
                                className={`w-10 h-10 ${star <= stars ? "text-amber-400 fill-amber-400" : "text-slate-700"}`}
                            />
                        ))}
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-8">
                        <div className="p-3 bg-slate-800 rounded-xl">
                            <div className="text-xl font-bold text-gradient">{score}</div>
                            <div className="text-xs text-slate-500">Puan</div>
                        </div>
                        <div className="p-3 bg-slate-800 rounded-xl">
                            <div className="text-xl font-bold text-emerald-400">{accuracy}%</div>
                            <div className="text-xs text-slate-500">Doğruluk</div>
                        </div>
                        <div className="p-3 bg-slate-800 rounded-xl">
                            <div className="text-xl font-bold text-amber-400">{hearts}</div>
                            <div className="text-xs text-slate-500">Can Kaldı</div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Button className="w-full">
                            Sonraki Zindan
                            <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                        <Link href="/dashboard">
                            <Button variant="secondary" className="w-full">
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
                            <span>Oda {currentCardIndex + 1}/{mockCards.length}</span>
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
                        {currentCard.options.map((option, index) => {
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
                                {currentCardIndex >= mockCards.length - 1 ? "Tamamla" : "Sonraki Soru"}
                                <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                        )}
                    </div>
                </Card>
            </main>
        </div>
    );
}
