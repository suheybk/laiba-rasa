import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Kariyer Keşfi — Geleceğin Kahramanını Keşfet | LAIBA",
    description:
        "6 sahnelik kariyer keşif yolculuğuyla geleceğin hangi dünyasına ait olduğunu keşfet. Oyun oynarken kariyer profilin oluşsun!",
    openGraph: {
        title: "Kariyer Keşfi — Sen Hangi Dünyanın Kahramanısın?",
        description:
            "6 sahnelik kariyer keşif yolculuğuyla geleceğin kahramanını keşfet!",
        images: ["/images/career/web/LAIBA App Mockup.png"],
        type: "website",
    },
};

export default function CareerOnboardingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
