"use client";

import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {

    Settings as SettingsIcon,
    User,
    LogOut,
    Bell,
    Moon,
    Shield,
    CreditCard,
    Loader2
} from "lucide-react";

export const runtime = "edge";


export default function SettingsPage() {
    const { data: session, update } = useSession();
    const [isSaving, setIsSaving] = useState(false);
    const [name, setName] = useState(session?.user?.name || "");

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch("/api/user/update", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name }),
            });

            if (!res.ok) throw new Error("Güncelleme başarısız");

            // Update session client-side
            await update({ name });

            alert("Profil başarıyla güncellendi!");
        } catch (error) {
            console.error(error);
            alert("Bir hata oluştu.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen p-4 lg:p-8 max-w-4xl mx-auto page-transition">
            <header className="mb-8">
                <h1 className="text-2xl lg:text-3xl font-bold mb-2 flex items-center gap-3">
                    <SettingsIcon className="w-8 h-8 text-slate-400" />
                    Ayarlar
                </h1>
                <p className="text-slate-400">
                    Hesap tercihlerinizi yönetin
                </p>
            </header>

            <div className="space-y-6">
                {/* Profile Section */}
                <Card gradient>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="w-5 h-5 text-violet-500" />
                            Profil Bilgileri
                        </CardTitle>
                        <CardDescription>
                            Kişisel bilgilerin ve hesap detayların
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="username">Kullanıcı Adı</Label>
                                <Input id="username" defaultValue={session?.user?.name || "Kullanıcı"} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">E-posta</Label>
                                <Input id="email" defaultValue={session?.user?.email || "email@example.com"} disabled className="opacity-75 bg-slate-900/50" />
                            </div>
                        </div>
                        <div className="flex justify-end mt-4">
                            <Button onClick={handleSave} disabled={isSaving}>
                                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Değişiklikleri Kaydet
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Subscription Section */}
                <Card gradient>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-amber-500" />
                            Üyelik Durumu
                        </CardTitle>
                        <CardDescription>
                            Mevcut planınız ve faturalandırma
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                                <span className="font-bold text-amber-500">Pro Plan (Deneme)</span>
                            </div>
                            <div className="text-sm text-slate-400">
                                2 gün sonra sona eriyor
                            </div>
                        </div>
                        <Button variant="outline" className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10">
                            Yükselt
                        </Button>
                    </CardContent>
                </Card>

                {/* Preferences */}
                <Card gradient>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-emerald-500" />
                            Tercihler
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Bell className="w-5 h-5 text-slate-400" />
                                <div>
                                    <div className="font-medium">Bildirimler</div>
                                    <div className="text-sm text-slate-500">Günlük hatırlatıcılar ve güncellemeler</div>
                                </div>
                            </div>
                            <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Moon className="w-5 h-5 text-slate-400" />
                                <div>
                                    <div className="font-medium">Karanlık Mod</div>
                                    <div className="text-sm text-slate-500">Göz yorgunluğunu azaltır</div>
                                </div>
                            </div>
                            <Switch defaultChecked disabled />
                        </div>
                    </CardContent>
                </Card>

                {/* Danger Zone / Logout */}
                <div className="flex justify-center pt-8">
                    <Button
                        variant="destructive"
                        size="lg"
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="w-full md:w-auto"
                    >
                        <LogOut className="w-5 h-5 mr-2" />
                        Oturumu Kapat
                    </Button>
                </div>
            </div>
        </div>
    );
}
