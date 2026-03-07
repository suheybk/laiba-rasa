"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Globe, ChevronDown } from "lucide-react";

const languages = [
    { code: "tr", label: "Türkçe", shortCode: "TR" },
    { code: "en", label: "English", shortCode: "EN" },
    { code: "ar", label: "العربية", shortCode: "AR" },
] as const;

export function LanguageSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const currentLanguage = languages.find((lang) => lang.code === locale) || languages[0];

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLanguageChange = (newLocale: string) => {
        // Remove current locale from pathname and add new one
        const pathWithoutLocale = pathname.replace(/^\/(tr|en|ar)/, "") || "/";
        router.push(`/${newLocale}${pathWithoutLocale}`);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 transition-all duration-200"
                aria-label="Change language"
            >
                <Globe className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium">{currentLanguage.shortCode}</span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-40 rounded-xl bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => handleLanguageChange(lang.code)}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${locale === lang.code
                                ? "bg-violet-500/20 text-violet-300"
                                : "text-slate-300 hover:bg-slate-700/50"
                                }`}
                        >
                            <span className="text-sm font-bold text-violet-400">{lang.shortCode}</span>
                            <span className="font-medium">{lang.label}</span>
                            {locale === lang.code && (
                                <span className="ml-auto w-2 h-2 rounded-full bg-violet-400" />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
