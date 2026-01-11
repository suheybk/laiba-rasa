"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    BookOpen,
    Plus,
    Search,
    Filter,
    MoreVertical,
    Calendar,
    Star,
    Gamepad2,
    ArrowRight,
    Loader2,
    Clock
} from "lucide-react";

// Simple relative time formatter (native JS, no external dependency)
function formatRelativeTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "az önce";
    if (diffMins < 60) return `${diffMins} dakika önce`;
    if (diffHours < 24) return `${diffHours} saat önce`;
    if (diffDays < 7) return `${diffDays} gün önce`;
    return date.toLocaleDateString("tr-TR");
}

// Types
interface Note {
    id: string;
    title: string;
    subject: string | null;
    topic: string | null;
    qualityScore: number;
    updatedAt: string;
    _count: {
        gameSessions: number;
    }
}

export default function NotesPage() {
    const [notes, setNotes] = useState<Note[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchNotes = async () => {
            try {
                const response = await fetch("/api/notes");
                if (response.ok) {
                    const data = await response.json();
                    setNotes(data);
                }
            } catch (error) {
                console.error("Failed to fetch notes:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchNotes();
    }, []);

    const filteredNotes = notes.filter(note =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.subject?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen page-transition">
            <header className="sticky top-0 z-50 glass border-b border-slate-800">
                <div className="max-w-5xl mx-auto px-4 py-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-xl font-bold">Notlarım</h1>
                            <p className="text-sm text-slate-400">
                                Tüm ders notların ve oyunların burada
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative flex-1 md:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <Input
                                    placeholder="Notlarda ara..."
                                    className="pl-9 bg-slate-900/50"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <Link href="/notes/new">
                                <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Yeni Not
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 py-8">
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
                    </div>
                ) : filteredNotes.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredNotes.map((note) => (
                            <Link key={note.id} href={`/notes/${note.id}`}>
                                <Card gradient className="card-hover h-full flex flex-col cursor-pointer group">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                                <BookOpen className="w-5 h-5 text-violet-400" />
                                            </div>
                                            <Badge variant={note.qualityScore >= 80 ? "success" : "default"}>
                                                %{note.qualityScore}
                                            </Badge>
                                        </div>
                                        <CardTitle className="line-clamp-2 min-h-[3rem]">
                                            {note.title}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex-1 flex flex-col justify-end">
                                        <div className="space-y-3">
                                            {note.subject && (
                                                <div className="text-sm text-slate-400 font-medium px-2 py-1 rounded bg-slate-800/50 inline-block">
                                                    {note.subject}
                                                </div>
                                            )}

                                            <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 pt-3 border-t border-slate-700/50">
                                                <div className="flex items-center gap-1 text-xs text-slate-500">
                                                    <Clock className="w-3 h-3" />
                                                    {formatRelativeTime(note.updatedAt)}
                                                </div>
                                                <div className="flex gap-2 justify-end">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0 text-violet-400 hover:text-violet-300 hover:bg-violet-500/20"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            window.location.href = `/games/dungeon?noteId=${note.id}`;
                                                        }}
                                                    >
                                                        <Gamepad2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <div className="w-20 h-20 rounded-2xl bg-slate-800/50 flex items-center justify-center mx-auto mb-6">
                            <BookOpen className="w-10 h-10 text-slate-600" />
                        </div>
                        <h2 className="text-xl font-bold mb-2">Henüz notun yok</h2>
                        <p className="text-slate-400 max-w-sm mx-auto mb-8">
                            İlk notunu oluşturarak öğrenmeye ve oyun oynamaya başla. CRAQ sistemi senin için hazır!
                        </p>
                        <Link href="/notes/new">
                            <Button size="lg" className="bg-gradient-to-r from-violet-600 to-indigo-600">
                                <Plus className="w-5 h-5 mr-2" />
                                İlk Notunu Oluştur
                            </Button>
                        </Link>
                    </div>
                )}
            </main>
        </div>
    );
}
