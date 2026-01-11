import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SessionProvider } from "@/components/providers/session-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LAIBA - Oyunla Öğren",
  description: "Notlarını oyuna dönüştür, oynayarak öğren. LAIBA ile eğitim artık eğlence!",
  keywords: ["eğitim", "oyun", "öğrenme", "not", "quiz", "türkçe"],
  authors: [{ name: "LAIBA" }],
  openGraph: {
    title: "LAIBA - Oyunla Öğren",
    description: "Notlarını oyuna dönüştür, oynayarak öğren.",
    type: "website",
    locale: "tr_TR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" dir="ltr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased animated-gradient min-h-screen`}
        suppressHydrationWarning
      >
        <SessionProvider>
          {/* Background orbs */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
            <div className="orb orb-violet w-96 h-96 top-[-10%] left-[-5%]" />
            <div className="orb orb-indigo w-80 h-80 top-[20%] right-[-10%]" style={{ animationDelay: "-5s" }} />
            <div className="orb orb-gold w-64 h-64 bottom-[10%] left-[30%]" style={{ animationDelay: "-10s" }} />
          </div>

          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
