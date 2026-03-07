import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Kariyer Raporun — Kariyer Yolculuğum | LAIBA",
    description:
        "Kariyer pusulan, en uygun meslekler ve kahraman profilin — oyun oynamaya devam et, profilin gelişsin!",
    openGraph: {
        title: "Kariyer Yolculuğum — LAIBA Kariyer Raporu",
        description: "Kariyer pusulan ve sana en uygun meslekleri keşfet!",
        images: ["/images/career/gameplay/Radar Chart Arka Planı.png"],
        type: "website",
    },
};

export default function CareerReportLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
