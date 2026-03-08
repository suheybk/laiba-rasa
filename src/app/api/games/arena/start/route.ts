
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const session = await auth();

        // Demo modu: Session yoksa demo kartları döndür
        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({
                gameId: "demo-arena-" + Date.now(),
                cards: [
                    {
                        id: "1", type: "multiple-choice",
                        question: "Mitokondri nedir?",
                        options: ["Hücrenin enerji santrali", "Protein üretir", "Hücre zarı", "Çekirdek"],
                        correctIndex: 0, difficulty: 1, hint: "ATP üretimi"
                    },
                    {
                        id: "2", type: "multiple-choice",
                        question: "Osmanlı Devleti hangi yılda kuruldu?",
                        options: ["1299", "1453", "1071", "1923"],
                        correctIndex: 0, difficulty: 1, hint: "13. yüzyıl"
                    },
                    {
                        id: "3", type: "multiple-choice",
                        question: "Türevin geometrik anlamı nedir?",
                        options: ["Teğet doğrunun eğimi", "Alan", "Hacim", "Çevre"],
                        correctIndex: 0, difficulty: 2, hint: "Eğim"
                    },
                    {
                        id: "4", type: "multiple-choice",
                        question: "\"Hücrenin protein fabrikası\" hangisidir?",
                        options: ["Ribozom", "Golgi", "Lizozom", "Sentrozom"],
                        correctIndex: 0, difficulty: 2, hint: "RNA"
                    },
                    {
                        id: "5", type: "multiple-choice",
                        question: "İstanbul'un fethi hangi yılda gerçekleşti?",
                        options: ["1453", "1299", "1071", "1517"],
                        correctIndex: 0, difficulty: 1, hint: "Fatih"
                    },
                    {
                        id: "6", type: "multiple-choice",
                        question: "İntegral neyi hesaplar?",
                        options: ["Eğri altında kalan alan", "Eğim", "Hız", "İvme"],
                        correctIndex: 0, difficulty: 2, hint: "Alan"
                    },
                    {
                        id: "7", type: "multiple-choice",
                        question: "DNA'nın yapı taşı nedir?",
                        options: ["Nükleotid", "Amino asit", "Glikoz", "Yağ asidi"],
                        correctIndex: 0, difficulty: 2, hint: "Baz"
                    },
                    {
                        id: "8", type: "multiple-choice",
                        question: "Malazgirt Savaşı hangi yılda yapıldı?",
                        options: ["1071", "1453", "1299", "1923"],
                        correctIndex: 0, difficulty: 1, hint: "Selçuklu"
                    },
                ],
                isDemo: true
            });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Fetch randomized concepts directly
        // Arena mode focuses on rapid concept definitions
        const concepts = await prisma.concept.findMany({
            where: { note: { userId: user.id } },
            take: 50
        });

        if (concepts.length < 4) {
            return NextResponse.json({
                error: "Not enough content",
                details: "Arena için en az 4 kavram gerekli."
            }, { status: 400 });
        }

        const gameConcepts = concepts.sort(() => 0.5 - Math.random()).slice(0, 20);

        const finalCards = gameConcepts.map(c => {
            // 1. Definition Question
            const isDefinitionQuestion = Math.random() > 0.5;
            let questionText = "";
            let correctAnswer = "";
            let options = [];

            if (isDefinitionQuestion) {
                questionText = `${c.term} nedir?`;
                correctAnswer = c.definition.substring(0, 100) + (c.definition.length > 100 ? "..." : "");

                // Distractors: definitions of other concepts
                const distractors = concepts
                    .filter(oc => oc.id !== c.id)
                    .sort(() => 0.5 - Math.random())
                    .slice(0, 3)
                    .map(oc => oc.definition.substring(0, 100) + (oc.definition.length > 100 ? "..." : ""));

                options = [correctAnswer, ...distractors];
            } else {
                // Reverse: Definition given, find term
                questionText = `"${c.definition.substring(0, 150)}..." tanımı hangisine aittir?`;
                correctAnswer = c.term;

                // Distractors: other terms
                const distractors = concepts
                    .filter(oc => oc.id !== c.id)
                    .sort(() => 0.5 - Math.random())
                    .slice(0, 3)
                    .map(oc => oc.term);

                options = [correctAnswer, ...distractors];
            }

            // Shuffle options
            const shuffledOptions = options.sort(() => 0.5 - Math.random());
            const correctIndex = shuffledOptions.indexOf(correctAnswer);

            return {
                id: c.id,
                type: "multiple-choice",
                question: questionText,
                options: shuffledOptions,
                correctIndex: correctIndex,
                difficulty: c.importance || 1,
                hint: (() => {
                    const keywords = Array.isArray(c.keywords) ? c.keywords as string[] : [];
                    return keywords.length > 0 ? `İpucu: ${keywords[0]}` : "İpucu yok.";
                })()
            };
        });

        return NextResponse.json({
            gameId: Date.now().toString(),
            cards: finalCards
        });

    } catch (error) {
        console.error("Arena start error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
