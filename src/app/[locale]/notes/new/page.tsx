// @ts-nocheck
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    ArrowLeft,
    ArrowRight,
    BookOpen,
    Link2,
    Lightbulb,
    HelpCircle,
    Plus,
    Trash2,
    Save,
    Check,
    AlertCircle,
    Loader2,
    Sparkles,
    Wand2,
    Gamepad2
} from "lucide-react";

import { PDFUpload } from "@/components/features/notes/pdf-upload";

export const runtime = "edge";



interface Concept {
    id: string;
    term: string;
    definition: string;
    keywords: string[];
    importance: number;
}

interface Relationship {
    id: string;
    sourceId: string;
    targetId: string;
    type: string;
    description: string;
}

interface Application {
    id: string;
    conceptIds: string[];
    scenario: string;
    context: string;
}

interface Question {
    id: string;
    text: string;
    conceptIds: string[];
    difficulty: number;
}

const relationshipTypes = [
    { value: "PRODUCES", label: "üretir" },
    { value: "REQUIRES", label: "gerektirir" },
    { value: "CAUSES", label: "neden olur" },
    { value: "PART_OF", label: "parçasıdır" },
    { value: "LEADS_TO", label: "yol açar" },
    { value: "SIMILAR_TO", label: "benzer" },
];

