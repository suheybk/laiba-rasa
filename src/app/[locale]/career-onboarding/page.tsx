"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
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
    LogIn,
    UserPlus,
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
    questionTr: string;
    questionEn: string;
    suggestedJobs: string;
    categoryTag: string;
}

interface ValueOption {
    key: string;
    label: string;
    labelEn: string;
    categorySlugs: string[];
}

// ============================================
// STATIC DATA — Levels & Values
// ============================================
const LEVELS: LevelOption[] = [
    { key: "PRIMARY", label: "İlkokul (6-10 yaş)", labelEn: "Primary School" },
    { key: "MIDDLE", label: "Ortaokul (11-14 yaş)", labelEn: "Middle School" },
    { key: "HIGH", label: "Lise (15-18 yaş)", labelEn: "High School" },
    { key: "UNIVERSITY", label: "Üniversite", labelEn: "University" },
    { key: "ADULT", label: "Yetişkin / Profesyonel", labelEn: "Adult / Professional" },
];

const VALUES: ValueOption[] = [
    { key: "innovation", label: "Yenilikçilik — Yeni şeyler keşfetmek", labelEn: "Innovation", categorySlugs: ["ai", "metaverse", "science"] },
    { key: "helping", label: "Yardımseverlik — İnsanlara yardım etmek", labelEn: "Helping Others", categorySlugs: ["health", "psychology", "education"] },
    { key: "creativity", label: "Yaratıcılık — Tasarlamak ve üretmek", labelEn: "Creativity", categorySlugs: ["design", "gaming", "marketing"] },
    { key: "security", label: "Güvenlik — Korumak ve savunmak", labelEn: "Security", categorySlugs: ["cyber", "law", "environment"] },
    { key: "leadership", label: "Liderlik — Yönetmek ve strateji kurmak", labelEn: "Leadership", categorySlugs: ["finance", "data", "robotics"] },
];

// ============================================
// SCENE CONFIG
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
// LOCALSTORAGE HELPERS
// ============================================
const STORAGE_KEY = "laiba_onboarding";

function saveOnboarding(data: Record<string, unknown>) {
    if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
}

function loadOnboarding(): Record<string, unknown> | null {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
}

