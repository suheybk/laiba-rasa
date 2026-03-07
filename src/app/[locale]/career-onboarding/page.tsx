"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    ArrowRight,
    ArrowLeft,
    Sparkles,
    Globe,
    User,
    Swords,
    Heart,
    Trophy,
    Loader2,
    Check,
} from "lucide-react";

// ============================================
// TYPES
// ============================================
interface CategoryOption {
    id: string;
    slug: string;
    nameTr: string;
    nameEn: string;
    icon: string;
    colorHex: string;
    worldNameTr: string;
    worldNameEn: string;
    worldImage: string;
}

interface LevelOption {
    key: string;
    label: string;
    labelEn: string;
}

interface QuestionItem {
    id: string;
    text: string;
    textEn: string;
    suggestedJobs: string;
    categoryTag: string;
}

interface ValueOption {
    key: string;
    label: string;
    labelEn: string;
    categorySlugs: string[];
}

interface SceneContent {
    title: string;
    titleEn?: string;
    type: string;
    instruction?: string;
    maxSelections?: number;
    options?: CategoryOption[] | LevelOption[] | ValueOption[];
    questions?: QuestionItem[];
}

interface OnboardingData {
    sessionId?: string;
    currentScene: number;
    totalScenes: number;
    sceneContent: SceneContent;
    completed?: boolean;
    profile?: Record<string, unknown>;
    primaryCategory?: CategoryOption;
}

// ============================================
// SCENE ICONS
// ============================================
const sceneIcons = [Globe, User, Swords, Swords, Heart, Trophy];
const sceneNames = [
    "Dünya Seçimi",
    "Seviye Belirleme",
    "İlk Görev",
    "Kapasite Bölümü",
    "Değer Seçimi",
    "Profilin Hazır!",
];

