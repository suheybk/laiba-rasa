
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
                hint: c.keywords.length > 0 ? `İpucu: ${c.keywords[0]}` : "İpucu yok."
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