// ============================================
// MAIN COMPONENT — GUEST MODE
// ============================================
export default function CareerOnboardingPage() {
    const params = useParams();
    const locale = (params?.locale as string) || "tr";

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentScene, setCurrentScene] = useState(1);
    const [completed, setCompleted] = useState(false);

    // Data from API
    const [categories, setCategories] = useState<CategoryOption[]>([]);
    const [questions, setQuestions] = useState<QuestionItem[]>([]);

    // Scene selections
    const [selectedWorlds, setSelectedWorlds] = useState<string[]>([]);
    const [selectedLevel, setSelectedLevel] = useState<string>("");
    const [questionAnswers, setQuestionAnswers] = useState<Record<string, number>>({});
    const [selectedValue, setSelectedValue] = useState<string>("");

    // Computed results
    const [topCategory, setTopCategory] = useState<CategoryOption | null>(null);
    const [heroType, setHeroType] = useState<string>("");

    // Load categories and questions from public API
    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [catRes, qRes] = await Promise.all([
                fetch("/api/career/categories"),
                fetch("/api/career/questions"),
            ]);

            const catJson = await catRes.json();
            const qJson = await qRes.json();

            if (catJson.success && catJson.data) {
                // Filter out the "cross" category
                const filteredCats = catJson.data.filter((c: CategoryOption) => c.slug !== "cross");
                setCategories(filteredCats);
            }

            if (qJson.success && qJson.data) {
                setQuestions(qJson.data);
            }

            // Restore previous progress if any
            const saved = loadOnboarding();
            if (saved) {
                if (saved.selectedWorlds) setSelectedWorlds(saved.selectedWorlds as string[]);
                if (saved.selectedLevel) setSelectedLevel(saved.selectedLevel as string);
                if (saved.questionAnswers) setQuestionAnswers(saved.questionAnswers as Record<string, number>);
                if (saved.selectedValue) setSelectedValue(saved.selectedValue as string);
                if (saved.currentScene) setCurrentScene(saved.currentScene as number);
            }
        } catch (err) {
            setError("Veri yüklenirken bir hata oluştu: " + (err as Error).message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Save progress to localStorage on every change
    useEffect(() => {
        if (!loading) {
            saveOnboarding({
                selectedWorlds,
                selectedLevel,
                questionAnswers,
                selectedValue,
                currentScene,
            });
        }
    }, [selectedWorlds, selectedLevel, questionAnswers, selectedValue, currentScene, loading]);

    // Compute results when completing
    const computeResults = () => {
        // Simple scoring: count which categories got the most engagement
        const scores: Record<string, number> = {};

        // World selections → direct score boost
        for (const catId of selectedWorlds) {
            const cat = categories.find((c) => c.id === catId);
            if (cat) {
                scores[cat.slug] = (scores[cat.slug] || 0) + 3;
            }
        }

        // Question answers → weighted by score
        for (const [qId, score] of Object.entries(questionAnswers)) {
            const q = questions.find((qi) => qi.id === qId);
            if (q && q.categoryTag) {
                const tags = q.categoryTag.split(",").map((t) => t.trim().toLowerCase());
                for (const tag of tags) {
                    // Map tag to category slug
                    const mapped = mapTagToSlug(tag);
                    if (mapped) {
                        scores[mapped] = (scores[mapped] || 0) + score;
                    }
                }
            }
        }

        // Value selection → boost
        const valueOpt = VALUES.find((v) => v.key === selectedValue);
        if (valueOpt) {
            for (const slug of valueOpt.categorySlugs) {
                scores[slug] = (scores[slug] || 0) + 2;
            }
        }

        // Find top category
        let maxSlug = "";
        let maxScore = 0;
        for (const [slug, sc] of Object.entries(scores)) {
            if (sc > maxScore) {
                maxScore = sc;
                maxSlug = slug;
            }
        }

        const topCat = categories.find((c) => c.slug === maxSlug) || categories[0];
        setTopCategory(topCat);

        // Map to hero type
        const heroNames: Record<string, string> = {};
        for (const cat of categories) {
            heroNames[cat.slug] = cat.worldNameTr;
        }
        setHeroType(getHeroName(maxSlug));

        setCompleted(true);
        setCurrentScene(6);

        // Save final results
        saveOnboarding({
            selectedWorlds,
            selectedLevel,
            questionAnswers,
            selectedValue,
            currentScene: 6,
            completed: true,
            topCategorySlug: maxSlug,
            scores,
        });
    };

    // Submit current scene
    const submitScene = () => {
        setError(null);

        switch (currentScene) {
            case 1:
                if (selectedWorlds.length < 1) {
                    setError("En az 1 dünya seçmelisin!");
                    return;
                }
                setCurrentScene(2);
                break;
            case 2:
                if (!selectedLevel) {
                    setError("Seviye seçmelisin!");
                    return;
                }
                setCurrentScene(3);
                break;
            case 3:
                setCurrentScene(4);
                break;
            case 4:
                setCurrentScene(5);
                break;
            case 5:
                if (!selectedValue) {
                    setError("Bir değer seçmelisin!");
                    return;
                }
                computeResults();
                break;
        }
    };

    // Split questions into two scenes
    const scene3Questions = questions.slice(0, Math.ceil(questions.length / 2));
    const scene4Questions = questions.slice(Math.ceil(questions.length / 2));
    const currentQuestions = currentScene === 3 ? scene3Questions : scene4Questions;

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
                                : currentScene === 1
                                    ? "Hangi Dünyalar Seni Çeker?"
                                    : currentScene === 2
                                        ? "Eğitim Seviyen Nedir?"
                                        : currentScene === 3
                                            ? "İlk Görev — Sorular"
                                            : currentScene === 4
                                                ? "Kapasite Bölümü — Sorular"
                                                : "Hangi Değer Seni Tanımlar?"}
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {/* ========== SCENE 1: World Selection ========== */}
                        {currentScene === 1 && (
                            <div>
                                <p className="text-slate-400 text-center mb-4">
                                    Seni en çok ilgilendiren 1–3 dünya seç
                                </p>
                                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                                    {categories.map((cat) => {
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
                        {currentScene === 2 && (
                            <div className="space-y-3">
                                {LEVELS.map((opt) => (
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

                        {/* ========== SCENE 3 & 4: Questions ========== */}
                        {(currentScene === 3 || currentScene === 4) && (
                            <div className="space-y-5">
                                <div className="text-center p-3 rounded-xl bg-violet-500/10 border border-violet-500/20 mb-4">
                                    <p className="text-violet-300 text-sm font-medium">
                                        🎯 Her konu için ilgi seviyeni seç
                                    </p>
                                    <p className="text-slate-500 text-xs mt-1">
                                        Doğru/yanlış cevap yok — sadece seni ne kadar ilgilendiriyor onu seç!
                                    </p>
                                </div>
                                {currentQuestions.map((q, idx) => (
                                    <div key={q.id} className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                                        <p className="text-sm text-slate-300 mb-4">
                                            <span className="text-violet-400 font-bold mr-2">{idx + 1}.</span>
                                            {q.questionTr}
                                        </p>
                                        <div className="flex gap-1.5 sm:gap-2">
                                            {[
                                                { score: 1, emoji: "😐", label: "Pek değil" },
                                                { score: 2, emoji: "🤔", label: "Biraz" },
                                                { score: 3, emoji: "😊", label: "İlgimi çeker" },
                                                { score: 4, emoji: "😍", label: "Çok sever!" },
                                                { score: 5, emoji: "🔥", label: "Bayılırım!" },
                                            ].map(({ score, emoji, label }) => (
                                                <button
                                                    key={score}
                                                    onClick={() =>
                                                        setQuestionAnswers({ ...questionAnswers, [q.id]: score })
                                                    }
                                                    className={`flex-1 py-2.5 px-1 rounded-xl text-center transition-all duration-200 ${questionAnswers[q.id] === score
                                                        ? "bg-violet-500 text-white scale-105 shadow-lg shadow-violet-500/30 border-2 border-violet-400"
                                                        : "bg-slate-700/80 text-slate-400 hover:bg-slate-600 border-2 border-transparent"
                                                        }`}
                                                >
                                                    <div className="text-lg sm:text-xl">{emoji}</div>
                                                    <div className="text-[9px] sm:text-[10px] mt-0.5 leading-tight font-medium">{label}</div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* ========== SCENE 5: Value Choice ========== */}
                        {currentScene === 5 && (
                            <div className="space-y-3">
                                {VALUES.map((opt) => (
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
                                            {topCategory?.icon || "⭐"}
                                        </div>
                                    </div>
                                    <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                                        <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                                        {heroType || "Kahraman"}
                                    </h3>
                                    <p className="text-slate-400 mt-1">
                                        {topCategory?.worldNameTr || "Senin dünyan"}
                                    </p>
                                </div>

                                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                                    <p className="text-emerald-400 text-sm">
                                        Kariyer keşif yolculuğun başladı! Kayıt olarak profilini kaydet, oyun oynadıkça profilin gelişsin ve sana en uygun meslekleri keşfet.
                                    </p>
                                </div>

                                {/* CTA: Register to save results */}
                                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                    <Link href={`/${locale}/auth/register`}>
                                        <Button className="w-full sm:w-auto bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white px-8 py-3 text-base">
                                            <UserPlus className="w-5 h-5 mr-2" />
                                            Ücretsiz Kayıt Ol — Sonuçlarını Kaydet
                                        </Button>
                                    </Link>
                                    <Link href={`/${locale}/auth/login`}>
                                        <Button variant="outline" className="w-full sm:w-auto">
                                            <LogIn className="w-4 h-4 mr-2" />
                                            Zaten Hesabım Var
                                        </Button>
                                    </Link>
                                </div>

                                {/* Browse careers */}
                                <Link
                                    href={`/${locale}/careers`}
                                    className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors inline-flex items-center gap-1"
                                >
                                    15 Kariyer Dünyasını Keşfet
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
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

                                <Button onClick={submitScene}>
                                    <ArrowRight className="w-4 h-4 mr-2" />
                                    Devam Et
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card >

                {/* Skip option */}
                {
                    !completed && (
                        <div className="text-center mt-6">
                            <Link
                                href={`/${locale}/careers`}
                                className="text-sm text-slate-500 hover:text-slate-400 transition-colors"
                            >
                                Kariyer kataloğuna git →
                            </Link>
                        </div>
                    )
                }
            </div >
        </div >
    );
}

// ============================================
// HELPERS
// ============================================
function mapTagToSlug(tag: string): string | null {
    const map: Record<string, string> = {
        "yapay zeka": "ai", "ai": "ai", "zeka": "ai",
        "metaverse": "metaverse", "sanal": "metaverse",
        "veri": "data", "data": "data", "analitik": "data",
        "siber": "cyber", "blockchain": "cyber", "güvenlik": "cyber",
        "robotik": "robotics", "robot": "robotics", "otonom": "robotics",
        "sağlık": "health", "biyoteknoloji": "health", "bio": "health",
        "çevre": "environment", "sürdürülebilirlik": "environment", "yeşil": "environment",
        "hukuk": "law", "etik": "law", "regülasyon": "law",
        "pazarlama": "marketing", "iletişim": "marketing", "medya": "marketing",
        "eğitim": "education", "koçluk": "education", "mentor": "education",
        "tasarım": "design", "sanat": "design", "yaratıcı": "design",
        "finans": "finance", "ekonomi": "finance", "altın": "finance",
        "psikoloji": "psychology", "ruh": "psychology", "zihin": "psychology",
        "oyun": "gaming", "e-spor": "gaming", "gaming": "gaming",
        "bilim": "science", "uzay": "science", "kuantum": "science",
    };
    return map[tag.toLowerCase()] || null;
}

function getHeroName(slug: string): string {
    const heroes: Record<string, string> = {
        ai: "Kod Büyücüsü",
        metaverse: "Dijital Diyar Kurucusu",
        data: "Veri Kâşifi",
        cyber: "Siber Kalkan",
        robotics: "Makine Ustası",
        health: "Şifa Bilgini",
        environment: "Yeşil Muhafız",
        law: "Adalet Bekçisi",
        marketing: "Ses Efsanesi",
        education: "Bilge Mentor",
        design: "Sanat Ustası",
        finance: "Altın Stratejist",
        psychology: "Zihin Okuyucu",
        gaming: "Arena Efsanesi",
        science: "Yıldız Kaşifi",
    };
    return heroes[slug] || "Kahraman";
}
