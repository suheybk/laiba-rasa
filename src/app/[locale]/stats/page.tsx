"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {

    BarChart3,
    Trophy,
    Target,
    Zap,
    TrendingUp,
    Brain,
    Timer,
    Loader2,
    LogIn,
    Flame,
    Gamepad2,
    Compass
} from "lucide-react";

export const runtime = "edge";


interface StatsData {
    user: {
        displayName: string;
        xp: number;
        level: number;
    };
    stats: {
        totalGamesPlayed: number;
        totalCorrectAnswers: number;
        totalQuestionsAnswered: number;
        accuracy: number;
        currentStreak: number;
        bestStreak: number;
    };
}

export default function StatsPage() {
    const { data: session, status } = useSession();
    const [data, setData] = useState<StatsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch("/api/profile");
                const json = (await res.json()) as any;
                if (json.success) {
                    setData({
                        user: {
                            displayName: json.data.user.displayName,
                            xp: json.data.xp.total,
                            level: json.data.xp.level,
                        },
                        stats: json.data.stats,
                    });
                } else {
                    setError(json.error || "Veriler yüklenemedi");
                }
            } catch {
                setError("Bağlantı hatası");
            } finally {
                setIsLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Card className="max-w-md w-full p-8 text-center bg-slate-900 border-slate-800">
                    <div className="w-16 h-16 rounded-full bg-violet-500/20 flex items-center justify-center mx-auto mb-4">
                        <LogIn className="w-8 h-8 text-violet-400" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">İstatistikler</h2>
                    <p className="text-slate-400 mb-6">
                        {error || "İstatistiklerini görmek için giriş yap"}
                    </p>
                    <Link href="/auth/login">
                        <Button className="w-full">Giriş Yap</Button>
                    </Link>
                </Card>
            </div>
        );
    }

    const { stats } = data;

    // Calculate derived stats
    const wrongAnswers = stats.totalQuestionsAnswered - stats.totalCorrectAnswers;
    const avgCorrectPerGame = stats.totalGamesPlayed > 0
        ? Math.round(stats.totalCorrectAnswers / stats.totalGamesPlayed * 10) / 10
        : 0;

    // Simple performance rating
    const performanceRating = stats.accuracy >= 80 ? "Mükemmel" :
        stats.accuracy >= 60 ? "İyi" :
            stats.accuracy >= 40 ? "Orta" : "Geliştirilebilir";

    const performanceColor = stats.accuracy >= 80 ? "emerald" :
        stats.accuracy >= 60 ? "violet" :
            stats.accuracy >= 40 ? "amber" : "rose";

    return (
        <div className="min-h-screen p-4 lg:p-8 max-w-6xl mx-auto page-transition">
            <header className="mb-8">
                <h1 className="text-2xl lg:text-3xl font-bold mb-2 flex items-center gap-3">
                    <BarChart3 className="w-8 h-8 text-violet-500" />
                    İstatistikler
                </h1>
                <p className="text-slate-400">
                    {data.user.displayName} — Seviye {data.user.level} • {data.user.xp} XP
                </p>
            </header>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <StatCard
                    label="Toplam XP"
                    value={data.user.xp.toLocaleString('tr-TR')}
                    icon={Zap}
                    color="amber"
                    trend={`Seviye ${data.user.level}`}
                />
                <StatCard
                    label="Günlük Seri"
                    value={`${stats.currentStreak} Gün`}
                    icon={Flame}
                    color="violet"
                    trend={`En iyi: ${stats.bestStreak}`}
                />
                <StatCard
                    label="Doğruluk"
                    value={`${stats.accuracy}%`}
                    icon={Target}
                    color="emerald"
                    trend={performanceRating}
                />
                <StatCard
                    label="Toplam Oyun"
                    value={stats.totalGamesPlayed.toString()}
                    icon={Gamepad2}
                    color="indigo"
                    trend={`${avgCorrectPerGame} doğru/oyun`}
                />
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
                {/* Answer Breakdown */}
                <Card className="bg-slate-900/50 border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Brain className="w-5 h-5 text-slate-400" />
                            Cevap Dağılımı
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {/* Accuracy Bar */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-medium">Doğruluk Oranı</span>
                                    <span className={`text-${performanceColor}-400 font-bold`}>
                                        {stats.accuracy}%
                                    </span>
                                </div>
                                <div className="h-4 bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-1000"
                                        style={{ width: `${stats.accuracy}%` }}
                                    />
                                </div>
                            </div>

                            {/* Stats Rows */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-center py-2 border-b border-slate-800">
                                    <span className="text-slate-400">Toplam Cevap</span>
                                    <span className="font-bold text-white">{stats.totalQuestionsAnswered}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-slate-800">
                                    <span className="text-slate-400 flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                        Doğru Cevap
                                    </span>
                                    <span className="font-bold text-emerald-400">{stats.totalCorrectAnswers}</span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-slate-400 flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-rose-500" />
                                        Yanlış Cevap
                                    </span>
                                    <span className="font-bold text-rose-400">{wrongAnswers}</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Performance Summary */}
                <Card className="bg-slate-900/50 border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-slate-400" />
                            Performans Özeti
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="p-4 rounded-xl bg-slate-800/50 text-center">
                            <div className={`text-4xl font-bold mb-1 text-${performanceColor}-400`}>
                                {performanceRating}
                            </div>
                            <div className="text-sm text-slate-500">Genel Performans</div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 rounded-xl bg-slate-800/30 text-center">
                                <Trophy className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                                <div className="text-xl font-bold">{stats.bestStreak}</div>
                                <div className="text-xs text-slate-500">En İyi Seri</div>
                            </div>
                            <div className="p-3 rounded-xl bg-slate-800/30 text-center">
                                <Timer className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
                                <div className="text-xl font-bold">{avgCorrectPerGame}</div>
                                <div className="text-xs text-slate-500">Ort. Doğru/Oyun</div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-800">
                            <div className="flex items-center gap-2 text-sm text-slate-400">
                                <TrendingUp className="w-4 h-4 text-emerald-400" />
                                <span>
                                    {stats.accuracy >= 70
                                        ? "Harika gidiyorsun! Doğruluk oranın çok iyi. 🎉"
                                        : "Oyun oynamaya devam et, performansın gelişecek! 💪"}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Link href="/games">
                    <Button className="w-full" size="lg">
                        <Gamepad2 className="w-5 h-5 mr-2" />
                        Oyun Oyna
                    </Button>
                </Link>
                <Link href="/career-report">
                    <Button variant="secondary" className="w-full" size="lg">
                        <Compass className="w-5 h-5 mr-2" />
                        Kariyer Raporu
                    </Button>
                </Link>
                <Link href="/profile">
                    <Button variant="outline" className="w-full" size="lg">
                        <Brain className="w-5 h-5 mr-2" />
                        Profilim
                    </Button>
                </Link>
            </div>
        </div>
    );
}

function StatCard({ label, value, icon: Icon, color, trend }: {
    label: string;
    value: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    trend: string;
}) {
    const colorMap: Record<string, { bg: string; text: string }> = {
        amber: { bg: "bg-amber-500/10", text: "text-amber-500" },
        violet: { bg: "bg-violet-500/10", text: "text-violet-500" },
        emerald: { bg: "bg-emerald-500/10", text: "text-emerald-500" },
        indigo: { bg: "bg-indigo-500/10", text: "text-indigo-500" },
    };
    const colors = colorMap[color] || colorMap.violet;

    return (
        <Card className="p-4 items-center flex flex-col justify-center text-center group hover:bg-slate-800/50 transition-colors bg-slate-900/50 border-slate-800">
            <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                <Icon className={`w-6 h-6 ${colors.text}`} />
            </div>
            <div className="text-2xl font-bold mb-1">{value}</div>
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-2">{label}</div>
            <div className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full inline-block">
                {trend}
            </div>
        </Card>
    );
}
