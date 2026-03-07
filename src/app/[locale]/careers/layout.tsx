import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Kariyer Kataloğu — Geleceğin 295 Mesleği | LAIBA",
    description:
        "Yapay zekadan uzay bilimine, metaverse tasarımından siber güvenliğe — geleceğin tüm mesleklerini keşfet. 16 kategori, 295 meslek.",
    openGraph: {
        title: "Kariyer Kataloğu — Geleceğin 295 Mesleği",
        description:
            "Yapay zekadan uzay bilimine — geleceğin 295 mesleğini keşfet. Hangi dünya seni bekliyor?",
        images: ["/images/career/web/Kariyer Kataloğu Hero Görseli.png"],
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Kariyer Kataloğu — Geleceğin 295 Mesleği | LAIBA",
        description:
            "Yapay zekadan uzay bilimine — geleceğin 295 mesleğini keşfet.",
        images: ["/images/career/web/Kariyer Kataloğu Hero Görseli.png"],
    },
};

export default function CareersLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
