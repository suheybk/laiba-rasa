"use client";

import { useState, useRef } from "react";
import { Upload, FileText, Loader2, AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface PDFUploadProps {
    onTextExtracted: (text: string) => void;
    className?: string;
}

export function PDFUpload({ onTextExtracted, className }: PDFUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        setError(null);

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            handleFile(files[0]);
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFile(files[0]);
        }
    };

    const handleFile = async (file: File) => {
        if (file.type !== "application/pdf") {
            setError("Lütfen geçerli bir PDF dosyası yükleyin.");
            return;
        }

        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            setError("Dosya boyutu 10MB'dan küçük olmalıdır.");
            return;
        }

        setFileName(file.name);
        setIsUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/teacher/upload-pdf", {
                method: "POST",
                body: formData
            });
            const data = await res.json();

            if (data.success) {
                onTextExtracted(data.extractedText);
            } else {
                setError(data.error || "Yükleme sırasında bir hata oluştu.");
                setFileName(null);
            }
        } catch (err) {
            console.error(err);
            setError("Sunucu ile iletişim hatası.");
            setFileName(null);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const resetUpload = () => {
        setFileName(null);
        setError(null);
        onTextExtracted("");
    };

    return (
        <Card
            className={cn(
                "p-8 border-dashed border-2 transition-all duration-200",
                isDragging
                    ? "border-violet-500 bg-violet-500/10 scale-[1.01]"
                    : "border-slate-700 bg-slate-900/30 hover:bg-slate-900/50",
                className
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <div className="flex flex-col items-center justify-center text-center">
                {isUploading ? (
                    <div className="flex flex-col items-center gap-4 animate-in fade-in duration-300">
                        <div className="p-4 rounded-full bg-violet-500/10 text-violet-400 animate-pulse">
                            <Loader2 className="w-8 h-8 animate-spin" />
                        </div>
                        <div>
                            <p className="font-medium text-white">{fileName}</p>
                            <p className="text-sm text-slate-400">Analiz ediliyor...</p>
                        </div>
                    </div>
                ) : fileName && !error ? (
                    <div className="flex flex-col items-center gap-4 animate-in fade-in duration-300">
                        <div className="p-4 rounded-full bg-emerald-500/10 text-emerald-400">
                            <FileText className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="font-medium text-white">{fileName}</p>
                            <p className="text-sm text-emerald-400">Başarıyla yüklendi</p>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                resetUpload();
                            }}
                            className="text-slate-400 hover:text-red-400 hover:bg-red-400/10"
                        >
                            <X className="w-4 h-4 mr-2" />
                            Dosyayı Kaldır
                        </Button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-4" onClick={() => fileInputRef.current?.click()}>
                        <div className={`p-4 rounded-full transition-colors ${error ? "bg-red-500/10 text-red-400" : "bg-violet-500/10 text-violet-400"}`}>
                            {error ? <AlertCircle className="w-8 h-8" /> : <Upload className="w-8 h-8" />}
                        </div>

                        <div>
                            {error ? (
                                <p className="font-medium text-red-400">{error}</p>
                            ) : (
                                <>
                                    <h3 className="font-medium text-white">PDF Yükle</h3>
                                    <p className="text-sm text-slate-400 mt-1">
                                        Sürükleyip bırakın veya tıklayın
                                    </p>
                                    <p className="text-xs text-slate-500 mt-2">
                                        Maksimum 10MB
                                    </p>
                                </>
                            )}
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf"
                            onChange={handleFileInput}
                            className="hidden"
                        />
                    </div>
                )}
            </div>
        </Card>
    );
}
