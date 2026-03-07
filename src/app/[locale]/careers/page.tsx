"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Search,
    Filter,
    Briefcase,
    ArrowRight,
    Loader2,
    ChevronDown,
    Trophy,
} from "lucide-react";

// ============================================
// TYPES
// ============================================
interface Category {
    id: string;
    slug: string;
    nameTr: string;
    nameEn: string;
    icon: string;
    colorHex: string;
    jobCount: number;
}

interface Job {
    id: string;
    nameTr: string;
    nameEn: string;
    yearPredicted: number;
    realizationStatus: string;
    category: {
        slug: string;
        nameTr: string;
        nameEn: string;
        icon: string;
        colorHex: string;
    };
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    REALIZED: { label: "✅ Gerçekleşti", color: "text-emerald-400" },
    EMERGING: { label: "🌱 Başlangıç", color: "text-yellow-400" },
    PENDING: { label: "⏳ Beklemede", color: "text-blue-400" },
    NOT_YET: { label: "🔮 Gelecekte", color: "text-slate-400" },
    LIFECYCLE_END: { label: "🔄 Dönüşüyor", color: "text-red-400" },
};

// ============================================
// MAIN COMPONENT
// ============================================
export default function CareerCatalogPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingJobs, setLoadingJobs] = useState(false);

    // Filters
    const [selectedCategory, setSelectedCategory] = useState<string>("");
    const [selectedStatus, setSelectedStatus] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [page, setPage] = useState(1);
    const [totalJobs, setTotalJobs] = useState(0);
    const [hasMore, setHasMore] = useState(false);

    // Fetch categories
    useEffect(() => {
        fetch("/api/career/categories")
            .then((r) => r.json())
            .then((j) => {
                if (j.success) setCategories(j.data);
            })
            .finally(() => setLoading(false));
    }, []);

    // Fetch jobs with filters
    const fetchJobs = useCallback(async (resetPage = false) => {
        setLoadingJobs(true);
        const p = resetPage ? 1 : page;
        const params = new URLSearchParams();
        if (selectedCategory) params.set("category", selectedCategory);
        if (selectedStatus) params.set("status", selectedStatus);
        if (searchQuery) params.set("search", searchQuery);
        params.set("page", String(p));
        params.set("pageSize", "30");

        try {
            const res = await fetch(`/api/career/jobs?${params}`);
            const json = await res.json();
            if (json.success) {
                if (resetPage || p === 1) {
                    setJobs(json.data.items);
                } else {
                    setJobs((prev) => [...prev, ...json.data.items]);
                }
                setTotalJobs(json.data.total);
                setHasMore(json.data.hasMore);
                if (resetPage) setPage(1);
            }
        } finally {
            setLoadingJobs(false);
        }
    }, [selectedCategory, selectedStatus, searchQuery, page]);

    useEffect(() => {
        fetchJobs(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCategory, selectedStatus]);

    // Search debounce
    useEffect(() => {
        const timer = setTimeout(() => fetchJobs(true), 300);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-violet-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen px-4 py-8 page-transition">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Hero Section */}
                <div className="text-center space-y-4 py-8">
                    <Badge variant="info">🚀 Geleceğin 295 Mesleği</Badge>
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-violet-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                        Kariyer Kataloğu
                    </h1>
                    <p className="text-slate-400 max-w-2xl mx-auto">
                        Yapay zekadan uzay bilimine, metaverse tasarımından siber güvenliğe — geleceğin
                        tüm mesleklerini keşfet. Hangi dünya seni bekliyor?
                    </p>
                    <Link href="/career-onboarding">
                        <Button className="mt-4">
                            <Trophy className="w-4 h-4 mr-2" />
                            Kariyer Keşfine Başla
                        </Button>
                    </Link>
                </div>

                {/* Category Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                    <button
                        onClick={() => setSelectedCategory("")}
                        className={`p-3 rounded-xl border-2 transition-all text-center ${!selectedCategory
                            ? "border-violet-500 bg-violet-500/20"
                            : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                            }`}
                    >
                        <div className="text-lg mb-1">🌐</div>
                        <div className="text-xs text-slate-300">Tümü</div>
                        <div className="text-[10px] text-slate-500">{totalJobs || 295}</div>
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat.slug}
                            onClick={() =>
                                setSelectedCategory(cat.slug === selectedCategory ? "" : cat.slug)
                            }
                            className={`p-3 rounded-xl border-2 transition-all text-center ${selectedCategory === cat.slug
                                ? "border-violet-500 bg-violet-500/20 scale-105"
                                : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                                }`}
                        >
                            <div className="text-lg mb-1">{cat.icon}</div>
                            <div className="text-xs text-slate-300 leading-tight truncate">
                                {cat.nameTr.split(" ")[0]}
                            </div>
                            <div className="text-[10px] text-slate-500">{cat.jobCount}</div>
                        </button>
                    ))}
                </div>

                {/* Search & Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Meslek ara... (ör: yapay zeka, robot, veri)"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-sm focus:border-violet-500 focus:outline-none transition-colors"
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="pl-10 pr-8 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-sm appearance-none focus:border-violet-500 focus:outline-none cursor-pointer min-w-[180px]"
                        >
                            <option value="">Tüm Durumlar</option>
                            <option value="REALIZED">✅ Gerçekleşti</option>
                            <option value="EMERGING">🌱 Başlangıç</option>
                            <option value="PENDING">⏳ Beklemede</option>
                            <option value="NOT_YET">🔮 Henüz Gerçekleşmedi</option>
                            <option value="LIFECYCLE_END">🔄 Dönüşüyor</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                    </div>
                </div>

                {/* Results count */}
                <div className="text-sm text-slate-500">
                    {totalJobs} meslek bulundu
                </div>

                {/* Jobs List */}
                <div className="grid gap-3">
                    {jobs.map((job) => {
                        const status = STATUS_LABELS[job.realizationStatus] || STATUS_LABELS.NOT_YET;
                        return (
                            <Link href={`/careers/${job.id}`} key={job.id} className="block group">
                                <Card className="hover:border-violet-500/50 transition-all bg-slate-900/50 border-slate-800">
                                    <CardContent className="flex items-center gap-4 py-4">
                                        <div
                                            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                                            style={{ backgroundColor: job.category?.colorHex + "20" }}
                                        >
                                            {job.category?.icon || "💼"}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium truncate group-hover:text-violet-400 transition-colors">
                                                {job.nameTr}
                                            </div>
                                            <div className="text-xs text-slate-500 truncate">
                                                {job.nameEn} • {job.category?.nameTr}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 shrink-0">
                                            <span className="text-xs text-slate-500 hidden sm:inline">
                                                {job.yearPredicted}
                                            </span>
                                            <span className={`text-xs ${status.color}`}>{status.label}</span>
                                            <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-violet-400 transition-colors" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        );
                    })}
                </div>

                {/* Load More */}
                {
                    hasMore && (
                        <div className="text-center">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setPage((p) => p + 1);
                                    fetchJobs(false);
                                }}
                                disabled={loadingJobs}
                            >
                                {loadingJobs ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <ArrowRight className="w-4 h-4 mr-2" />
                                )}
                                Daha Fazla Göster
                            </Button>
                        </div>
                    )
                }

                {/* CTA */}
                <Card gradient glow>
                    <CardHeader className="text-center">
                        <CardTitle>Hangi Meslek Sana Uygun?</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center space-y-4">
                        <p className="text-slate-400 text-sm">
                            295 meslek arasından sana en uygun olanları keşfetmek için kariyer keşif
                            yolculuğuna çık! Oyun oynarken profilin oluşsun.
                        </p>
                        <Link href="/career-onboarding">
                            <Button>
                                <Briefcase className="w-4 h-4 mr-2" />
                                Ücretsiz Başla
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div >
    );
}