export default function NewNotePage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [currentTab, setCurrentTab] = useState<"concepts" | "relationships" | "applications" | "questions" | "ai-generator">("concepts");
    const [rawText, setRawText] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    // Form state
    const [title, setTitle] = useState("");
    const [showTitleError, setShowTitleError] = useState(false);
    const [subject, setSubject] = useState("");
    const [topic, setTopic] = useState("");

    // CRAQ layers
    const [concepts, setConcepts] = useState<Concept[]>([
        { id: "1", term: "", definition: "", keywords: [], importance: 3 }
    ]);
    const [relationships, setRelationships] = useState<Relationship[]>([]);
    const [applications, setApplications] = useState<Application[]>([]);
    const [questions, setQuestions] = useState<Question[]>([]);

    // Validation
    const conceptsValid = concepts.filter(c => c.term && c.definition).length >= 3;
    const relationshipsValid = relationships.length >= 2;
    const applicationsValid = applications.filter(a => a.scenario).length >= 1;
    const questionsValid = questions.filter(q => q.text).length >= 2;

    const qualityScore = Math.round(
        (conceptsValid ? 30 : concepts.filter(c => c.term && c.definition).length * 10) +
        (relationshipsValid ? 25 : relationships.length * 12.5) +
        (applicationsValid ? 25 : 0) +
        (questionsValid ? 20 : questions.filter(q => q.text).length * 10)
    );

    const canPublish = conceptsValid && relationshipsValid && applicationsValid && questionsValid;

    // Concept handlers
    const addConcept = () => {
        if (!title.trim()) {
            setShowTitleError(true);
            window.scrollTo({ top: 0, behavior: "smooth" });
            return;
        }
        setConcepts([...concepts, {
            id: Date.now().toString(),
            term: "",
            definition: "",
            keywords: [],
            importance: 3
        }]);
    };

    const updateConcept = (id: string, field: keyof Concept, value: string | string[] | number) => {
        setConcepts(concepts.map(c =>
            c.id === id ? { ...c, [field]: value } : c
        ));
    };

    const removeConcept = (id: string) => {
        if (concepts.length > 1) {
            setConcepts(concepts.filter(c => c.id !== id));
        }
    };

    // Relationship handlers
    const addRelationship = () => {
        if (!title.trim()) {
            setShowTitleError(true);
            window.scrollTo({ top: 0, behavior: "smooth" });
            return;
        }
        if (concepts.filter(c => c.term).length >= 2) {
            setRelationships([...relationships, {
                id: Date.now().toString(),
                sourceId: "",
                targetId: "",
                type: "PRODUCES",
                description: ""
            }]);
        }
    };

    const updateRelationship = (id: string, field: keyof Relationship, value: string) => {
        setRelationships(relationships.map(r =>
            r.id === id ? { ...r, [field]: value } : r
        ));
    };

    const removeRelationship = (id: string) => {
        setRelationships(relationships.filter(r => r.id !== id));
    };

    // Application handlers
    const addApplication = () => {
        if (!title.trim()) {
            setShowTitleError(true);
            window.scrollTo({ top: 0, behavior: "smooth" });
            return;
        }
        setApplications([...applications, {
            id: Date.now().toString(),
            conceptIds: [],
            scenario: "",
            context: ""
        }]);
    };

    const updateApplication = (id: string, field: keyof Application, value: string | string[]) => {
        setApplications(applications.map(a =>
            a.id === id ? { ...a, [field]: value } : a
        ));
    };

    const removeApplication = (id: string) => {
        setApplications(applications.filter(a => a.id !== id));
    };

    // Question handlers
    const addQuestion = () => {
        if (!title.trim()) {
            setShowTitleError(true);
            window.scrollTo({ top: 0, behavior: "smooth" });
            return;
        }
        setQuestions([...questions, {
            id: Date.now().toString(),
            text: "",
            conceptIds: [],
            difficulty: 3
        }]);
    };

    const updateQuestion = (id: string, field: keyof Question, value: string | string[] | number) => {
        setQuestions(questions.map(q =>
            q.id === id ? { ...q, [field]: value } : q
        ));
    };

    const removeQuestion = (id: string) => {
        setQuestions(questions.filter(q => q.id !== id));
    };

    // Save handler
    const handleSave = async (publish: boolean = false) => {
        if (!title.trim()) {
            setShowTitleError(true);
            window.scrollTo({ top: 0, behavior: "smooth" });
            return;
        }

        setIsLoading(true);

        try {
            const payload = {
                title,
                subject,
                topic,
                qualityScore,
                concepts: concepts.filter(c => c.term),
                relationships: relationships,
                applications: applications,
                questions: questions,
                isPublished: publish
            };

            const response = await fetch("/api/notes/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.details || "Failed to save");
            }

            const data = (await response.json()) as any;

            // Redirect to dashboard or the new note view
            router.push("/dashboard");
            router.refresh();
        } catch (error: any) {
            console.error("Save error:", error);
            alert("Not kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleTextExtracted = (text: string) => {
        setRawText(text);
        if (text) {
            alert("PDF içeriği başarıyla alındı! İnceleyip 'Analiz Et' butonuna basabilirsiniz.");
        }
    };

    const processText = async () => {
        if (!title.trim()) {
            setShowTitleError(true);
            window.scrollTo({ top: 0, behavior: "smooth" });
            return;
        }
        if (!rawText.trim()) return;

        setIsProcessing(true);

        try {
            const response = await fetch("/api/ai/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: rawText })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || "AI analizi başarısız oldu");
            }

            const resData = await response.json();
            const data = resData.data;

            if (data) {
                // Map AI result to our state
                // Note: We generate IDs and try to map terms

                // 1. Concepts
                const newConcepts: Concept[] = (data.concepts || []).map((c: any) => ({
                    id: Date.now().toString() + Math.random().toString().slice(2, 5),
                    term: c.term,
                    definition: c.definition,
                    keywords: c.keywords || [],
                    importance: c.importance || 3
                }));

                // 2. Questions
                const newQuestions: Question[] = (data.questions || []).map((q: any) => ({
                    id: Date.now().toString() + Math.random().toString().slice(2, 5),
                    text: q.text,
                    conceptIds: [],
                    difficulty: q.difficulty || 3
                }));

                // 3. Applications
                const newApplications: Application[] = (data.applications || []).map((a: any) => ({
                    id: Date.now().toString() + Math.random().toString().slice(2, 5),
                    conceptIds: [],
                    scenario: a.scenario,
                    context: a.context || ""
                }));

                // 4. Relationships
                const newRelationships: Relationship[] = [];
                if (data.relationships) {
                    data.relationships.forEach((r: any) => {
                        const source = newConcepts.find(c => c.term.toLowerCase() === r.sourceTerm?.toLowerCase());
                        const target = newConcepts.find(c => c.term.toLowerCase() === r.targetTerm?.toLowerCase());

                        if (source && target) {
                            newRelationships.push({
                                id: Date.now().toString() + Math.random().toString().slice(2, 5),
                                sourceId: source.id,
                                targetId: target.id,
                                type: r.type || "PRODUCES",
                                description: r.description || ""
                            });
                        }
                    });
                }

                // Update state
                if (newConcepts.length > 0) {
                    setConcepts(prev => [...prev.filter(c => c.term), ...newConcepts]);
                    setQuestions(prev => [...prev.filter(q => q.text), ...newQuestions]);
                    setApplications(prev => [...prev.filter(a => a.scenario), ...newApplications]);
                    setRelationships(prev => [...prev, ...newRelationships]);

                    alert(`${newConcepts.length} kavram, ${newRelationships.length} ilişki, ${newQuestions.length} soru AI tarafından oluşturuldu!`);
                    setCurrentTab("concepts");
                } else {
                    alert("AI anlamlı bir içerik çıkaramadı. Lütfen metni kontrol edin.");
                }
            }

        } catch (error: any) {
            console.error("AI Analysis Error:", error);
            alert("AI analizi sırasında bir hata oluştu: " + (error instanceof Error ? error.message : "Bilinmeyen hata"));
        } finally {
            setIsProcessing(false);
        }
    };

    const tabs = [
        { id: "ai-generator", label: "AI Oluşturucu", icon: Wand2, valid: true, count: 0, min: 0 },
        { id: "concepts", label: "Kavramlar", icon: BookOpen, valid: conceptsValid, count: concepts.filter(c => c.term).length, min: 3 },
        { id: "relationships", label: "İlişkiler", icon: Link2, valid: relationshipsValid, count: relationships.length, min: 2 },
        { id: "applications", label: "Uygulamalar", icon: Lightbulb, valid: applicationsValid, count: applications.filter(a => a.scenario).length, min: 1 },
        { id: "questions", label: "Sorular", icon: HelpCircle, valid: questionsValid, count: questions.filter(q => q.text).length, min: 2 },
    ] as const;

    const validConcepts = concepts.filter(c => c.term);

    return (
        <div className="min-h-screen bg-slate-950 page-transition">
            {/* Header */}
            <header className="sticky top-0 z-50 glass border-b border-slate-800">
                <div className="max-w-5xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/dashboard">
                                <Button variant="ghost" size="icon">
                                    <ArrowLeft className="w-5 h-5" />
                                </Button>
                            </Link>
                            <div>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Not başlığı..."
                                    className="text-xl font-semibold bg-transparent border-none outline-none placeholder:text-slate-600 w-full"
                                />
                                <div className="flex gap-2 mt-1">
                                    <input
                                        type="text"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        placeholder="Konu"
                                        className="text-sm text-slate-400 bg-transparent border-none outline-none placeholder:text-slate-600"
                                    />
                                    <span className="text-slate-600">•</span>
                                    <input
                                        type="text"
                                        value={topic}
                                        onChange={(e) => setTopic(e.target.value)}
                                        placeholder="Alt konu"
                                        className="text-sm text-slate-400 bg-transparent border-none outline-none placeholder:text-slate-600"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Quality Score */}
                            <div className="hidden sm:flex items-center gap-2">
                                <div className={`text-sm font-medium ${qualityScore >= 70 ? "text-emerald-400" : qualityScore >= 40 ? "text-amber-400" : "text-red-400"}`}>
                                    Kalite: {qualityScore}%
                                </div>
                            </div>

                            <Button variant="secondary" onClick={() => handleSave(false)} disabled={isLoading}>
                                <Save className="w-4 h-4 mr-2" />
                                Kaydet
                            </Button>

                            <Button
                                onClick={() => handleSave(true)}
                                disabled={!canPublish || isLoading}
                                className={!canPublish ? "opacity-50" : ""}
                            >
                                {isLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                ) : (
                                    <Gamepad2 className="w-4 h-4 mr-2" />
                                )}
                                Oyun Oluştur
                            </Button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setCurrentTab(tab.id)}
                                className={`
                  flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap
                  transition-all duration-200
                  ${currentTab === tab.id
                                        ? "bg-violet-500/20 text-violet-400"
                                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                    }
                `}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                                <Badge
                                    variant={tab.valid ? "success" : tab.count > 0 ? "warning" : "default"}
                                    size="sm"
                                >
                                    {tab.count}/{tab.min}
                                </Badge>
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* Main content */}
            <main className="max-w-5xl mx-auto px-4 py-8">
                {/* Concepts Tab */}
                {currentTab === "concepts" && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-semibold">Kavramlar</h2>
                                <p className="text-sm text-slate-400">Temel terimler ve tanımlar. En az 3 kavram gerekli.</p>
                            </div>
                            <Button onClick={addConcept} variant="secondary">
                                <Plus className="w-4 h-4 mr-2" />
                                Kavram Ekle
                            </Button>
                        </div>

                        {concepts.map((concept, index) => (
                            <Card key={concept.id} gradient className="p-4">
                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center text-violet-400 font-medium">
                                        {index + 1}
                                    </div>
                                    <div className="flex-1 space-y-3">
                                        <Input
                                            placeholder="Terim (örn: Mitokondri)"
                                            value={concept.term}
                                            onChange={(e) => updateConcept(concept.id, "term", e.target.value)}
                                        />
                                        <textarea
                                            placeholder="Tanım (örn: ATP üreten, çift zarlı bir hücre organeli.)"
                                            value={concept.definition}
                                            onChange={(e) => updateConcept(concept.id, "definition", e.target.value)}
                                            className="w-full h-24 px-4 py-3 rounded-xl bg-slate-900/50 border-2 border-slate-700 
                        focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20
                        text-white placeholder:text-slate-500 resize-none"
                                        />
                                        <Input
                                            placeholder="Anahtar kelimeler (virgülle ayır)"
                                            value={concept.keywords.join(", ")}
                                            onChange={(e) => updateConcept(concept.id, "keywords", e.target.value.split(",").map(k => k.trim()))}
                                        />
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeConcept(concept.id)}
                                        disabled={concepts.length === 1}
                                        className="flex-shrink-0 text-slate-500 hover:text-red-400"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Relationships Tab */}
                {currentTab === "relationships" && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-semibold">İlişkiler</h2>
                                <p className="text-sm text-slate-400">Kavramlar arası bağlantılar. En az 2 ilişki gerekli.</p>
                            </div>
                            <Button
                                onClick={addRelationship}
                                variant="secondary"
                                disabled={validConcepts.length < 2}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                İlişki Ekle
                            </Button>
                        </div>

                        {validConcepts.length < 2 && (
                            <Card gradient className="p-6 text-center">
                                <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
                                <p className="text-slate-400">
                                    İlişki eklemek için en az 2 kavram tanımlamanız gerekiyor.
                                </p>
                                <Button
                                    variant="secondary"
                                    className="mt-4"
                                    onClick={() => setCurrentTab("concepts")}
                                >
                                    Kavramlara Git
                                </Button>
                            </Card>
                        )}

                        {relationships.map((rel, index) => (
                            <Card key={rel.id} gradient className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-medium">
                                        {index + 1}
                                    </div>

                                    <select
                                        value={rel.sourceId}
                                        onChange={(e) => updateRelationship(rel.id, "sourceId", e.target.value)}
                                        className="flex-1 h-12 px-4 rounded-xl bg-slate-900/50 border-2 border-slate-700 
                      focus:border-violet-500 focus:outline-none text-white"
                                    >
                                        <option value="">Kaynak kavram seç...</option>
                                        {validConcepts.map(c => (
                                            <option key={c.id} value={c.id}>{c.term}</option>
                                        ))}
                                    </select>

                                    <select
                                        value={rel.type}
                                        onChange={(e) => updateRelationship(rel.id, "type", e.target.value)}
                                        className="w-40 h-12 px-4 rounded-xl bg-slate-900/50 border-2 border-slate-700 
                      focus:border-violet-500 focus:outline-none text-white"
                                    >
                                        {relationshipTypes.map(t => (
                                            <option key={t.value} value={t.value}>{t.label}</option>
                                        ))}
                                    </select>

                                    <ArrowRight className="w-5 h-5 text-slate-500 flex-shrink-0" />

                                    <select
                                        value={rel.targetId}
                                        onChange={(e) => updateRelationship(rel.id, "targetId", e.target.value)}
                                        className="flex-1 h-12 px-4 rounded-xl bg-slate-900/50 border-2 border-slate-700 
                      focus:border-violet-500 focus:outline-none text-white"
                                    >
                                        <option value="">Hedef kavram seç...</option>
                                        {validConcepts.filter(c => c.id !== rel.sourceId).map(c => (
                                            <option key={c.id} value={c.id}>{c.term}</option>
                                        ))}
                                    </select>

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeRelationship(rel.id)}
                                        className="flex-shrink-0 text-slate-500 hover:text-red-400"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Applications Tab */}
                {currentTab === "applications" && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-semibold">Uygulamalar</h2>
                                <p className="text-sm text-slate-400">Gerçek dünya örnekleri. En az 1 uygulama gerekli.</p>
                            </div>
                            <Button onClick={addApplication} variant="secondary">
                                <Plus className="w-4 h-4 mr-2" />
                                Uygulama Ekle
                            </Button>
                        </div>

                        {applications.length === 0 && (
                            <Card gradient className="p-6 text-center">
                                <Lightbulb className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                                <p className="text-slate-400 mb-4">
                                    Henüz uygulama eklemediniz. Kavramların gerçek hayatta nasıl kullanıldığını açıklayın.
                                </p>
                                <Button onClick={addApplication}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    İlk Uygulamayı Ekle
                                </Button>
                            </Card>
                        )}

                        {applications.map((app, index) => (
                            <Card key={app.id} gradient className="p-4">
                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-medium">
                                        {index + 1}
                                    </div>
                                    <div className="flex-1 space-y-3">
                                        <textarea
                                            placeholder="Senaryo: Gerçek dünyada bu kavram nasıl kullanılır? (örn: Kas yorgunluğu ATP tükendiğinde oluşur.)"
                                            value={app.scenario}
                                            onChange={(e) => updateApplication(app.id, "scenario", e.target.value)}
                                            className="w-full h-24 px-4 py-3 rounded-xl bg-slate-900/50 border-2 border-slate-700 
                        focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20
                        text-white placeholder:text-slate-500 resize-none"
                                        />
                                        <Input
                                            placeholder="Bağlam (örn: Spor bilimi, Tıp)"
                                            value={app.context}
                                            onChange={(e) => updateApplication(app.id, "context", e.target.value)}
                                        />
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeApplication(app.id)}
                                        className="flex-shrink-0 text-slate-500 hover:text-red-400"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Questions Tab */}
                {currentTab === "questions" && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-semibold">Sorular</h2>
                                <p className="text-sm text-slate-400">Kendini test et. En az 2 soru gerekli.</p>
                            </div>
                            <Button onClick={addQuestion} variant="secondary">
                                <Plus className="w-4 h-4 mr-2" />
                                Soru Ekle
                            </Button>
                        </div>

                        {questions.length === 0 && (
                            <Card gradient className="p-6 text-center">
                                <HelpCircle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
                                <p className="text-slate-400 mb-4">
                                    Henüz soru eklemediniz. Sorular öğrenmeyi pekiştirir.
                                </p>
                                <Button onClick={addQuestion}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    İlk Soruyu Ekle
                                </Button>
                            </Card>
                        )}

                        {questions.map((q, index) => (
                            <Card key={q.id} gradient className="p-4">
                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 font-medium">
                                        {index + 1}
                                    </div>
                                    <div className="flex-1 space-y-3">
                                        <textarea
                                            placeholder="Soru metni (örn: Hücreler neden ATP'ye ihtiyaç duyar?)"
                                            value={q.text}
                                            onChange={(e) => updateQuestion(q.id, "text", e.target.value)}
                                            className="w-full h-20 px-4 py-3 rounded-xl bg-slate-900/50 border-2 border-slate-700 
                        focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20
                        text-white placeholder:text-slate-500 resize-none"
                                        />
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm text-slate-400">Zorluk:</span>
                                            <div className="flex gap-1">
                                                {[1, 2, 3, 4, 5].map((level) => (
                                                    <button
                                                        key={level}
                                                        onClick={() => updateQuestion(q.id, "difficulty", level)}
                                                        className={`w-8 h-8 rounded-lg transition-all ${q.difficulty >= level
                                                            ? "bg-amber-500/30 text-amber-400"
                                                            : "bg-slate-800 text-slate-600"
                                                            }`}
                                                    >
                                                        {level}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeQuestion(q.id)}
                                        className="flex-shrink-0 text-slate-500 hover:text-red-400"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {/* AI Generator Tab */}
                {currentTab === "ai-generator" && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-semibold flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-violet-400" />
                                    AI ve Sihirli Analiz
                                </h2>
                                <p className="text-sm text-slate-400">
                                    Ders notlarını yapıştır veya PDF yükle, AI senin için kavramları ve soruları çıkarsın.
                                </p>
                            </div>
                        </div>

                        {/* PDF Upload Section */}
                        <PDFUpload onTextExtracted={handleTextExtracted} />

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-slate-800" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-slate-950 px-2 text-slate-500">veya metin yapıştır</span>
                            </div>
                        </div>

                        <Card gradient className="p-6">
                            <textarea
                                value={rawText}
                                onChange={(e) => setRawText(e.target.value)}
                                placeholder={`Ders notlarını buraya yapıştır...\n\nÖrnek:\nMitokondri hücrenin enerji santralidir.\n...`}
                                className="w-full h-64 p-4 rounded-xl bg-slate-900/50 border-2 border-slate-700 
                                focus:border-violet-500 focus:outline-none text-white placeholder:text-slate-500 resize-none font-mono text-sm leading-relaxed"
                            />

                            <div className="mt-4 flex justify-between items-center">
                                <p className="text-xs text-slate-500">
                                    {rawText.length} karakter
                                </p>
                                <Button
                                    size="lg"
                                    onClick={processText}
                                    disabled={isProcessing || !rawText.trim()}
                                    className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-500/25"
                                >
                                    {isProcessing ? (
                                        <>
                                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                            AI Analiz Ediyor...
                                        </>
                                    ) : (
                                        <>
                                            <Wand2 className="w-5 h-5 mr-2" />
                                            Analiz Et ve Oluştur
                                        </>
                                    )}
                                </Button>
                            </div>
                        </Card>

                        <div className="grid md:grid-cols-2 gap-4">
                            <Card className="p-4 bg-slate-900/50 border-slate-800">
                                <h3 className="font-semibold mb-2 text-violet-400">Gemini AI Destekli</h3>
                                <ul className="text-sm text-slate-400 space-y-2 list-disc list-inside">
                                    <li>PDF veya metinden otomatik kavram çıkarır.</li>
                                    <li>Kavramlar arası ilişkileri kurar.</li>
                                    <li>Gerçek hayat senaryoları üretir.</li>
                                    <li>Test soruları hazırlar.</li>
                                </ul>
                            </Card>
                            <Card className="p-4 bg-slate-900/50 border-slate-800">
                                <h3 className="font-semibold mb-2 text-amber-400">İpucu</h3>
                                <p className="text-sm text-slate-400">
                                    Analiz edilecek metin ne kadar temiz olursa sonuç o kadar iyi olur. PDF taramalarından gelen karmaşık metinleri düzenlemeniz gerekebilir.
                                </p>
                            </Card>
                        </div>
                    </div>
                )}

                {/* Validation summary */}
                <Card gradient className="mt-8 p-6">
                    <h3 className="font-semibold mb-4">Not Özeti</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {tabs.map((tab) => (
                            <div key={tab.id} className="flex items-center gap-2">
                                {tab.valid ? (
                                    <Check className="w-5 h-5 text-emerald-400" />
                                ) : (
                                    <AlertCircle className="w-5 h-5 text-amber-400" />
                                )}
                                <span className={tab.valid ? "text-emerald-400" : "text-amber-400"}>
                                    {tab.label}: {tab.count}/{tab.min}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <span className="text-slate-400">Kalite Puanı: </span>
                                <span className={`font-bold ${qualityScore >= 70 ? "text-emerald-400" : qualityScore >= 40 ? "text-amber-400" : "text-red-400"}`}>
                                    {qualityScore}%
                                </span>
                            </div>
                            {canPublish ? (
                                <Badge variant="success">
                                    <Check className="w-3 h-3 mr-1" />
                                    Yayınlamaya hazır
                                </Badge>
                            ) : (
                                <Badge variant="warning">
                                    Eksikler var
                                </Badge>
                            )}
                        </div>
                    </div>
                </Card>
            </main>
        </div>
    );
}
