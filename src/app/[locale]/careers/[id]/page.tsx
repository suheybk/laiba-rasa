"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {

    ArrowLeft,
    Briefcase,
    Calendar,
    Sparkles,
    Loader2,
    Compass,
    Shield,
    Zap,
    ArrowRight,
    Globe,
} from "lucide-react";

// ============================================
// TYPES
// ============================================
interface JobDetail {
    id: string;
    nameTr: string;
    nameEn: string;
    nameAr: string;
    descriptionTr: string;
    descriptionEn: string;
    descriptionAr: string;
    heroRoleTr: string;
    heroRoleEn: string;
    superPowerTr: string;
    superPowerEn: string;
    yearPredicted: number;
    realizationStatus: string;
    jobNumber: number;
    category: {
        id: string;
        slug: string;
        nameTr: string;
        nameEn: string;
        icon: string;
        colorHex: string;
        worldNameTr: string;
        worldNameEn: string;
        heroNameTr: string;
        heroNameEn: string;
        worldImage: string;
        heroImage: string;
        descriptionTr: string;
        descriptionEn: string;
    };
    relatedJobs: {
        id: string;
        nameTr: string;
        nameEn: string;
        yearPredicted: number;
        realizationStatus: string;
        heroRoleTr: string;
    }[];
    isPremium?: boolean;
}

