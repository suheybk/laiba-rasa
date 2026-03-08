// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { Link } from "@/lib/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {

    Brain,
    Plus,
    BookOpen,
    Gamepad2,
    Trophy,
    TrendingUp,
    Clock,
    Target,
    ChevronRight,
    Menu,
    X,
    Home,
    FileText,
    BarChart3,
    Settings,
    LogOut,
    Crown,
    Loader2,
    User,
    Star
} from "lucide-react";

export default function DashboardPage() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const t = useTranslations("Dashboard");
    const tNav = useTranslations("Navigation");
    const tCommon = useTranslations("Common");
    const [data, setData] = useState({
        stats: { totalNotes: 0, gameHours: 0, avgMastery: 0, rank: "-" },
        recentNotes: [] as any[],
        masteryData: [] as any[],
        leaderboard: [] as any[]
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch("/api/dashboard");
                const leaderboardRes = await fetch("/api/leaderboard");

                if (res.ok && leaderboardRes.ok) {
                    const json = (await res.json()) as any;
                    const leaderboardJson = await leaderboardRes.json();
                    setData({ ...json, leaderboard: leaderboardJson.leaderboard });
                }
            } catch (error: any) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const stats = [
        { label: t("totalNotes"), value: data.stats.totalNotes, icon: FileText, color: "violet" },
        { label: t("gamesPlayed"), value: `${data.stats.gameHours}s`, icon: Clock, color: "emerald" },
        { label: t("masteryLevel"), value: `%${data.stats.avgMastery}`, icon: Target, color: "amber" },
        { label: t("streak"), value: data.stats.rank, icon: Trophy, color: "indigo" },
    ];

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-slate-900/95 border-r border-slate-800
        transform transition-transform duration-300 lg:transform-none
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
                <div className="flex flex-col h-full p-4">
                    {/* Logo */}
                    <div className="flex items-center justify-between mb-8">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                                <Brain className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold text-gradient">LAIBA</span>
                        </Link>
                        <button
                            className="lg:hidden text-slate-400 hover:text-white"
                            onClick={() => setSidebarOpen(false)}
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Subscription badge */}
                    <div className="mb-6 p-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/30">
                        <div className="flex items-center gap-2 text-amber-400 mb-1">
                            <Crown className="w-4 h-4" />
                            <span className="text-sm font-medium">Trial</span>
                        </div>
                        <p className="text-xs text-slate-400">2 {t("days")}</p>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-1">
                        <NavItem href="/dashboard" icon={Home} label={tNav("home")} active />
                        <NavItem href="/profile" icon={User} label={tNav("profile")} />
                        <NavItem href="/notes" icon={FileText} label={tNav("notes")} />
                        <NavItem href="/games" icon={Gamepad2} label={tNav("games")} />
                        <NavItem href="/stats" icon={BarChart3} label={t("viewStats")} />
                        <NavItem href="/settings" icon={Settings} label={tNav("settings")} />
                    </nav>

                    {/* User section */}
                    <div className="pt-4 border-t border-slate-800">
                        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-medium">
                                K
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium truncate">User</div>
                                <div className="text-xs text-slate-500 truncate">Pro Trial</div>
                            </div>
                            <LogOut className="w-4 h-4 text-slate-500" />
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 min-h-screen">
                {/* Mobile header */}
                <header className="lg:hidden sticky top-0 z-30 glass border-b border-slate-800 px-4 py-3">
                    <div className="flex items-center justify-between">
                        <button onClick={() => setSidebarOpen(true)}>
                            <Menu className="w-6 h-6" />
                        </button>
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                                <Brain className="w-5 h-5 text-white" />
                            </div>
                        </Link>
                        <div className="w-6" /> {/* Spacer */}
                    </div>
                </header>

                <div className="p-4 lg:p-8 page-transition">
                    {/* Welcome section */}
                    <div className="mb-8">
                        <h1 className="text-2xl lg:text-3xl font-bold mb-2">
                            {t("welcome")}! 👋
                        </h1>
                        <p className="text-slate-400">
                            {t("todayProgress")}
                        </p>
                    </div>

                    {/* Quick actions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        <Link href="/notes/new">
                            <Card gradient className="p-6 card-hover cursor-pointer border-dashed border-2 border-violet-500/30 hover:border-violet-500/60">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center">
                                        <Plus className="w-6 h-6 text-violet-400" />
                                    </div>
                                    <div>
                                        <div className="font-semibold">{t("createNote")}</div>
                                        <div className="text-sm text-slate-400">CRAQ</div>
                                    </div>
                                </div>
                            </Card>
                        </Link>

                        {data.recentNotes.length > 0 ? (
                            <Link href={`/games/dungeon?noteId=${data.recentNotes[0].id}`}>
                                <Card gradient className="p-6 card-hover cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                                            <Gamepad2 className="w-6 h-6 text-emerald-400" />
                                        </div>
                                        <div>
                                            <div className="font-semibold">{t("playGame")}</div>
                                            <div className="text-sm text-slate-400">{data.recentNotes[0].title}</div>
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        ) : (
                            <Card gradient className="p-6 opacity-50 cursor-not-allowed">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                                        <Gamepad2 className="w-6 h-6 text-emerald-400" />
                                    </div>
                                    <div>
                                        <div className="font-semibold">{t("playGame")}</div>
                                    </div>
                                </div>
                            </Card>
                        )}
                    </div>

                    {/* Stats grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {stats.map((stat) => (
                            <Card key={stat.label} gradient className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-lg bg-${stat.color}-500/20 flex items-center justify-center`}>
                                        <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold">{stat.value}</div>
                                        <div className="text-xs text-slate-500">{stat.label}</div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>

                    <div className="grid lg:grid-cols-2 gap-6">
                        {/* Recent notes */}
                        <Card gradient>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="text-lg">{t("recentNotes")}</CardTitle>
                                <Link href="/notes" className="text-sm text-violet-400 hover:text-violet-300">
                                    {tCommon("viewAll")} →
                                </Link>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {data.recentNotes.length > 0 ? (
                                    data.recentNotes.map((note) => (
                                        <Link key={note.id} href={`/notes/${note.id}`}>
                                            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors cursor-pointer">
                                                <div className="flex items-center gap-3">
                                                    <BookOpen className="w-5 h-5 text-slate-400" />
                                                    <div>
                                                        <div className="text-sm font-medium">{note.title}</div>
                                                        <div className="text-xs text-slate-500">{note.updatedAt}</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant={note.qualityScore >= 80 ? "success" : note.qualityScore >= 60 ? "warning" : "error"}>
                                                        %{note.qualityScore}
                                                    </Badge>
                                                    <ChevronRight className="w-4 h-4 text-slate-500" />
                                                </div>
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <div className="text-center py-4 text-slate-500">
                                        {t("noNotes")}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Mastery progress */}
                        <Card gradient>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="text-lg">{t("masteryLevel")}</CardTitle>
                                <Link href="/stats" className="text-sm text-violet-400 hover:text-violet-300">
                                    {t("viewStats")} →
                                </Link>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {data.masteryData.length > 0 ? (
                                    data.masteryData.map((item) => (
                                        <div key={item.subject}>
                                            <div className="flex justify-between text-sm mb-2">
                                                <span>{item.subject}</span>
                                                <span className={`text-${item.color}-400`}>{item.mastery}%</span>
                                            </div>
                                            <div className="mastery-bar">
                                                <div
                                                    className="mastery-fill"
                                                    style={{ width: `${item.mastery}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-4 text-slate-500">
                                        {tCommon("noData")}
                                    </div>
                                )}

                                <div className="pt-4 border-t border-slate-700">
                                    <div className="flex items-center gap-2 text-sm text-slate-400">
                                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                                        {tCommon("loading")}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Leaderboard Section */}
                        <Card gradient className="lg:col-span-2">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Trophy className="w-5 h-5 text-amber-500" />
                                    Leaderboard
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {data.leaderboard && data.leaderboard.length > 0 ? (
                                        data.leaderboard.map((user, index) => (
                                            <div key={user.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/30 hover:bg-slate-800/50 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className={`
                                                         w-8 h-8 rounded-full flex items-center justify-center font-bold
                                                         ${index === 0 ? 'bg-amber-500/20 text-amber-500' :
                                                            index === 1 ? 'bg-slate-400/20 text-slate-400' :
                                                                index === 2 ? 'bg-orange-700/20 text-orange-700' : 'bg-slate-800 text-slate-500'}
                                                     `}>
                                                        {user.rank || index + 1}
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400 font-bold text-xs uppercase">
                                                            {user.name.substring(0, 2)}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-sm">{user.name}</div>
                                                            {user.level && (
                                                                <div className="text-xs text-slate-500 flex items-center gap-1">
                                                                    <Star className="w-3 h-3 text-amber-400" />
                                                                    Level {user.level}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="text-sm font-bold text-amber-400">{user.xp || user.score} XP</div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-4 text-slate-500">
                                            {tCommon("loading")}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main >
        </div >
    );
}

// Navigation item component
function NavItem({
    href,
    icon: Icon,
    label,
    active = false
}: {
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    active?: boolean;
}) {
    return (
        <Link href={href}>
            <div className={`
        flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all
        ${active
                    ? "bg-violet-500/20 text-violet-400"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }
      `}>
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{label}</span>
            </div>
        </Link>
    );
}
