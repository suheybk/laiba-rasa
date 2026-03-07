// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import { prisma } from "@/lib/db";

export const runtime = "edge";



export const dynamic = 'force-dynamic';

interface ExtractedConcept {
    term: string;
    definition: string;
    keywords: string[];
}

interface ExtractedQuestion {
    questionText: string;
    options: string[];
    correctIndex: number;
}

// Rule-based text processing to extract concepts and questions
function processTextContent(text: string): { concepts: ExtractedConcept[], questions: ExtractedQuestion[] } {
    const concepts: ExtractedConcept[] = [];
    const questions: ExtractedQuestion[] = [];

    const lines = text.split('\n').filter(line => line.trim().length > 5);

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Pattern 1: "Term: Definition" or "Term - Definition"
        const colonMatch = line.match(/^([A-ZÇĞİÖŞÜa-zçğıöşü\s]{2,50})\s*[:–-]\s*(.{20,})/);
        if (colonMatch) {
            const term = colonMatch[1].trim();
            const definition = colonMatch[2].trim();

            // Extract keywords from definition
            const keywords = definition
                .split(/[,;.]/)
                .filter(w => w.length > 3 && w.length < 30)
                .slice(0, 5)
                .map(w => w.trim());

            concepts.push({ term, definition, keywords });
            continue;
        }

        // Pattern 2: Bold or emphasized terms (usually short uppercase words)
        if (line.length < 50 && /^[A-ZÇĞİÖŞÜ\s]+$/.test(line) && i + 1 < lines.length) {
            const nextLine = lines[i + 1].trim();
            if (nextLine.length > 30) {
                concepts.push({
                    term: line,
                    definition: nextLine,
                    keywords: []
                });
                i++; // Skip next line
                continue;
            }
        }

        // Pattern 3: Numbered definitions (1. Term - Definition)
        const numberedMatch = line.match(/^\d+[.)]\s*([A-ZÇĞİÖŞÜa-zçğıöşü\s]{2,40})\s*[:–-]\s*(.{15,})/);
        if (numberedMatch) {
            concepts.push({
                term: numberedMatch[1].trim(),
                definition: numberedMatch[2].trim(),
                keywords: []
            });
        }
    }

    // Generate questions from concepts
    if (concepts.length >= 4) {
        for (let i = 0; i < Math.min(concepts.length, 10); i++) {
            const concept = concepts[i];
            const otherConcepts = concepts.filter((_, idx) => idx !== i);

            // Shuffle and pick 3 wrong answers
            const wrongAnswers = otherConcepts
                .sort(() => Math.random() - 0.5)
                .slice(0, 3)
                .map(c => c.term);

            const options = [concept.term, ...wrongAnswers].sort(() => Math.random() - 0.5);
            const correctIndex = options.indexOf(concept.term);

            questions.push({
                questionText: `"${concept.definition.substring(0, 150)}..." tanımı hangisine aittir?`,
                options,
                correctIndex
            });
        }
    }

    return { concepts, questions };
}

export async function POST(req: NextRequest) {
    try {
        const session = await auth();

        if (!session || !session.user?.email) {
            return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true, role: true }
        });

        if (!user || (user.role !== "TEACHER" && user.role !== "ADMIN")) {
            return NextResponse.json({ error: "Bu özellik sadece öğretmenler için" }, { status: 403 });
        }

        const body = await req.json();
        const { extractedText, title, subject } = body;

        if (!extractedText || extractedText.length < 50) {
            return NextResponse.json({ error: "Yeterli metin içeriği yok" }, { status: 400 });
        }

        // Process the text
        const { concepts, questions } = processTextContent(extractedText);

        if (concepts.length === 0) {
            return NextResponse.json({
                error: "Metinden kavram çıkarılamadı",
                suggestion: "Metin 'Terim: Tanım' formatında olmalı"
            }, { status: 400 });
        }

        // Create the note in database
        const note = await prisma.note.create({
            data: {
                title: title || "PDF'den Oluşturulan Not",
                subject: subject || "Genel",
                topic: "PDF İçeriği",
                userId: user.id,
                language: "TR",
                qualityScore: Math.min(100, concepts.length * 10 + questions.length * 5),
                concepts: {
                    create: concepts.map((c) => ({
                        term: c.term,
                        definition: c.definition,
                        keywords: c.keywords,
                        importance: 3
                    }))
                },
                questions: {
                    create: questions.map((q) => ({
                        questionText: q.questionText,
                        answerConceptIds: [],
                        difficulty: 3,
                        bloomLevel: "UNDERSTAND"
                    }))
                }
            }
        });

        return NextResponse.json({
            success: true,
            note: {
                id: note.id,
                title: note.title,
                conceptCount: concepts.length,
                questionCount: questions.length,
                qualityScore: note.qualityScore
            },
            message: `${concepts.length} kavram ve ${questions.length} soru oluşturuldu!`
        });

    } catch (error: any) {
        console.error("Process PDF error:", error);
        return NextResponse.json({
            error: "İşleme hatası",
            details: error instanceof Error ? error.message : "Bilinmeyen hata"
        }, { status: 500 });
    }
}
