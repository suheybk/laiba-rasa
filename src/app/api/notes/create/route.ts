
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import { prisma } from "@/lib/db";
import { z } from "zod";

export const runtime = "edge";



// Validation Schema
const noteSchema = z.object({
    title: z.string().min(1),
    subject: z.string().optional(),
    topic: z.string().optional(),
    qualityScore: z.number().default(0),
    concepts: z.array(z.object({
        id: z.string(), // Temp ID from client
        term: z.string().min(1),
        definition: z.string().min(1),
        keywords: z.array(z.string()),
        importance: z.number()
    })),
    relationships: z.array(z.object({
        sourceId: z.string(), // Temp ID
        targetId: z.string(), // Temp ID
        type: z.string(), // Enum val
        description: z.string().optional()
    })),
    applications: z.array(z.object({
        scenario: z.string(),
        context: z.string().optional(),
        conceptIds: z.array(z.string()) // Temp IDs
    })),
    questions: z.array(z.object({
        text: z.string(),
        difficulty: z.number(),
        conceptIds: z.array(z.string()) // Temp IDs
    }))
});

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session || !session.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const json = await req.json();
        const body = noteSchema.parse(json);

        // Use transaction to ensure integrity
        const result = await prisma.$transaction(async (tx) => {
            // 1. Create Note
            const note = await tx.note.create({
                data: {
                    userId: user.id,
                    title: body.title,
                    subject: body.subject,
                    topic: body.topic,
                    qualityScore: body.qualityScore,
                    language: "TR" // Default
                }
            });

            // 2. Create Concepts & Build ID Map (Temp -> Real)
            const idMap = new Map<string, string>();

            for (const c of body.concepts) {
                const created = await tx.concept.create({
                    data: {
                        noteId: note.id,
                        term: c.term,
                        definition: c.definition,
                        keywords: c.keywords,
                        importance: c.importance
                    }
                });
                idMap.set(c.id, created.id);
            }

            // 3. Create Relationships (using Real IDs)
            for (const r of body.relationships) {
                const sourceId = idMap.get(r.sourceId);
                const targetId = idMap.get(r.targetId);

                if (sourceId && targetId) {
                    // Validate Enum - simplistic check or type cast
                    // Prisma expects the enum value string
                    await tx.relationship.create({
                        data: {
                            noteId: note.id,
                            sourceConceptId: sourceId,
                            targetConceptId: targetId,
                            relationshipType: r.type as any, // Cast to enum
                            description: r.description || ""
                        }
                    });
                }
            }

            // 4. Create Applications
            for (const app of body.applications) {
                const realConceptIds = app.conceptIds
                    .map(id => idMap.get(id))
                    .filter((id): id is string => !!id);

                await tx.application.create({
                    data: {
                        noteId: note.id,
                        scenario: app.scenario,
                        context: app.context,
                        relatedConceptIds: realConceptIds
                    }
                });
            }

            // 5. Create Questions
            for (const q of body.questions) {
                const realConceptIds = q.conceptIds
                    .map(id => idMap.get(id))
                    .filter((id): id is string => !!id);

                await tx.question.create({
                    data: {
                        noteId: note.id,
                        questionText: q.text,
                        difficulty: q.difficulty,
                        answerConceptIds: realConceptIds
                    }
                });
            }

            return note;
        });

        return NextResponse.json(result);

    } catch (error) {
        console.error("Note creation error:", error);
        return NextResponse.json(
            { error: "Failed to create note", details: error instanceof Error ? error.message : "Unknown" },
            { status: 500 }
        );
    }
}
