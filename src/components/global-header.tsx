"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Brain, Menu, X, LogOut, User, Gamepad2 } from "lucide-react";
import { useState } from "react";

export function GlobalHeader() {
    const { data: session, status } = useSession();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const isLoading = status === "loading";
    const isLoggedIn = !!session?.user;

    return (
        <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-slate-800/50">
            <div className="container mx-auto px-4 py-3">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                            <Brain className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-gradient">L3IBA</span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-6">
                        {isLoggedIn ? (
                            <>
                                <Link href="/dashboard" className="text-slate-300 hover:text-white transition-colors text-sm">
                                    Dashboard
                                </Link>
                                <Link href="/notes" className="text-slate-300 hover:text-white transition-colors text-sm">
                                    Notlarım
                                </Link>
                                <Link href="/games" className="text-slate-300 hover:text-white transition-colors text-sm">
                                    Oyunlar
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link href="/dashboard" className="text-slate-300 hover:text-white transition-colors text-sm">
                                    Demo
                                </Link>
                                <Link href="/#features" className="text-slate-300 hover:text-white transition-colors text-sm">
                                    Özellikler
                                </Link>
                                <Link href="/#pricing" className="text-slate-300 hover:text-white transition-colors text-sm">
                                    Fiyatlandırma
                                </Link>
                            </>
                        )}
                    </nav>

                    {/* Auth Buttons */}
                    <div className="hidden md:flex items-center gap-3">
                        {isLoading ? (
                            <div className="w-20 h-9 bg-slate-800 rounded-lg animate-pulse" />
                        ) : isLoggedIn ? (
                            <>
                                <Link href="/settings">
                                    <Button variant="ghost" size="sm" className="gap-2">
                                        <User className="w-4 h-4" />
                                        {session.user?.name?.split(" ")[0] || "Profil"}
                                    </Button>
                                </Link>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => signOut({ callbackUrl: "/" })}
                                    className="text-slate-400 hover:text-white"
                                >
                                    <LogOut className="w-4 h-4" />
                                </Button>
                            </>
                        ) : (
                            <>
                                <Link href="/auth/login">
                                    <Button variant="ghost" size="sm">Giriş Yap</Button>
                                </Link>
                                <Link href="/auth/register">
                                    <Button size="sm">Ücretsiz Başla</Button>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 text-slate-400 hover:text-white"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden pt-4 pb-2 border-t border-slate-800 mt-3">
                        <nav className="flex flex-col gap-2">
                            {isLoggedIn ? (
                                <>
                                    <Link href="/dashboard" className="py-2 text-slate-300 hover:text-white" onClick={() => setMobileMenuOpen(false)}>
                                        Dashboard
                                    </Link>
                                    <Link href="/notes" className="py-2 text-slate-300 hover:text-white" onClick={() => setMobileMenuOpen(false)}>
                                        Notlarım
                                    </Link>
                                    <Link href="/games" className="py-2 text-slate-300 hover:text-white" onClick={() => setMobileMenuOpen(false)}>
                                        Oyunlar
                                    </Link>
                                    <button
                                        onClick={() => signOut({ callbackUrl: "/" })}
                                        className="py-2 text-left text-red-400 hover:text-red-300"
                                    >
                                        Çıkış Yap
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link href="/dashboard" className="py-2 text-slate-300 hover:text-white" onClick={() => setMobileMenuOpen(false)}>
                                        Demo
                                    </Link>
                                    <Link href="/auth/login" className="py-2 text-slate-300 hover:text-white" onClick={() => setMobileMenuOpen(false)}>
                                        Giriş Yap
                                    </Link>
                                    <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)}>
                                        <Button className="w-full mt-2">Ücretsiz Başla</Button>
                                    </Link>
                                </>
                            )}
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
}
