"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    ArrowLeft,
    User,
    Star,
    Trophy,
    Target,
    Flame,
    Zap,
    Clock,
    TrendingUp,
    Loader2,
    LogIn
} from "lucide-react";

interface ProfileData {
    isDemo: boolean;
    user: {
        displayName: string;
        username: string;
        avatarUrl: string | null;
    };
    xp: {
        total: number;
        level: number;
        progress: {
            currentLevel: number;
            nextLevel: number;
            currentLevelXP: number;
            nextLevelXP: number;
            xpProgress: number;
            xpNeeded: number;
            progressPercent: number;
        };
    };
    stats: {
        totalGamesPlayed: number;
        totalCorrectAnswers: number;
        totalQuestionsAnswered: number;
        accuracy: number;
        currentStreak: number;
        bestStreak: number;
        lastPlayedAt?: string;
        memberSince?: string;
    };
}

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch('/api/profile');
                const data = await res.json();

                if (data.success) {
                    setProfile(data.data);
                } else {
                    setError(data.error || "Profil yüklenemedi");
                }
            } catch (err) {
                setError("Bağlantı hatası");
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
                <Card className="max-w-md w-full p-8 text-center bg-slate-900 border-slate-800">
                    <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                        <User className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Profil Yüklenemedi</h2>
                    <p className="text-slate-400 mb-6">{error}</p>
                    <Link href="/dashboard">
                        <Button>Dashboard'a Dön</Button>
                    </Link>
                </Card>
            </div>
        );
    }

    if (!profile) return null;

    const { user, xp, stats } = profile;

    return (
        <div className="min-h-screen bg-slate-950">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
                <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-4">
                    <Link href="/dashboard">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <h1 className="text-xl font-bold">Profilim</h1>
                    {profile.isDemo && (
                        <Badge variant="warning">Demo</Badge>
                    )}
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
                {/* Demo Banner */}
                {profile.isDemo && (
                    <Card className="p-4 bg-amber-500/10 border-amber-500/30">
                        <div className="flex items-center gap-3">
                            <LogIn className="w-5 h-5 text-amber-400" />
                            <div className="flex-1">
                                <p className="text-amber-200 font-medium">Demo Modu</p>
                                <p className="text-sm text-amber-200/70">Giriş yaparak gerçek profil oluştur</p>
                            </div>
                            <Link href="/auth/login">
                                <Button size="sm">Giriş Yap</Button>
                            </Link>
                        </div>
                    </Card>
                )}

                {/* Profile Card */}
                <Card className="p-6 bg-slate-900 border-slate-800">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-3xl font-bold">
                            {user.displayName?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">{user.displayName}</h2>
                            <p className="text-slate-400">@{user.username}</p>
                        </div>
                    </div>

                    {/* Level & XP */}
                    <div className="p-4 bg-slate-800/50 rounded-xl mb-4">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <Star className="w-5 h-5 text-amber-400" />
                                <span className="font-bold text-lg">Seviye {xp.level}</span>
                            </div>
                            <span className="text-slate-400 text-sm">
                                {xp.total} XP
                            </span>
                        </div>

                        {/* XP Progress Bar */}
                        <div className="h-3 bg-slate-700 rounded-full overflow-hidden mb-2">
                            <div
                                className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-500"
                                style={{ width: `${xp.progress.progressPercent}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-xs text-slate-500">
                            <span>Seviye {xp.progress.currentLevel}</span>
                            <span>{xp.progress.xpNeeded} XP kaldı</span>
                            <span>Seviye {xp.progress.nextLevel}</span>
                        </div>
                    </div>
                </Card>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <Card className="p-4 bg-slate-900 border-slate-800">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                                <Trophy className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{stats.totalGamesPlayed}</div>
                                <div className="text-xs text-slate-500">Toplam Oyun</div>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4 bg-slate-900 border-slate-800">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
                                <Target className="w-5 h-5 text-violet-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{stats.accuracy}%</div>
                                <div className="text-xs text-slate-500">Doğruluk</div>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4 bg-slate-900 border-slate-800">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                                <Flame className="w-5 h-5 text-amber-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{stats.currentStreak}</div>
                                <div className="text-xs text-slate-500">Günlük Seri</div>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4 bg-slate-900 border-slate-800">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-lg bg-rose-500/20 flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-rose-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{stats.bestStreak}</div>
                                <div className="text-xs text-slate-500">En İyi Seri</div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Detailed Stats */}
                <Card className="p-6 bg-slate-900 border-slate-800">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-amber-400" />
                        Detaylı İstatistikler
                    </h3>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center py-2 border-b border-slate-800">
                            <span className="text-slate-400">Toplam Cevap</span>
                            <span className="font-bold">{stats.totalQuestionsAnswered}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-slate-800">
                            <span className="text-slate-400">Doğru Cevap</span>
                            <span className="font-bold text-emerald-400">{stats.totalCorrectAnswers}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-slate-800">
                            <span className="text-slate-400">Yanlış Cevap</span>
                            <span className="font-bold text-rose-400">
                                {stats.totalQuestionsAnswered - stats.totalCorrectAnswers}
                            </span>
                        </div>
                        {stats.lastPlayedAt && (
                            <div className="flex justify-between items-center py-2">
                                <span className="text-slate-400">Son Oyun</span>
                                <span className="font-bold text-slate-300">
                                    {new Date(stats.lastPlayedAt).toLocaleDateString('tr-TR')}
                                </span>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-4">
                    <Link href="/games">
                        <Button className="w-full" size="lg">
                            <Trophy className="w-5 h-5 mr-2" />
                            Oyna
                        </Button>
                    </Link>
                    <Link href="/notes">
                        <Button variant="secondary" className="w-full" size="lg">
                            📚 Notlarım
                        </Button>
                    </Link>
                </div>
            </main>
        </div>
    );
}
