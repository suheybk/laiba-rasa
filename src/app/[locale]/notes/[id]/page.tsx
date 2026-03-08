"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {

    ArrowLeft,
    BookOpen,
    Link2,
    Lightbulb,
    HelpCircle,
    Gamepad2,
    Edit2,
    Trash2,
    Clock,
    Star,
    Loader2
} from "lucide-react";

interface Note {
    id: string;
    title: string;
    subject: string | null;
    topic: string | null;
    qualityScore: number;
    updatedAt: string;
    concepts: Array<{ id: string; term: string; definition: string; keywords: string[] }>;
    relationships: Array<{ id: string; type: string; description: string }>;
    applications: Array<{ id: string; scenario: string; context: string }>;
    questions: Array<{ id: string; text: string; difficulty: number }>;
}

// Demo not verileri
const demoNotes: Record<string, Note> = {
    "demo-1": {
        id: "demo-1",
        title: "Hücre Organelleri",
        subject: "Biyoloji",
        topic: "Hücre Biyolojisi",
        qualityScore: 85,
        updatedAt: new Date().toISOString(),
        concepts: [
            { id: "c1", term: "Mitokondri", definition: "Hücrenin enerji santrali, ATP üretir.", keywords: ["enerji", "ATP", "solunum"] },
            { id: "c2", term: "Ribozom", definition: "Protein sentezinden sorumlu organel.", keywords: ["protein", "sentez", "RNA"] },
            { id: "c3", term: "Golgi Aygıtı", definition: "Proteinleri paketler ve hücre dışına gönderir.", keywords: ["paketleme", "salgı"] },
        ],
        relationships: [
            { id: "r1", type: "PRODUCES", description: "Mitokondri ATP üretir" },
            { id: "r2", type: "REQUIRES", description: "Ribozom mRNA gerektirir" },
        ],
        applications: [
            { id: "a1", scenario: "Kas yorgunluğu ATP tükendiğinde oluşur.", context: "Spor bilimi" },
        ],
        questions: [
            { id: "q1", text: "Mitokondri neden 'enerji santrali' olarak adlandırılır?", difficulty: 2 },
            { id: "q2", text: "Protein sentezinde hangi organeller rol oynar?", difficulty: 3 },
        ],
    },
    "demo-2": {
        id: "demo-2",
        title: "Osmanlı Kuruluş Dönemi",
        subject: "Tarih",
        topic: "Osmanlı Tarihi",
        qualityScore: 78,
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
        concepts: [
            { id: "c1", term: "Osman Bey", definition: "Osmanlı Devleti'nin kurucusu (1299).", keywords: ["kurucu", "beylik"] },
            { id: "c2", term: "Söğüt", definition: "Osmanlı Beyliği'nin ilk merkezi.", keywords: ["başkent", "merkez"] },
            { id: "c3", term: "Uç Beyliği", definition: "Sınır bölgelerinde kurulan Türk beylikleri.", keywords: ["sınır", "gaza"] },
        ],
        relationships: [
            { id: "r1", type: "LEADS_TO", description: "Moğol baskısı Türk göçüne yol açtı" },
        ],
        applications: [
            { id: "a1", scenario: "Coğrafi konumun devlet büyümesine etkisi", context: "Jeopolitik" },
        ],
        questions: [
            { id: "q1", text: "Osmanlı Beyliği neden hızla büyüdü?", difficulty: 3 },
        ],
    },
    "demo-3": {
        id: "demo-3",
        title: "Türev ve İntegral",
        subject: "Matematik",
        topic: "Analiz",
        qualityScore: 92,
        updatedAt: new Date(Date.now() - 172800000).toISOString(),
        concepts: [
            { id: "c1", term: "Türev", definition: "Bir fonksiyonun değişim hızını ölçer.", keywords: ["eğim", "limit", "değişim"] },
            { id: "c2", term: "İntegral", definition: "Türevin tersi, alan hesabı için kullanılır.", keywords: ["alan", "toplam"] },
            { id: "c3", term: "Limit", definition: "Bir fonksiyonun belirli bir noktaya yaklaşma değeri.", keywords: ["yaklaşma", "sonsuz"] },
        ],
        relationships: [
            { id: "r1", type: "REQUIRES", description: "Türev limit kavramını gerektirir" },
            { id: "r2", type: "SIMILAR_TO", description: "İntegral türevin tersidir" },
        ],
        applications: [
            { id: "a1", scenario: "Hız-zaman grafiğinde alan = yol", context: "Fizik" },
        ],
        questions: [
            { id: "q1", text: "Türevin geometrik anlamı nedir?", difficulty: 2 },
            { id: "q2", text: "Belirli integral neyi hesaplar?", difficulty: 3 },
        ],
    },
};