const STATUS_CONFIG: Record<string, { label: string; emoji: string; color: string }> = {
    REALIZED: { label: "Gerçekleşti", emoji: "✅", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
    EMERGING: { label: "Başlangıç Aşamasında", emoji: "🌱", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
    PENDING: { label: "Gelişiyor", emoji: "⏳", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
    NOT_YET: { label: "Henüz Gerçekleşmedi", emoji: "🔮", color: "bg-slate-500/20 text-slate-400 border-slate-500/30" },
    LIFECYCLE_END: { label: "Dönüşüm Sürecinde", emoji: "🔄", color: "bg-red-500/20 text-red-400 border-red-500/30" },
};

// ============================================
// MAIN PAGE
// ============================================
export default function CareerJobDetailPage() {
    const params = useParams();
    const jobId = params?.id as string;
    const [job, setJob] = useState<JobDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!jobId) return;
        const fetchJob = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/career/jobs/${jobId}`);
                const json = (await res.json()) as any;
                if (json.success) {
                    setJob(json.data);
                } else {
                    setError(json.error || "Meslek bulunamadı");
                }
            } catch {
                setError("Bağlantı hatası");
            } finally {
                setLoading(false);
            }
        };
        fetchJob();
    }, [jobId]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-violet-500 animate-spin" />
            </div>
        );
    }

    if (error || !job) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <Card className="max-w-md w-full text-center p-8 bg-slate-900 border-slate-800">
                    <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                        <Briefcase className="w-8 h-8 text-red-400" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Meslek Bulunamadı</h2>
                    <p className="text-slate-400 mb-6">{error}</p>
                    <Link href="/careers">
                        <Button>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Kariyer Kataloğuna Dön
                        </Button>
                    </Link>
                </Card>
            </div>
        );
    }

    const statusInfo = STATUS_CONFIG[job.realizationStatus] || STATUS_CONFIG.NOT_YET;

    return (
        <div className="min-h-screen px-4 py-8 page-transition">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Back button */}
                <Link
                    href="/careers"
                    className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Kariyer Kataloğuna Dön
                </Link>

                {/* Hero Section */}
                <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-800">
                    {/* Background accent */}
                    <div
                        className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-10"
                        style={{ background: job.category.colorHex }}
                    />

                    <div className="relative p-8 md:p-12">
                        <div className="flex flex-col md:flex-row items-start gap-6">
                            {/* Icon */}
                            <div
                                className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shrink-0 border"
                                style={{
                                    backgroundColor: job.category.colorHex + "15",
                                    borderColor: job.category.colorHex + "30",
                                }}
                            >
                                {job.category.icon}
                            </div>

                            <div className="flex-1 space-y-3">
                                <div className="flex flex-wrap items-center gap-3">
                                    <h1 className="text-3xl md:text-4xl font-bold">{job.nameTr}</h1>
                                    <span className={`text-sm px-3 py-1 rounded-full border ${statusInfo.color}`}>
                                        {statusInfo.emoji} {statusInfo.label}
                                    </span>
                                </div>

                                <p className="text-lg text-slate-400">{job.nameEn}</p>

                                {job.descriptionTr && (
                                    <p className="text-slate-300 leading-relaxed mt-4">
                                        {job.descriptionTr}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <InfoCard
                        icon={<Calendar className="w-5 h-5 text-blue-400" />}
                        label="Tahmin Yılı"
                        value={job.yearPredicted.toString()}
                        bgColor="bg-blue-500/10"
                    />
                    <InfoCard
                        icon={<Globe className="w-5 h-5 text-violet-400" />}
                        label="Dünya"
                        value={job.category.worldNameTr || job.category.nameTr}
                        bgColor="bg-violet-500/10"
                    />
                    <InfoCard
                        icon={<Shield className="w-5 h-5 text-emerald-400" />}
                        label="Kahraman Rolü"
                        value={job.heroRoleTr || "—"}
                        bgColor="bg-emerald-500/10"
                    />
                    <InfoCard
                        icon={<Zap className="w-5 h-5 text-amber-400" />}
                        label="Süper Güç"
                        value={job.superPowerTr || "—"}
                        bgColor="bg-amber-500/10"
                    />
                </div>

                {/* Hero Role & Super Power detail */}
                {(job.heroRoleTr || job.superPowerTr) && (
                    <Card className="bg-slate-900/50 border-slate-800">
                        <CardContent className="p-6 md:p-8 space-y-6">
                            {job.heroRoleTr && (
                                <div>
                                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                                        <Shield className="w-5 h-5 text-emerald-400" />
                                        Kahraman Rolü
                                    </h3>
                                    <p className="text-slate-300 text-lg font-medium">
                                        {job.heroRoleTr}
                                    </p>
                                    {job.heroRoleEn && (
                                        <p className="text-slate-500 text-sm mt-1">{job.heroRoleEn}</p>
                                    )}
                                </div>
                            )}

                            {job.superPowerTr && (
                                <div>
                                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                                        <Zap className="w-5 h-5 text-amber-400" />
                                        Süper Güç
                                    </h3>
                                    <p className="text-slate-300 text-lg">
                                        {job.superPowerTr}
                                    </p>
                                    {job.superPowerEn && (
                                        <p className="text-slate-500 text-sm mt-1">{job.superPowerEn}</p>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Category Card */}
                <Card className="bg-slate-900/50 border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Compass className="w-5 h-5 text-violet-400" />
                            Kariyer Dünyası
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                            <div
                                className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl shrink-0"
                                style={{ backgroundColor: job.category.colorHex + "20" }}
                            >
                                {job.category.icon}
                            </div>
                            <div className="flex-1">
                                <div className="font-bold text-lg">{job.category.nameTr}</div>
                                <div className="text-sm text-slate-400">{job.category.nameEn}</div>
                                {job.category.descriptionTr && (
                                    <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                                        {job.category.descriptionTr}
                                    </p>
                                )}
                            </div>
                            <div className="text-right shrink-0">
                                <div className="text-sm text-slate-400">{job.category.worldNameTr}</div>
                                <div className="text-xs text-slate-500">{job.category.heroNameTr}</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Related Jobs */}
                {job.relatedJobs.length > 0 && (
                    <Card className="bg-slate-900/50 border-slate-800">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Briefcase className="w-5 h-5 text-cyan-400" />
                                Aynı Dünyadan Meslekler
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {job.relatedJobs.map((rj, i) => {
                                const rStatus = STATUS_CONFIG[rj.realizationStatus] || STATUS_CONFIG.NOT_YET;
                                const isLocked = !job.isPremium && i >= 2;

                                if (isLocked) {
                                    return (
                                        <div key={rj.id} className="relative flex items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-slate-800 cursor-not-allowed">
                                            <div className="absolute inset-0 z-10 backdrop-blur-[3px] bg-slate-900/40 rounded-xl flex items-center justify-center pointer-events-auto">
                                                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-xs text-violet-400 font-medium">
                                                    <Sparkles className="w-3 h-3" />
                                                    Premium
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0 opacity-40 blur-[2px]">
                                                <div className="font-medium truncate">{rj.nameTr}</div>
                                                <div className="text-xs text-slate-500">{rj.nameEn}</div>
                                            </div>
                                        </div>
                                    );
                                }

                                return (
                                    <Link key={rj.id} href={`/careers/${rj.id}`}>
                                        <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/50 border border-transparent hover:border-slate-700 transition-all group">
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium truncate group-hover:text-violet-400 transition-colors">
                                                    {rj.nameTr}
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    {rj.nameEn} • {rj.yearPredicted}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${rStatus.color}`}>
                                                    {rStatus.emoji}
                                                </span>
                                                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-violet-400 transition-colors" />
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </CardContent>
                    </Card>
                )}

                {/* CTA */}
                <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-violet-500/10 to-cyan-500/10 border border-violet-500/20">
                    <Sparkles className="w-8 h-8 text-violet-400 mx-auto mb-3" />
                    <h3 className="text-xl font-bold mb-2">Bu Meslek Sana Uygun mu?</h3>
                    <p className="text-slate-400 mb-4 text-sm">
                        Kariyer keşif yolculuğuna çık ve 295 meslek arasından sana en uygun olanları keşfet!
                    </p>
                    <div className="flex flex-wrap justify-center gap-3">
                        <Link href="/career-onboarding">
                            <Button>
                                <Compass className="w-4 h-4 mr-2" />
                                Kariyer Keşfine Başla
                            </Button>
                        </Link>
                        <Link href="/career-report">
                            <Button variant="outline">
                                Raporumu Gör
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

function InfoCard({
    icon,
    label,
    value,
    bgColor,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    bgColor: string;
}) {
    return (
        <Card className="p-4 bg-slate-900/50 border-slate-800">
            <div className={`w-10 h-10 rounded-xl ${bgColor} flex items-center justify-center mb-3`}>
                {icon}
            </div>
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">{label}</div>
            <div className="text-sm font-semibold truncate">{value}</div>
        </Card>
    );
}
