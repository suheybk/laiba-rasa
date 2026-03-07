"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Brain, Mail, Lock, User, ArrowRight, Loader2, Check } from "lucide-react";




export default function RegisterPage() {const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);
    const [formData, setFormData] = useState({
        email: "",
        username: "",
        password: "",
        confirmPassword: "",
    });

    const validatePassword = (password: string) => {
        const checks = [
            { valid: password.length >= 8, text: "En az 8 karakter" },
            { valid: /[A-Z]/.test(password), text: "Bir büyük harf" },
            { valid: /[0-9]/.test(password), text: "Bir rakam" },
        ];
        return checks;
    };

    const passwordChecks = validatePassword(formData.password);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrors([]);

        if (formData.password !== formData.confirmPassword) {
            setErrors(["Şifreler eşleşmiyor"]);
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: formData.email,
                    username: formData.username,
                    password: formData.password,
                    language: "TR",
                }),
            });

            const data = await response.json() as any;

            if (!response.ok) {
                setErrors(data.errors || [data.error]);
            } else {
                // Auto sign in after registration
                await signIn("credentials", {
                    email: formData.email,
                    password: formData.password,
                    callbackUrl: "/onboarding",
                });
            }
        } catch {
            setErrors(["Bir hata oluştu. Lütfen tekrar deneyin."]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        await signIn("google", { callbackUrl: "/onboarding" });
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 page-transition">
            <Card gradient glow className="w-full max-w-md">
                <CardHeader className="text-center">
                    <Link href="/" className="inline-flex items-center justify-center gap-2 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                            <Brain className="w-7 h-7 text-white" />
                        </div>
                    </Link>
                    <CardTitle className="text-2xl">Hesap Oluştur</CardTitle>
                    <CardDescription>
                        3 gün ücretsiz Pro Max erişimi ile başla!
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Google Sign In */}
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={handleGoogleSignIn}
                        disabled={isLoading}
                    >
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                            <path
                                fill="currentColor"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="currentColor"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        Google ile Kayıt Ol
                    </Button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-700"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-slate-900 px-2 text-slate-500">veya</span>
                        </div>
                    </div>

                    {/* Email Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {errors.length > 0 && (
                            <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                                <ul className="list-disc list-inside">
                                    {errors.map((error, index) => (
                                        <li key={index}>{error}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <Input
                            type="email"
                            placeholder="E-posta adresin"
                            icon={<Mail className="w-5 h-5" />}
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />

                        <Input
                            type="text"
                            placeholder="Kullanıcı adın"
                            icon={<User className="w-5 h-5" />}
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            required
                        />

                        <div>
                            <Input
                                type="password"
                                placeholder="Şifren"
                                icon={<Lock className="w-5 h-5" />}
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                            {formData.password && (
                                <div className="mt-2 space-y-1">
                                    {passwordChecks.map((check, index) => (
                                        <div
                                            key={index}
                                            className={`flex items-center gap-2 text-xs ${check.valid ? "text-emerald-400" : "text-slate-500"
                                                }`}
                                        >
                                            <Check className={`w-3 h-3 ${check.valid ? "opacity-100" : "opacity-30"}`} />
                                            {check.text}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <Input
                            type="password"
                            placeholder="Şifreni onayla"
                            icon={<Lock className="w-5 h-5" />}
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            error={
                                formData.confirmPassword && formData.password !== formData.confirmPassword
                                    ? "Şifreler eşleşmiyor"
                                    : undefined
                            }
                            required
                        />

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Ücretsiz Hesap Oluştur
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </>
                            )}
                        </Button>
                    </form>

                    <p className="text-center text-sm text-slate-400">
                        Hesabın var mı?{" "}
                        <Link href="/auth/login" className="text-violet-400 hover:text-violet-300 font-medium">
                            Giriş Yap
                        </Link>
                    </p>

                    <p className="text-center text-xs text-slate-500">
                        Kayıt olarak{" "}
                        <Link href="/terms" className="text-violet-400 hover:underline">
                            Kullanım Şartları
                        </Link>{" "}
                        ve{" "}
                        <Link href="/privacy" className="text-violet-400 hover:underline">
                            Gizlilik Politikası
                        </Link>
                        &apos;nı kabul etmiş olursunuz.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
