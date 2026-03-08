// @ts-nocheck
"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {

    Upload,
    FileText,
    Loader2,
    CheckCircle,
    AlertCircle,
    ArrowRight,
    BookOpen,
    Gamepad2,
    Shield
} from "lucide-react";

interface UploadResult {
    success: boolean;
    filename?: string;
    extractedText?: string;
    textLength?: number;
    error?: string;
}

interface ProcessResult {
    success: boolean;
    note?: {
        id: string;
        title: string;
        conceptCount: number;
        questionCount: number;
        qualityScore: number;
    };
    message?: string;
    error?: string;
}

export default function TeacherDashboard() {
    const { data: session, status } = useSession();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [step, setStep] = useState<"upload" | "preview" | "processing" | "success">("upload");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
    const [processResult, setProcessResult] = useState<ProcessResult | null>(null);

    const [noteTitle, setNoteTitle] = useState("");
    const [noteSubject, setNoteSubject] = useState("");

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch("/api/teacher/upload-pdf", {
                method: "POST",
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                setUploadResult(result);
                setNoteTitle(file.name.replace(".pdf", ""));
                setStep("preview");
            } else {
                setError(result.error || "PDF yüklenirken hata oluştu");
            }
        } catch (err: any) {
            setError("Bağlantı hatası");
        } finally {
            setIsLoading(false);
        }
    };

    const handleProcess = async () => {
        if (!uploadResult?.extractedText) return;

        setIsLoading(true);
        setError(null);
        setStep("processing");

        try {
            const response = await fetch("/api/teacher/process-pdf", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    extractedText: uploadResult.extractedText,
                    title: noteTitle || "PDF Notu",
                    subject: noteSubject || "Genel"
                })
            });

            const result = await response.json();

            if (result.success) {
                setProcessResult(result);
                setStep("success");
            } else {
                setError(result.error || "İşleme hatası");
                setStep("preview");
            }
        } catch (err: any) {
            setError("Bağlantı hatası");
            setStep("preview");
        } finally {
            setIsLoading(false);
        }
    };

    const resetProcess = () => {
        setStep("upload");
        setUploadResult(null);
        setProcessResult(null);
        setError(null);
        setNoteTitle("");
        setNoteSubject("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 page-transition">
            {/* Header */}
            <header className="sticky top-0 z-50 glass border-b border-amber-500/30">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                                <Shield className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-amber-400">Öğretmen Paneli</h1>
                                <p className="text-xs text-slate-400">PDF'den Not Oluşturucu</p>
                            </div>
                        </div>
                        <Link href="/dashboard">
                            <Button variant="ghost" size="sm">
                                ← Dashboard
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8">
                {/* Step Indicator */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    {["upload", "preview", "success"].map((s, idx) => (
                        <div key={s} className="flex items-center">
                            <div className={`
                                w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                                ${step === s || (step === "processing" && s === "preview")
                                    ? "bg-amber-500 text-white"
                                    : step === "success" && idx < 2
                                        ? "bg-emerald-500 text-white"
                                        : "bg-slate-800 text-slate-500"}
                            `}>
                                {idx + 1}
                            </div>
                            {idx < 2 && (
                                <div className={`w-12 h-0.5 ${(step === "preview" && idx === 0) ||
                                        (step === "processing" && idx <= 1) ||
                                        (step === "success")
                                        ? "bg-amber-500"
                                        : "bg-slate-800"
                                    }`} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Error Display */}
                {error && (
                    <Card className="mb-6 border-red-500/50 bg-red-500/10">
                        <CardContent className="py-4 flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-red-400" />
                            <span className="text-red-300">{error}</span>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="ml-auto"
                                onClick={() => setError(null)}
                            >
                                ✕
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Step 1: Upload */}
                {step === "upload" && (
                    <Card gradient className="border-dashed border-2 border-amber-500/30">
                        <CardContent className="py-16">
                            <div className="text-center">
                                <div className="w-20 h-20 rounded-2xl bg-amber-500/20 flex items-center justify-center mx-auto mb-6">
                                    <Upload className="w-10 h-10 text-amber-400" />
                                </div>
                                <h2 className="text-2xl font-bold mb-2">PDF Yükle</h2>
                                <p className="text-slate-400 mb-8 max-w-md mx-auto">
                                    Ders notlarınızı içeren PDF dosyasını yükleyin.
                                    Sistem otomatik olarak kavramları ve soruları çıkaracak.
                                </p>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                    id="pdf-upload"
                                />

                                <label htmlFor="pdf-upload">
                                    <Button
                                        size="lg"
                                        className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 cursor-pointer"
                                        disabled={isLoading}
                                        asChild
                                    >
                                        <span>
                                            {isLoading ? (
                                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                            ) : (
                                                <FileText className="w-5 h-5 mr-2" />
                                            )}
                                            PDF Seç
                                        </span>
                                    </Button>
                                </label>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Step 2: Preview */}
                {(step === "preview" || step === "processing") && uploadResult && (
                    <div className="space-y-6">
                        <Card gradient>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-amber-500" />
                                    {uploadResult.filename}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="title">Not Başlığı</Label>
                                        <Input
                                            id="title"
                                            value={noteTitle}
                                            onChange={(e) => setNoteTitle(e.target.value)}
                                            placeholder="Örn: Türk Dili ve Edebiyatı 12"
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="subject">Ders</Label>
                                        <Input
                                            id="subject"
                                            value={noteSubject}
                                            onChange={(e) => setNoteSubject(e.target.value)}
                                            placeholder="Örn: Edebiyat"
                                            className="mt-1"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label>Çıkarılan Metin Önizleme ({uploadResult.textLength} karakter)</Label>
                                    <div className="mt-1 p-4 bg-slate-800/50 rounded-lg max-h-64 overflow-y-auto text-sm text-slate-300 font-mono">
                                        {uploadResult.extractedText?.substring(0, 2000)}
                                        {(uploadResult.textLength || 0) > 2000 && "..."}
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button variant="ghost" onClick={resetProcess}>
                                        ← Geri
                                    </Button>
                                    <Button
                                        className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600"
                                        onClick={handleProcess}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                İşleniyor...
                                            </>
                                        ) : (
                                            <>
                                                Not Oluştur
                                                <ArrowRight className="w-4 h-4 ml-2" />
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Step 3: Success */}
                {step === "success" && processResult?.note && (
                    <Card gradient className="border-emerald-500/30">
                        <CardContent className="py-12">
                            <div className="text-center">
                                <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle className="w-10 h-10 text-emerald-400" />
                                </div>
                                <h2 className="text-2xl font-bold mb-2 text-emerald-400">
                                    Not Başarıyla Oluşturuldu!
                                </h2>
                                <p className="text-slate-400 mb-6">
                                    {processResult.message}
                                </p>

                                <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-8">
                                    <div className="text-center p-4 rounded-xl bg-slate-800/50">
                                        <div className="text-2xl font-bold text-violet-400">
                                            {processResult.note.conceptCount}
                                        </div>
                                        <div className="text-xs text-slate-500">Kavram</div>
                                    </div>
                                    <div className="text-center p-4 rounded-xl bg-slate-800/50">
                                        <div className="text-2xl font-bold text-emerald-400">
                                            {processResult.note.questionCount}
                                        </div>
                                        <div className="text-xs text-slate-500">Soru</div>
                                    </div>
                                    <div className="text-center p-4 rounded-xl bg-slate-800/50">
                                        <div className="text-2xl font-bold text-amber-400">
                                            %{processResult.note.qualityScore}
                                        </div>
                                        <div className="text-xs text-slate-500">Kalite</div>
                                    </div>
                                </div>

                                <div className="flex gap-3 justify-center">
                                    <Link href={`/notes/${processResult.note.id}`}>
                                        <Button variant="ghost">
                                            <BookOpen className="w-4 h-4 mr-2" />
                                            Notu Görüntüle
                                        </Button>
                                    </Link>
                                    <Link href={`/games/dungeon?noteId=${processResult.note.id}`}>
                                        <Button className="bg-gradient-to-r from-violet-600 to-indigo-600">
                                            <Gamepad2 className="w-4 h-4 mr-2" />
                                            Oyun Oyna
                                        </Button>
                                    </Link>
                                </div>

                                <Button
                                    variant="link"
                                    className="mt-6 text-slate-500"
                                    onClick={resetProcess}
                                >
                                    Başka PDF Yükle
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </main>
        </div>
    );
}
