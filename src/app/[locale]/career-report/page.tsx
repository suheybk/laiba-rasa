"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Trophy,
    Sparkles,
    ArrowRight,
    Loader2,
    RefreshCw,
    Share2,
    Briefcase,
    BarChart3,
    Download,
} from "lucide-react";
import { CareerPDFExport } from "@/components/features/career/pdf-export";

// ============================================
// TYPES
// ============================================
interface RadarPoint {
    category: string;
    categoryEn: string;
    slug: string;
    score: number;
    color: string;
    icon: string;
}

interface JobMatch {
    id: string;
    nameTr: string;
    nameEn: string;
    yearPredicted: number;
    realizationStatus: string;
    matchScore: number;
    category?: {
        nameTr: string;
        icon: string;
        colorHex: string;
    };
}

interface ReportData {
    heroType: string;
    primaryCategory: {
        id: string;
        slug: string;
        nameTr: string;
        nameEn: string;
        icon: string;
        colorHex: string;
        worldNameTr: string;
        heroNameTr: string;
        heroImage: string;
    } | null;
    radarData: RadarPoint[];
    topJobs: JobMatch[];
    confidenceScore: number;
    dataSessionsCount: number;
    version: number;
    isPremium?: boolean;
}

// ============================================
// RADAR CHART COMPONENT (SVG)
// ============================================
function RadarChart({ data }: { data: RadarPoint[] }) {
    const size = 320;
    const center = size / 2;
    const maxRadius = center - 40;
    const points = data.filter((d) => d.score > 0);
    const totalPoints = points.length || 1;

    // Generate polygon points
    function getPoint(index: number, radius: number): [number, number] {
        const angle = (Math.PI * 2 * index) / totalPoints - Math.PI / 2;
        return [
            center + radius * Math.cos(angle),
            center + radius * Math.sin(angle),
        ];
    }

    // Background rings
    const rings = [0.2, 0.4, 0.6, 0.8, 1.0];

    // Score polygon
    const scorePoints = points
        .map((p, i) => {
            const radius = (p.score / 100) * maxRadius;
            const [x, y] = getPoint(i, radius);
            return `${x},${y}`;
        })
        .join(" ");

    return (
        <div className="flex justify-center">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                {/* Background rings */}
                {rings.map((r) => (
                    <polygon
                        key={r}
                        points={points
                            .map((_, i) => getPoint(i, maxRadius * r).join(","))
                            .join(" ")}
                        fill="none"
                        stroke="rgba(148,163,184,0.1)"
                        strokeWidth="1"
                    />
                ))}

                {/* Axes */}
                {points.map((_, i) => {
                    const [x, y] = getPoint(i, maxRadius);
                    return (
                        <line
                            key={`axis-${i}`}
                            x1={center}
                            y1={center}
                            x2={x}
                            y2={y}
                            stroke="rgba(148,163,184,0.1)"
                            strokeWidth="1"
                        />
                    );
                })}

                {/* Score polygon */}
                {scorePoints && (
                    <polygon
                        points={scorePoints}
                        fill="rgba(139,92,246,0.15)"
                        stroke="rgba(139,92,246,0.8)"
                        strokeWidth="2"
                    />
                )}

                {/* Score dots */}
                {points.map((p, i) => {
                    const radius = (p.score / 100) * maxRadius;
                    const [x, y] = getPoint(i, radius);
                    return (
                        <circle
                            key={`dot-${i}`}
                            cx={x}
                            cy={y}
                            r="4"
                            fill={p.color}
                            stroke="white"
                            strokeWidth="1"
                        />
                    );
                })}

                {/* Labels */}
                {points.map((p, i) => {
                    const [x, y] = getPoint(i, maxRadius + 25);
                    return (
                        <text
                            key={`label-${i}`}
                            x={x}
                            y={y}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fill="rgba(148,163,184,0.7)"
                            fontSize="10"
                        >
                            {p.icon} {p.score.toFixed(0)}
                        </text>
                    );
                })}
            </svg>
        </div>
    );
}

