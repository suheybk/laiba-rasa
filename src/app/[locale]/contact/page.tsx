"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Brain, Mail, User, MessageSquare, ArrowLeft, Loader2, CheckCircle, Send } from "lucide-react";

export default function ContactPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        message: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        setIsSuccess(true);
        setIsLoading(false);
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4 py-12 page-transition">
                <Card gradient glow className="w-full max-w-md">
                    <CardContent className="pt-8 pb-8 text-center">
                        <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-8 h-8 text-emerald-400" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Mesajınız Alındı!</h2>
                        <p className="text-slate-400 mb-6">
                            En kısa sürede size dönüş yapacağız. Teşekkür ederiz!
                        </p>
                        <Link href="/">
                            <Button variant="outline" className="w-full">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Ana Sayfaya Dön
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-20 px-4 page-transition">
            <div className="container mx-auto max-w-4xl">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300 mb-6">
                        <ArrowLeft className="w-4 h-4" />
                        Ana Sayfaya Dön
                    </Link>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Contact Info */}
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                                <Brain className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-2xl font-bold">L3IBA</span>
                        </div>
                        <h1 className="text-4xl font-bold mb-4">İletişim</h1>
                        <p className="text-slate-400 mb-8">
                            Sorularınız, önerileriniz veya geri bildirimleriniz için bizimle iletişime geçin.
                            Size en kısa sürede dönüş yapacağız.
                        </p>

                        <div className="space-y-4">
                            <Card gradient className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
                                        <Mail className="w-5 h-5 text-violet-400" />
                                    </div>
                                    <div>
                                        <div className="text-sm text-slate-400">E-posta</div>
                                        <div className="text-white">destek@l3iba.com</div>
                                    </div>
                                </div>
                            </Card>

                            <Card gradient className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
                                        <MessageSquare className="w-5 h-5 text-violet-400" />
                                    </div>
                                    <div>
                                        <div className="text-sm text-slate-400">Sosyal Medya</div>
                                        <div className="text-white">@l3iba</div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <Card gradient glow className="p-6">
                        <CardHeader className="px-0 pt-0">
                            <CardTitle className="text-xl">Bize Yazın</CardTitle>
                            <CardDescription>
                                Formu doldurun, size dönelim.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="px-0 pb-0">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <Input
                                    type="text"
                                    placeholder="Adınız"
                                    icon={<User className="w-5 h-5" />}
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />

                                <Input
                                    type="email"
                                    placeholder="E-posta adresiniz"
                                    icon={<Mail className="w-5 h-5" />}
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />

                                <div className="relative">
                                    <textarea
                                        placeholder="Mesajınız"
                                        className="w-full min-h-[150px] px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        required
                                    />
                                </div>

                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            Gönder
                                            <Send className="w-4 h-4 ml-2" />
                                        </>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
