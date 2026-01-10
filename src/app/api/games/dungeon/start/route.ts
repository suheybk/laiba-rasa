
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { noteId } = await req.json();

        // 1. Fetch Note with all data
        const note = await prisma.note.findUnique({
            where: { id: noteId },
            include: {
                concepts: true,
                relationships: { include: { sourceConcept: true, targetConcept: true } },
                applications: true,
                questions: true
            }
        });

        if (!note) {
            return NextResponse.json({ error: "Note not found" }, { status: 404 });
        }

        // 2. Generate Game Cards
        const cards = [];
        const concepts = note.concepts;

        // A. Definition Cards
        for (const concept of concepts) {
            // Get distractors (other concepts)
            const distractors = concepts
                .filter(c => c.id !== concept.id)
                .sort(() => 0.5 - Math.random())
                .slice(0, 3)
                .map(c => c.definition);

            // If not enough distractors, pad with generic ones (simplified) or dupes
            while (distractors.length < 3) {
                distractors.push("İlgisiz seçenek"); // In real app, fetch from global pool
            }

            const options = [concept.definition, ...distractors].sort(() => 0.5 - Math.random());
            const correctIndex = options.indexOf(concept.definition);

            cards.push({
                type: "DEFINITION",
                question: `${concept.term} nedir?`,
                options,
                correctIndex,
                difficulty: 1,
                hint: concept.keywords[0] ? `İpucu: ${concept.keywords[0]}` : "Tanımı hatırla.",
                feedback: {
                    correct: "Harika! Doğru tanım.",
                    incorrect: `Doğru cevap: ${concept.definition}`
                },
                cardId: concept.id // specific logic id if needed
            });
        }

        // B. Reverse Definition Cards
        for (const concept of concepts) {
            const distractors = concepts
                .filter(c => c.id !== concept.id)
                .sort(() => 0.5 - Math.random())
                .slice(0, 3)
                .map(c => c.term);

            while (distractors.length < 3) distractors.push("???");

            const options = [concept.term, ...distractors].sort(() => 0.5 - Math.random());
            const correctIndex = options.indexOf(concept.term);

            cards.push({
                type: "TERM_MATCH",
                question: `Bu tanım hangisine aittir: "${concept.definition.substring(0, 50)}..."?`,
                options,
                correctIndex,
                difficulty: 2,
                hint: "Terimlerle eşleştir.",
                feedback: {
                    correct: "Doğru eşleştirme!",
                    incorrect: `Cevap: ${concept.term}`
                }
            });
        }

        // Shuffle cards
        const shuffledCards = cards.sort(() => 0.5 - Math.random());

        // 3. Create Session (Simplified: Not storing cards in DB for this V1 to save space, passing them to client)
        // For a robust app, we should store GameCard entities. For this MVP, we return JSON.

        // We create a session to track score later
        const gameSession = await prisma.gameSession.create({
            data: {
                userId: note.userId, // Assuming player is owner for now
                noteId: note.id,
                mode: "DUNGEON",
            }
        });

        return NextResponse.json({
            sessionId: gameSession.id,
            cards: shuffledCards
        });

    } catch (error) {
        console.error("Game start error:", error);
        return NextResponse.json({ error: "Failed to start game" }, { status: 500 });
    }
}
