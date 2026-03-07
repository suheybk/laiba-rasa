"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {

    Brain,
    BookOpen,
    Link2,
    Lightbulb,
    HelpCircle,
    ArrowRight,
    ArrowLeft,
    Check,
    Sparkles,
    Gamepad2
} from "lucide-react";



const onboardingSteps = [
    {
        id: "welcome",
        title: "LAIBA'ya Hoş Geldin! 🎉",
        description: "Not almayı ve öğrenmeyi oyuna dönüştürmeye hazır mısın?",
        icon: Brain,
    },
    {
        id: "craq-intro",
        title: "CRAQ Sistemi Nedir?",
        description: "4 katmanlı not sistemi ile öğrenme kalıcı hale gelir.",
        icon: BookOpen,
    },
    {
        id: "concepts",
        title: "1. Kavramlar (Concepts)",
        description: "Temel terimler ve tanımlar. Öğrenmenin yapı taşları.",
        icon: BookOpen,
        example: {
            term: "Mitokondri",
            definition: "ATP üreten, çift zarlı bir hücre organeli."
        }
    },
    {
        id: "relationships",
        title: "2. İlişkiler (Relationships)",
        description: "Kavramlar arasındaki bağlantılar. Bilgi ağını oluşturur.",
        icon: Link2,
        example: {
            source: "Mitokondri",
            target: "ATP",
            type: "üretir"
        }
    },
    {
        id: "applications",
        title: "3. Uygulamalar (Applications)",
        description: "Gerçek dünya örnekleri. Bilgiyi hayata taşır.",
        icon: Lightbulb,
        example: {
            scenario: "Kas yorgunluğu ATP tükendiğinde oluşur."
        }
    },
    {
        id: "questions",
        title: "4. Sorular (Questions)",
        description: "Kendini test et. Öğrenmeyi pekiştir.",
        icon: HelpCircle,
        example: {
            question: "Hücreler neden ATP'ye ihtiyaç duyar?"
        }
    },
    {
        id: "game-preview",
        title: "Notların Oyuna Dönüşür!",
        description: "CRAQ notların otomatik olarak eğlenceli oyunlara dönüşür.",
        icon: Gamepad2,
    },
    {
        id: "complete",
        title: "Hazırsın! 🚀",
        description: "İlk notunu oluştur ve öğrenmeye başla!",
        icon: Sparkles,
    },
];

export default function OnboardingPage() {const [currentStep, setCurrentStep] = useState(0);
    const step = onboardingSteps[currentStep];

    const nextStep = () => {
        if (currentStep < onboardingSteps.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const isLastStep = currentStep === onboardingSteps.length - 1;

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 page-transition">
            <div className="w-full max-w-2xl">
                {/* Progress indicator */}
                <div className="flex justify-center gap-2 mb-8">
                    {onboardingSteps.map((_, index) => (
                        <div
                            key={index}
                            className={`h-2 rounded-full transition-all duration-300 ${index === currentStep
                                    ? "w-8 bg-violet-500"
                                    : index < currentStep
                                        ? "w-2 bg-emerald-500"
                                        : "w-2 bg-slate-700"
                                }`}
                        />
                    ))}
                </div>

                <Card gradient glow className="overflow-hidden">
                    <CardHeader className="text-center pb-4">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 flex items-center justify-center mx-auto mb-6">
                            <step.icon className="w-10 h-10 text-violet-400" />
                        </div>
                        <Badge variant="info" className="mb-4">
                            Adım {currentStep + 1} / {onboardingSteps.length}
                        </Badge>
                        <CardTitle className="text-2xl md:text-3xl">{step.title}</CardTitle>
                        <p className="text-slate-400 mt-2">{step.description}</p>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {/* Step-specific content */}
                        {step.id === "craq-intro" && (
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { letter: "C", name: "Kavramlar", color: "violet" },
                                    { letter: "R", name: "İlişkiler", color: "indigo" },
                                    { letter: "A", name: "Uygulamalar", color: "emerald" },
                                    { letter: "Q", name: "Sorular", color: "amber" },
                                ].map((item) => (
                                    <div
                                        key={item.letter}
                                        className={`p-4 rounded-xl bg-${item.color}-500/10 border border-${item.color}-500/30`}
                                    >
                                        <div className={`text-2xl font-bold text-${item.color}-400 mb-1`}>
                                            {item.letter}
                                        </div>
                                        <div className="text-sm text-slate-400">{item.name}</div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {step.id === "concepts" && step.example && (
                            <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/30">
                                <div className="text-lg font-semibold text-violet-400 mb-2">
                                    {step.example.term}
                                </div>
                                <div className="text-slate-300">{step.example.definition}</div>
                            </div>
                        )}

                        {step.id === "relationships" && step.example && (
                            <div className="flex items-center justify-center gap-4 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30">
                                <div className="text-center">
                                    <div className="text-lg font-semibold text-indigo-400">
                                        {step.example.source}
                                    </div>
                                </div>
                                <ArrowRight className="w-6 h-6 text-indigo-400" />
                                <div className="text-sm text-slate-400 bg-indigo-500/20 px-3 py-1 rounded-full">
                                    {step.example.type}
                                </div>
                                <ArrowRight className="w-6 h-6 text-indigo-400" />
                                <div className="text-center">
                                    <div className="text-lg font-semibold text-indigo-400">
                                        {step.example.target}
                                    </div>
                                </div>
                            </div>
                        )}

                        {step.id === "applications" && step.example && (
                            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                                <div className="flex items-start gap-3">
                                    <Lightbulb className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                                    <div className="text-slate-300">{step.example.scenario}</div>
                                </div>
                            </div>
                        )}

                        {step.id === "questions" && step.example && (
                            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                                <div className="flex items-start gap-3">
                                    <HelpCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                                    <div className="text-slate-300">{step.example.question}</div>
                                </div>
                            </div>
                        )}

                        {step.id === "game-preview" && (
                            <div className="grid grid-cols-3 gap-4">
                                {[
                                    { name: "Dungeon", desc: "Solo macera" },
                                    { name: "Arena", desc: "1v1 yarış" },
                                    { name: "Raid", desc: "Takım savaşı" },
                                ].map((mode) => (
                                    <div
                                        key={mode.name}
                                        className="p-4 rounded-xl bg-slate-800 border border-slate-700 text-center"
                                    >
                                        <Gamepad2 className="w-8 h-8 text-violet-400 mx-auto mb-2" />
                                        <div className="font-semibold">{mode.name}</div>
                                        <div className="text-xs text-slate-500">{mode.desc}</div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {step.id === "complete" && (
                            <div className="text-center py-4">
                                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 mb-4">
                                    <Check className="w-12 h-12 text-emerald-400" />
                                </div>
                                <p className="text-slate-400">
                                    Eğitimi tamamladın! Artık LAIBA&apos;yı kullanmaya hazırsın.
                                </p>
                            </div>
                        )}

                        {/* Navigation buttons */}
                        <div className="flex justify-between pt-4">
                            <Button
                                variant="ghost"
                                onClick={prevStep}
                                disabled={currentStep === 0}
                                className={currentStep === 0 ? "invisible" : ""}
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Geri
                            </Button>

                            {isLastStep ? (
                                <Link href="/dashboard">
                                    <Button>
                                        Dashboard&apos;a Git
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </Link>
                            ) : (
                                <Button onClick={nextStep}>
                                    Devam Et
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Skip option */}
                {!isLastStep && (
                    <div className="text-center mt-6">
                        <Link
                            href="/dashboard"
                            className="text-sm text-slate-500 hover:text-slate-400 transition-colors"
                        >
                            Eğitimi atla →
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