// ============================================
// STATUS BADGE
// ============================================
function StatusBadge({ status }: { status: string }) {
    const config: Record<string, { label: string; color: string }> = {
        REALIZED: { label: "Gerçekleşti", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
        EMERGING: { label: "Başlangıç", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
        PENDING: { label: "Beklemede", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
        NOT_YET: { label: "Gelecekte", color: "bg-slate-500/20 text-slate-400 border-slate-500/30" },
        LIFECYCLE_END: { label: "Dönüşüyor", color: "bg-red-500/20 text-red-400 border-red-500/30" },
    };
    const c = config[status] || config.NOT_YET;
    return (
        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${c.color}`}>
            {c.label}
        </span>
    );
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function CareerReportPage() {
    const [loading, setLoading] = useState(true);
    const [report, setReport] = useState<ReportData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const printRef = useRef<HTMLDivElement>(null);

    const fetchReport = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/career/report");
            const json = (await res.json()) as any;
            if (json.success && json.data) {
                setReport(json.data);
            } else if (json.data === null) {
                setReport(null);
            } else {
                setError(json.error || "Failed");
            }
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReport();
    }, [fetchReport]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-violet-500 animate-spin" />
            </div>
        );
    }

    // No profile yet
    if (!report) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <Card gradient glow className="max-w-md w-full text-center">
                    <CardContent className="py-12 space-y-6">
                        <div className="w-20 h-20 rounded-full bg-violet-500/20 flex items-center justify-center mx-auto">
                            <Sparkles className="w-10 h-10 text-violet-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold mb-2">Kariyer Profilin Hazır Değil</h2>
                            <p className="text-slate-400 text-sm">
                                Kariyer keşif yolculuğuna başla ve geleceğin 295 mesleği arasından
                                sana en uygun olanları keşfet!
                            </p>
                        </div>
                        <Link href="/career-onboarding">
                            <Button>
                                <Trophy className="w-4 h-4 mr-2" />
                                Kariyer Keşfine Başla
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen px-4 py-8 page-transition">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* PDF Printable Content */}
                <div ref={printRef}>
                    {/* Header */}
                    <div className="text-center space-y-4">
                        {/* Hero Avatar */}
                        <div className="relative inline-block">
                            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-violet-500/30 to-cyan-500/30 flex items-center justify-center mx-auto border-2 border-violet-500/50 shadow-xl shadow-violet-500/20">
                                <div className="text-5xl">{report.primaryCategory?.icon || "⭐"}</div>
                            </div>
                            <Sparkles className="w-6 h-6 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
                        </div>

                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                                {report.heroType || "Kahraman"}
                            </h1>
                            <p className="text-slate-400">
                                {report.primaryCategory?.worldNameTr || "Kariyer Dünyası"}
                            </p>
                        </div>

                        {/* Confidence */}
                        <div className="flex justify-center gap-4">
                            <Badge variant="info">
                                <BarChart3 className="w-3 h-3 mr-1" />
                                Güven: %{Math.round(report.confidenceScore * 100)}
                            </Badge>
                            <Badge variant="info">
                                v{report.version} • {report.dataSessionsCount} oturum
                            </Badge>
                        </div>
                    </div>

                    {/* Radar Chart */}
                    <Card gradient glow>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-violet-400" />
                                Kariyer Pusulam
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <RadarChart data={report.radarData} />
                            {/* Legend */}
                            <div className="flex flex-wrap justify-center gap-2 mt-4">
                                {report.radarData
                                    .filter((d) => d.score > 0)
                                    .sort((a, b) => b.score - a.score)
                                    .slice(0, 5)
                                    .map((d) => (
                                        <span
                                            key={d.slug}
                                            className="text-xs px-2 py-1 rounded-full border border-slate-700 bg-slate-800/50"
                                            style={{ borderColor: d.color + "50" }}
                                        >
                                            {d.icon} {d.category}: {d.score.toFixed(0)}%
                                        </span>
                                    ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Top Jobs */}
                    <Card gradient glow>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Briefcase className="w-5 h-5 text-emerald-400" />
                                Sana En Uygun Meslekler
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {report.topJobs.map((job, i) => {
                                const isLocked = !report.isPremium && i >= 3;

                                return (
                                    <div
                                        key={job.id || i}
                                        className={`relative flex items-center gap-4 p-4 rounded-xl border transition-all ${isLocked
                                            ? "bg-slate-900/50 border-slate-800 pointer-events-none"
                                            : "bg-slate-800/50 border-slate-700 hover:border-violet-500/30"
                                            }`}
                                    >
                                        {isLocked && (
                                            <div className="absolute inset-0 z-10 backdrop-blur-[3px] bg-slate-900/40 rounded-xl flex items-center justify-center pointer-events-auto">
                                                <div className="flex flex-col items-center p-4">
                                                    <div className="px-2 py-0.5 rounded-full text-xs font-semibold mb-2 bg-violet-500/10 text-violet-400 border border-violet-500/30">
                                                        Premium
                                                    </div>
                                                    <span className="text-sm font-medium text-slate-300">Bu mesleği görmek için Premium'a geç</span>
                                                </div>
                                            </div>
                                        )}

                                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-lg font-bold shrink-0 ${isLocked ? "from-slate-800/50 to-slate-700/50 text-slate-500" : "from-violet-500/20 to-cyan-500/20 text-violet-400"
                                            }`}>
                                            {i + 1}
                                        </div>
                                        <div className={`flex-1 min-w-0 ${isLocked ? "opacity-30 blur-sm" : ""}`}>
                                            <div className="font-medium truncate">{job.nameTr}</div>
                                            <div className="text-xs text-slate-500 truncate">
                                                {job.nameEn} • {job.yearPredicted}
                                            </div>
                                        </div>
                                        <div className={`flex items-center gap-2 shrink-0 ${isLocked ? "opacity-30 blur-sm" : ""}`}>
                                            <StatusBadge status={job.realizationStatus} />
                                            <div className="text-xs font-medium text-violet-400">
                                                %{job.matchScore?.toFixed(0) || 0}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}

                            {!report.isPremium && (
                                <div className="mt-4 text-center p-6 rounded-xl border border-violet-500/20 bg-violet-500/5">
                                    <h4 className="text-lg font-semibold text-violet-400 mb-2">Listenin Tamamını Keşfet</h4>
                                    <p className="text-sm text-slate-400 mb-4 max-w-sm mx-auto">
                                        Sana en uygun 4. ve 5. meslekleri ve detaylı analizleri görmek için LAIBA Premium'a geçiş yap.
                                    </p>
                                    <Button className="bg-gradient-to-r from-violet-500 to-cyan-500 hover:from-violet-600 hover:to-cyan-600 text-white border-0">
                                        <Sparkles className="w-4 h-4 mr-2" />
                                        Tüm Raporun Kilidini Aç
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div> {/* end printable content */}

                {/* Actions */}
                <div className="flex flex-wrap justify-center gap-3">
                    <Button variant="outline" onClick={fetchReport}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Güncelle
                    </Button>
                    <CareerPDFExport targetRef={printRef} filename={`kariyer-raporum-${report.heroType || 'laiba'}`} />
                    <Button variant="outline">
                        <Share2 className="w-4 h-4 mr-2" />
                        Paylaş
                    </Button>
                    <Link href="/games">
                        <Button>
                            Oyun Oyna, Profilini Geliştir
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </Link>
                </div>

                {/* Tip */}
                <div className="text-center p-4 rounded-xl bg-violet-500/10 border border-violet-500/30">
                    <p className="text-sm text-violet-400">
                        💡 Ne kadar çok oyun oynarsan, profilin o kadar doğru hale gelir!
                        Dungeon, Arena ve Raid oynayarak kariyer pusulana veri ekle.
                    </p>
                </div>
            </div>
        </div>
    );
}