export default function NoteDetailPage() {
    const params = useParams();
    const noteId = params.id as string;
    const [note, setNote] = useState<Note | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"concepts" | "relationships" | "applications" | "questions">("concepts");

    useEffect(() => {
        // Demo mod kontrolü
        if (noteId.startsWith("demo-")) {
            setNote(demoNotes[noteId] || demoNotes["demo-1"]);
            setIsLoading(false);
        } else {
            // Gerçek API çağrısı yapılabilir
            setNote(demoNotes["demo-1"]); // Şimdilik demo veri
            setIsLoading(false);
        }
    }, [noteId]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
            </div>
        );
    }

    if (!note) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-bold mb-2">Not bulunamadı</h2>
                    <Link href="/notes">
                        <Button>Notlara Dön</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const tabs = [
        { id: "concepts", label: "Kavramlar", icon: BookOpen, count: note.concepts.length },
        { id: "relationships", label: "İlişkiler", icon: Link2, count: note.relationships.length },
        { id: "applications", label: "Uygulamalar", icon: Lightbulb, count: note.applications.length },
        { id: "questions", label: "Sorular", icon: HelpCircle, count: note.questions.length },
    ] as const;

    return (
        <div className="min-h-screen page-transition">
            {/* Header */}
            <header className="sticky top-0 z-50 glass border-b border-slate-800">
                <div className="max-w-5xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/notes">
                                <Button variant="ghost" size="icon">
                                    <ArrowLeft className="w-5 h-5" />
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-xl font-bold">{note.title}</h1>
                                <div className="flex items-center gap-2 text-sm text-slate-400">
                                    {note.subject && <span>{note.subject}</span>}
                                    {note.topic && <span>• {note.topic}</span>}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Badge variant={note.qualityScore >= 80 ? "success" : "warning"}>
                                <Star className="w-3 h-3 mr-1" />
                                %{note.qualityScore}
                            </Badge>
                            <Link href={`/games/dungeon?noteId=${note.id}`}>
                                <Button>
                                    <Gamepad2 className="w-4 h-4 mr-2" />
                                    Oynat
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                                    flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all
                                    ${activeTab === tab.id
                                        ? "bg-violet-500/20 text-violet-400"
                                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                    }
                                `}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                                <Badge variant="default" size="sm">{tab.count}</Badge>
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-5xl mx-auto px-4 py-8">
                {activeTab === "concepts" && (
                    <div className="space-y-4">
                        {note.concepts.map((concept, index) => (
                            <Card key={concept.id} gradient className="p-4">
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center text-violet-400 font-medium flex-shrink-0">
                                        {index + 1}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-lg mb-1">{concept.term}</h3>
                                        <p className="text-slate-400">{concept.definition}</p>
                                        {concept.keywords.length > 0 && (
                                            <div className="flex gap-2 mt-2">
                                                {concept.keywords.map((kw, i) => (
                                                    <Badge key={i} variant="default" size="sm">{kw}</Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {activeTab === "relationships" && (
                    <div className="space-y-4">
                        {note.relationships.map((rel, index) => (
                            <Card key={rel.id} gradient className="p-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-medium flex-shrink-0">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <Badge variant="info" className="mb-2">{rel.type}</Badge>
                                        <p className="text-slate-300">{rel.description}</p>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {activeTab === "applications" && (
                    <div className="space-y-4">
                        {note.applications.map((app, index) => (
                            <Card key={app.id} gradient className="p-4">
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-medium flex-shrink-0">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <p className="text-slate-300 mb-2">{app.scenario}</p>
                                        {app.context && <Badge variant="success" size="sm">{app.context}</Badge>}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {activeTab === "questions" && (
                    <div className="space-y-4">
                        {note.questions.map((q, index) => (
                            <Card key={q.id} gradient className="p-4">
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 font-medium flex-shrink-0">
                                        {index + 1}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-slate-300">{q.text}</p>
                                        <div className="flex items-center gap-1 mt-2">
                                            <span className="text-xs text-slate-500">Zorluk:</span>
                                            {[1, 2, 3, 4, 5].map((level) => (
                                                <div
                                                    key={level}
                                                    className={`w-4 h-4 rounded ${level <= q.difficulty ? "bg-amber-500/50" : "bg-slate-700"}`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Play button */}
                <Card gradient glow className="mt-8 p-6 text-center">
                    <h3 className="text-xl font-bold mb-2">Bu not ile oyna!</h3>
                    <p className="text-slate-400 mb-4">
                        Kavramları oyun oynayarak pekiştir
                    </p>
                    <Link href={`/games/dungeon?noteId=${note.id}`}>
                        <Button size="lg">
                            <Gamepad2 className="w-5 h-5 mr-2" />
                            Dungeon Modunda Oyna
                        </Button>
                    </Link>
                </Card>
            </main>
        </div>
    );
}