// ============================================
// MAIN COMPONENT
// ============================================
export default function CareerOnboardingPage() {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentScene, setCurrentScene] = useState(1);
    const [sceneContent, setSceneContent] = useState<SceneContent | null>(null);
    const [completed, setCompleted] = useState(false);
    const [profileResult, setProfileResult] = useState<Record<string, unknown> | null>(null);
    const [primaryCategory, setPrimaryCategory] = useState<CategoryOption | null>(null);

    // Scene-specific selections
    const [selectedWorlds, setSelectedWorlds] = useState<string[]>([]);
    const [selectedLevel, setSelectedLevel] = useState<string>("");
    const [questionAnswers, setQuestionAnswers] = useState<Record<string, number>>({});
    const [selectedValue, setSelectedValue] = useState<string>("");

    // Start onboarding
    const startOnboarding = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/career/onboarding", { method: "POST" });
            const json = (await res.json()) as any;
            if (!json.success) {
                setError(json.error || "Failed to start");
                return;
            }
            setCurrentScene(json.data.currentScene);
            setSceneContent(json.data.sceneContent);
        } catch (err) {
            setError("Network error: " + (err as Error).message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        startOnboarding();
    }, [startOnboarding]);

    // Submit scene and advance
    const submitScene = async () => {
        setSubmitting(true);
        setError(null);

        let selections: Record<string, unknown> = {};

        switch (currentScene) {
            case 1:
                if (selectedWorlds.length < 1) {
                    setError("En az 1 dünya seçmelisin!");
                    setSubmitting(false);
                    return;
                }
                selections = { categoryIds: selectedWorlds };
                break;
            case 2:
                if (!selectedLevel) {
                    setError("Seviye seçmelisin!");
                    setSubmitting(false);
                    return;
                }
                selections = { level: selectedLevel };
                break;
            case 3:
            case 4:
                selections = { answers: questionAnswers };
                break;
            case 5:
                if (!selectedValue) {
                    setError("Bir değer seçmelisin!");
                    setSubmitting(false);
                    return;
                }
                selections = { value: selectedValue };
                break;
            case 6:
                selections = { confirmed: true };
                break;
        }

        try {
            const res = await fetch("/api/career/onboarding", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sceneId: currentScene, selections }),
            });
            const json = (await res.json()) as any;

            if (!json.success) {
                setError(json.error || "Failed");
                setSubmitting(false);
                return;
            }

            if (json.data.completed) {
                setCompleted(true);
                setProfileResult(json.data.profile);
                setPrimaryCategory(json.data.primaryCategory);
                setCurrentScene(6);
            } else {
                setCurrentScene(json.data.currentScene);
                setSceneContent(json.data.sceneContent);
                // Reset scene-specific state
                setQuestionAnswers({});
            }
        } catch (err) {
            setError("Network error: " + (err as Error).message);
        } finally {
            setSubmitting(false);
        }
    };

    // ============================================
    // RENDER
    // ============================================
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-violet-500 animate-spin mx-auto mb-4" />
                    <p className="text-slate-400">Kariyer keşif yolculuğun başlıyor...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-8 page-transition">
            <div className="w-full max-w-3xl">
                {/* Progress Bar */}
                <div className="flex justify-center gap-2 mb-8">
                    {[1, 2, 3, 4, 5, 6].map((scene) => (
                        <div
                            key={scene}
                            className={`h-2 rounded-full transition-all duration-500 ${scene === currentScene
                                    ? "w-10 bg-gradient-to-r from-violet-500 to-cyan-500"
                                    : scene < currentScene
                                        ? "w-4 bg-emerald-500"
                                        : "w-2 bg-slate-700"
                                }`}
                        />
                    ))}
                </div>

                {/* Scene Label */}
                <div className="text-center mb-6">
                    <Badge variant="info" className="mb-2">
                        Sahne {currentScene} / 6 — {sceneNames[currentScene - 1]}
                    </Badge>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
                        {error}
                    </div>
                )}

                <Card gradient glow className="overflow-hidden">
                    <CardHeader className="text-center pb-4">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 flex items-center justify-center mx-auto mb-4">
                            {(() => {
                                const Icon = sceneIcons[currentScene - 1];
                                return <Icon className="w-10 h-10 text-violet-400" />;
                            })()}
                        </div>
                        <CardTitle className="text-2xl md:text-3xl">
                            {completed
                                ? "🎉 Kahraman Profilin Hazır!"
                                : sceneContent?.title || "Yükleniyor..."}
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {/* ========== SCENE 1: World Selection ========== */}
                        {currentScene === 1 && sceneContent?.options && (
                            <div>
                                <p className="text-slate-400 text-center mb-4">
                                    {sceneContent.instruction || "En çok 3 dünya seç"}
                                </p>
                                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                                    {(sceneContent.options as CategoryOption[]).map((cat) => {
                                        const isSelected = selectedWorlds.includes(cat.id);
                                        return (
                                            <button
                                                key={cat.id}
                                                onClick={() => {
                                                    if (isSelected) {
                                                        setSelectedWorlds(selectedWorlds.filter((w) => w !== cat.id));
                                                    } else if (selectedWorlds.length < 3) {
                                                        setSelectedWorlds([...selectedWorlds, cat.id]);
                                                    }
                                                }}
                                                className={`p-3 rounded-xl border-2 transition-all duration-300 text-center group ${isSelected
                                                        ? "border-violet-500 bg-violet-500/20 scale-105 shadow-lg shadow-violet-500/20"
                                                        : "border-slate-700 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800"
                                                    }`}
                                            >
                                                <div className="text-2xl mb-1">{cat.icon}</div>
                                                <div className="text-xs font-medium text-slate-300 leading-tight">
                                                    {cat.worldNameTr}
                                                </div>
                                                <div className="text-[10px] text-slate-500 mt-1 leading-tight">
                                                    {cat.nameTr.split(" ")[0]}
                                                </div>
                                                {isSelected && (
                                                    <div className="mt-1">
                                                        <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                                <p className="text-center text-xs text-slate-500 mt-3">
                                    {selectedWorlds.length}/3 seçili
                                </p>
                            </div>
                        )}

                        {/* ========== SCENE 2: Level Selection ========== */}
                        {currentScene === 2 && sceneContent?.options && (
                            <div className="space-y-3">
                                {(sceneContent.options as LevelOption[]).map((opt) => (
                                    <button
                                        key={opt.key}
                                        onClick={() => setSelectedLevel(opt.key)}
                                        className={`w-full p-4 rounded-xl border-2 transition-all text-left ${selectedLevel === opt.key
                                                ? "border-violet-500 bg-violet-500/20"
                                                : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                                            }`}
                                    >
                                        <div className="font-medium">{opt.label}</div>
                                        <div className="text-xs text-slate-500">{opt.labelEn}</div>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* ========== SCENE 3 & 4: Dungeon Questions ========== */}
                        {(currentScene === 3 || currentScene === 4) && sceneContent?.questions && (
                            <div className="space-y-4">
                                {sceneContent.questions.map((q, idx) => (
                                    <div key={q.id} className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                                        <p className="text-sm text-slate-300 mb-3">
                                            <span className="text-violet-400 font-bold mr-2">{idx + 1}.</span>
                                            {q.text}
                                        </p>
                                        <div className="flex gap-2">
                                            {[1, 2, 3, 4, 5].map((score) => (
                                                <button
                                                    key={score}
                                                    onClick={() =>
                                                        setQuestionAnswers({ ...questionAnswers, [q.id]: score })
                                                    }
                                                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${questionAnswers[q.id] === score
                                                            ? "bg-violet-500 text-white"
                                                            : "bg-slate-700 text-slate-400 hover:bg-slate-600"
                                                        }`}
                                                >
                                                    {score}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="flex justify-between text-[10px] text-slate-600 mt-1 px-1">
                                            <span>Hiç ilgimi çekmez</span>
                                            <span>Çok ilgimi çeker</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* ========== SCENE 5: Value Choice ========== */}
                        {currentScene === 5 && sceneContent?.options && (
                            <div className="space-y-3">
                                {(sceneContent.options as ValueOption[]).map((opt) => (
                                    <button
                                        key={opt.key}
                                        onClick={() => setSelectedValue(opt.key)}
                                        className={`w-full p-4 rounded-xl border-2 transition-all text-left ${selectedValue === opt.key
                                                ? "border-violet-500 bg-violet-500/20"
                                                : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                                            }`}
                                    >
                                        <div className="font-medium">{opt.label}</div>
                                        <div className="text-xs text-slate-500">{opt.labelEn}</div>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* ========== SCENE 6 / COMPLETED: Profile Result ========== */}
                        {completed && (
                            <div className="text-center space-y-6">
                                {/* Hero type reveal */}
                                <div className="relative">
                                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-violet-500/30 to-cyan-500/30 flex items-center justify-center mx-auto border-2 border-violet-500/50 shadow-xl shadow-violet-500/20">
                                        <div className="text-5xl">
                                            {primaryCategory?.icon || "⭐"}
                                        </div>
                                    </div>
                                    <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                                        <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                                        {(profileResult as Record<string, unknown>)?.heroType as string || "Kahraman"}
                                    </h3>
                                    <p className="text-slate-400 mt-1">
                                        {primaryCategory?.worldNameTr || "Senin dünyan"}
                                    </p>
                                </div>

                                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                                    <p className="text-emerald-400 text-sm">
                                        Kariyer keşif yolculuğun başladı! Oyun oynadıkça profilin gelişecek ve sana en uygun meslekleri keşfedeceksin.
                                    </p>
                                </div>

                                <div className="flex gap-3 justify-center">
                                    <Link href="/profile">
                                        <Button>
                                            <Trophy className="w-4 h-4 mr-2" />
                                            Profilimi Gör
                                        </Button>
                                    </Link>
                                    <Link href="/games">
                                        <Button variant="outline">
                                            <Swords className="w-4 h-4 mr-2" />
                                            Oyuna Başla
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* ========== Navigation ========== */}
                        {!completed && (
                            <div className="flex justify-between pt-4">
                                <Button
                                    variant="ghost"
                                    disabled={currentScene <= 1}
                                    className={currentScene <= 1 ? "invisible" : ""}
                                    onClick={() => {
                                        if (currentScene > 1) setCurrentScene(currentScene - 1);
                                    }}
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Geri
                                </Button>

                                <Button onClick={submitScene} disabled={submitting}>
                                    {submitting ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <ArrowRight className="w-4 h-4 mr-2" />
                                    )}
                                    {currentScene === 6 ? "Tamamla" : "Devam Et"}
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Skip option */}
                {!completed && (
                    <div className="text-center mt-6">
                        <Link
                            href="/games"
                            className="text-sm text-slate-500 hover:text-slate-400 transition-colors"
                        >
                            Kariyer keşfini atla →
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
