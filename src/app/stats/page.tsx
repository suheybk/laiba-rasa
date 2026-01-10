"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    BarChart3,
    Trophy,
    Target,
    Zap,
    Calendar,
    TrendingUp,
    Brain,
    Timer
} from "lucide-react";

export default function StatsPage() {
    // Mock data for visualization - in a real app this would come from an API
    const weeklyActivity = [
        { day: "Pzt", value: 45 },
        { day: "Sal", value: 70 },
        { day: "Çar", value: 30 },
        { day: "Per", value: 90 },
        { day: "Cum", value: 60 },
        { day: "Cmt", value: 20 },
        { day: "Paz", value: 85 },
    ];

    const topSubjects = [
        { name: "Biyoloji", score: 92, color: "emerald" },
        { name: "Tarih", score: 85, color: "amber" },
        { name: "Matematik", score: 78, color: "violet" },
        { name: "Edebiyat", score: 74, color: "rose" },
    ];

    return (
        <div className="min-h-screen p-4 lg:p-8 max-w-6xl mx-auto page-transition">
            <header className="mb-8">
                <h1 className="text-2xl lg:text-3xl font-bold mb-2 flex items-center gap-3">
                    <BarChart3 className="w-8 h-8 text-violet-500" />
                    İstatistikler
                </h1>
                <p className="text-slate-400">
                    Öğrenme yolculuğunun detaylı analizi
                </p>
            </header>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <StatCard
                    label="Toplam XP"
                    value="12,450"
                    icon={Zap}
                    color="amber"
                    trend="+12%"
                />
                <StatCard
                    label="Günlük Seri"
                    value="5 Gün"
                    icon={Trophy}
                    color="violet"
                    trend="Harika!"
                />
                <StatCard
                    label="Tamamlanan Konu"
                    value="14"
                    icon={Target}
                    color="emerald"
                    trend="+3 bu hafta"
                />
                <StatCard
                    label="Çalışma Süresi"
                    value="18.5s"
                    icon={Timer}
                    color="indigo"
                    trend="Hedefe yakın"
                />
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
                {/* Weekly Activity Chart */}
                <Card gradient>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-slate-400" />
                            Haftalık Aktivite
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64 flex items-end justify-between px-2 gap-2">
                            {weeklyActivity.map((day) => (
                                <div key={day.day} className="flex flex-col items-center flex-1 group">
                                    <div
                                        className="w-full bg-slate-700/50 rounded-t-lg transition-all duration-500 hover:bg-violet-500 relative"
                                        style={{ height: `${day.value}%` }}
                                    >
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-slate-700">
                                            {day.value} dk
                                        </div>
                                    </div>
                                    <div className="text-xs text-slate-500 mt-2 font-medium">{day.day}</div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Subject Mastery */}
                <Card gradient>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Brain className="w-5 h-5 text-slate-400" />
                            Konu Ustalığı
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {topSubjects.map((subject) => (
                            <div key={subject.name}>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-medium">{subject.name}</span>
                                    <span className={`text-${subject.color}-400 font-bold`}>{subject.score}%</span>
                                </div>
                                <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full bg-${subject.color}-500 rounded-full transition-all duration-1000`}
                                        style={{ width: `${subject.score}%` }}
                                    />
                                </div>
                            </div>
                        ))}

                        <div className="pt-4 border-t border-slate-800">
                            <div className="flex items-center gap-2 text-sm text-slate-400">
                                <TrendingUp className="w-4 h-4 text-emerald-400" />
                                <span>Biyoloji dersinde sınıf ortalamasının <strong>%15 üzerindesin</strong>!</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function StatCard({ label, value, icon: Icon, color, trend }: any) {
    return (
        <Card gradient className="p-4 items-center flex flex-col justify-center text-center group hover:bg-slate-800/50 transition-colors">
            <div className={`w-12 h-12 rounded-xl bg-${color}-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                <Icon className={`w-6 h-6 text-${color}-500`} />
            </div>
            <div className="text-2xl font-bold mb-1">{value}</div>
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-2">{label}</div>
            <div className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full inline-block">
                {trend}
            </div>
        </Card>
    );
}
