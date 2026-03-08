import { Link } from "@/lib/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";
import {

    Swords,
    Shield,
    Users,
    ArrowLeft,
    Lock,
    Play,
    Trophy,
    Star
} from "lucide-react";

export default function GamesPage() {
    const t = useTranslations("Games");
    const tCommon = useTranslations("Common");

    const gameModes = [
        {
            id: "dungeon",
            name: t("dungeon.title"),
            description: t("dungeon.description"),
            icon: Shield,
            color: "violet",
            available: true,
            stats: {
                floors: 5,
                rooms: 10,
                bestScore: 1250
            }
        },
        {
            id: "arena",
            name: t("arena.title"),
            description: t("arena.description"),
            icon: Swords,
            color: "rose",
            available: true,
            comingSoon: false,
            stats: {
                rank: "#142",
                wins: 24,
                losses: 8
            }
        },
        {
            id: "raid",
            name: t("raid.title"),
            description: t("raid.description"),
            icon: Users,
            color: "emerald",
            available: false,
            comingSoon: true,
            stats: {
                completed: 3,
                teammates: 12
            }
        }
    ];

    return (
        <div className="min-h-screen page-transition">
            <header className="sticky top-0 z-50 glass border-b border-slate-800">
                <div className="max-w-5xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold">{t("title")}</h1>
                            <p className="text-sm text-slate-400">{t("selectMode")}</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 py-8">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {gameModes.map((mode) => (
                        <Card
                            key={mode.id}
                            gradient
                            glow={mode.available}
                            className={`relative overflow-hidden transition-all duration-300 ${mode.available ? "card-hover" : "opacity-60"
                                }`}
                        >
                            {mode.comingSoon && (
                                <Badge variant="warning" className="absolute top-4 right-4">
                                    {t("raid.comingSoon")}
                                </Badge>
                            )}

                            <CardHeader className="pb-4">
                                <div className={`w-16 h-16 rounded-2xl bg-${mode.color}-500/20 flex items-center justify-center mb-4`}>
                                    <mode.icon className={`w-8 h-8 text-${mode.color}-400`} />
                                </div>
                                <CardTitle className="flex items-center gap-2">
                                    {mode.name}
                                    {!mode.available && <Lock className="w-4 h-4 text-slate-500" />}
                                </CardTitle>
                                <CardDescription>
                                    {mode.description}
                                </CardDescription>
                            </CardHeader>

                            <CardContent>
                                {/* Stats */}
                                {mode.available && mode.id === "dungeon" && (
                                    <div className="grid grid-cols-3 gap-2 mb-4">
                                        <div className="text-center p-2 bg-slate-800 rounded-lg">
                                            <div className="text-lg font-bold">{mode.stats.floors}</div>
                                            <div className="text-xs text-slate-500">{t("dungeon.cleared")}</div>
                                        </div>
                                        <div className="text-center p-2 bg-slate-800 rounded-lg">
                                            <div className="text-lg font-bold">{mode.stats.rooms}</div>
                                            <div className="text-xs text-slate-500">{t("dungeon.bosses")}</div>
                                        </div>
                                        <div className="text-center p-2 bg-slate-800 rounded-lg">
                                            <div className="text-lg font-bold flex items-center justify-center">
                                                <Star className="w-3 h-3 text-amber-400 mr-1" />
                                                {mode.stats.bestScore}
                                            </div>
                                            <div className="text-xs text-slate-500">Score</div>
                                        </div>
                                    </div>
                                )}

                                {mode.available ? (
                                    <Link href={`/games/${mode.id}`}>
                                        <Button className="w-full">
                                            <Play className="w-4 h-4 mr-2" />
                                            {t("play")}
                                        </Button>
                                    </Link>
                                ) : (
                                    <Button className="w-full" disabled>
                                        <Lock className="w-4 h-4 mr-2" />
                                        {t("raid.comingSoon")}
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Recent activity */}
                <div className="mt-12">
                    <h2 className="text-lg font-semibold mb-4">{tCommon("viewAll")}</h2>
                    <Card gradient className="p-4">
                        <div className="space-y-3">
                            {[
                                { mode: "Dungeon", topic: "Hücre Organelleri", score: 850, time: "2h" },
                                { mode: "Dungeon", topic: "Osmanlı Tarihi", score: 1200, time: "1d" },
                                { mode: "Dungeon", topic: "Türev", score: 920, time: "2d" },
                            ].map((game, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
                                            <Shield className="w-5 h-5 text-violet-400" />
                                        </div>
                                        <div>
                                            <div className="font-medium">{game.topic}</div>
                                            <div className="text-sm text-slate-500">{game.mode} • {game.time}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Trophy className="w-4 h-4 text-amber-400" />
                                        <span className="font-bold">{game.score}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </main>
        </div>
    );
}
