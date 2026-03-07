"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Brain, Mail, ArrowLeft, Loader2, CheckCircle } from "lucide-react";

export const runtime = "edge";



export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        // Simulate API call - gerçek e-posta gönderimi için backend gerekli
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Şimdilik her zaman başarılı göster
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
                        <h2 className="text-2xl font-bold mb-2">E-posta Gönderildi!</h2>
                        <p className="text-slate-400 mb-6">
                            Şifre sıfırlama bağlantısı <strong className="text-white">{email}</strong> adresine gönderildi.
                            Lütfen e-postanızı kontrol edin.
                        </p>
                        <Link href="/auth/login">
                            <Button variant="outline" className="w-full">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Giriş Sayfasına Dön
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 page-transition">
            <Card gradient glow className="w-full max-w-md">
                <CardHeader className="text-center">
                    <Link href="/" className="inline-flex items-center justify-center gap-2 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                            <Brain className="w-7 h-7 text-white" />
                        </div>
                    </Link>
                    <CardTitle className="text-2xl">Şifremi Unuttum</CardTitle>
                    <CardDescription>
                        E-posta adresini gir, şifre sıfırlama bağlantısı gönderelim.
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm text-center">
                                {error}
                            </div>
                        )}

                        <Input
                            type="email"
                            placeholder="E-posta adresin"
                            icon={<Mail className="w-5 h-5" />}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                "Şifre Sıfırlama Bağlantısı Gönder"
                            )}
                        </Button>
                    </form>

                    <p className="text-center text-sm text-slate-400">
                        <Link href="/auth/login" className="text-violet-400 hover:text-violet-300 font-medium inline-flex items-center">
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Giriş sayfasına dön
                        </Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
