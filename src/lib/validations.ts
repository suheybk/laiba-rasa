import { z } from "zod";

// ============================================
// AUTH SCHEMAS
// ============================================

export const registerSchema = z.object({
    email: z.string().email("Geçerli bir e-posta adresi girin"),
    password: z
        .string()
        .min(8, "Şifre en az 8 karakter olmalı")
        .regex(/[A-Z]/, "En az bir büyük harf içermeli")
        .regex(/[0-9]/, "En az bir rakam içermeli"),
    username: z
        .string()
        .min(3, "Kullanıcı adı en az 3 karakter olmalı")
        .max(50, "Kullanıcı adı en fazla 50 karakter olabilir")
        .regex(/^[a-zA-Z0-9_]+$/, "Sadece harf, rakam ve alt çizgi kullanılabilir"),
    language: z.enum(["TR", "AR", "EN"]).default("TR"),
});

export const loginSchema = z.object({
    email: z.string().email("Geçerli bir e-posta adresi girin"),
    password: z.string().min(1, "Şifre gerekli"),
});

// ============================================
// NOTE SCHEMAS
// ============================================

export const conceptSchema = z.object({
    term: z.string().min(1, "Terim gerekli").max(255),
    definition: z
        .string()
        .min(10, "Tanım en az 10 karakter olmalı")
        .max(500, "Tanım en fazla 500 karakter olabilir"),
    keywords: z.array(z.string()).default([]),
    importance: z.number().min(1).max(5).default(3),
});

export const relationshipSchema = z.object({
    sourceConceptId: z.string(),
    targetConceptId: z.string(),
    relationshipType: z.enum([
        "PRODUCES",
        "REQUIRES",
        "CAUSES",
        "PART_OF",
        "SIMILAR_TO",
        "OPPOSITE_OF",
        "LEADS_TO",
        "DEPENDS_ON",
    ]),
    description: z.string().optional(),
});

export const applicationSchema = z.object({
    relatedConceptIds: z.array(z.string()).min(1),
    scenario: z.string().min(10, "Senaryo en az 10 karakter olmalı"),
    context: z.string().optional(),
});

export const questionSchema = z.object({
    questionText: z.string().min(5, "Soru en az 5 karakter olmalı"),
    answerConceptIds: z.array(z.string()).min(1),
    difficulty: z.number().min(1).max(5).default(3),
    bloomLevel: z
        .enum(["REMEMBER", "UNDERSTAND", "APPLY", "ANALYZE", "EVALUATE", "CREATE"])
        .default("UNDERSTAND"),
});

export const noteSchema = z.object({
    title: z.string().min(1, "Başlık gerekli").max(255),
    language: z.enum(["TR", "AR", "EN"]),
    subject: z.string().optional(),
    topic: z.string().optional(),
    concepts: z.array(conceptSchema).min(3, "En az 3 kavram gerekli"),
    relationships: z.array(relationshipSchema).min(2, "En az 2 ilişki gerekli"),
    applications: z.array(applicationSchema).min(1, "En az 1 uygulama gerekli"),
    questions: z.array(questionSchema).min(2, "En az 2 soru gerekli"),
});

// ============================================
// GAME SCHEMAS
// ============================================

export const gameSessionSchema = z.object({
    noteId: z.string(),
    mode: z.enum(["DUNGEON", "ARENA", "RAID"]),
    settings: z
        .object({
            difficulty: z.union([z.literal("auto"), z.number().min(1).max(5)]).default("auto"),
            cardCount: z.number().min(10).max(50).default(20),
        })
        .optional(),
});

export const gameResponseSchema = z.object({
    cardId: z.string(),
    answer: z.string(),
    timeTakenMs: z.number().min(0),
    hintsUsed: z.number().min(0).default(0),
});

// ============================================
// SUBSCRIPTION SCHEMAS
// ============================================

export const subscriptionSchema = z.object({
    tier: z.enum(["BASIC", "PRO", "PRO_MAX"]),
    period: z.enum(["WEEKLY", "MONTHLY", "YEARLY"]),
    paymentToken: z.string().optional(),
});

// ============================================
// CREATOR SCHEMAS
// ============================================

export const withdrawalSchema = z.object({
    amountCents: z.number().min(5000, "Minimum çekim 50 USD / 1500 TRY"),
    method: z.enum(["BANK_TRANSFER", "PAYPAL"]),
    details: z.object({
        accountNumber: z.string().optional(),
        bankName: z.string().optional(),
        paypalEmail: z.string().email().optional(),
    }),
});

// ============================================
// TYPE EXPORTS
// ============================================

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type NoteInput = z.infer<typeof noteSchema>;
export type ConceptInput = z.infer<typeof conceptSchema>;
export type RelationshipInput = z.infer<typeof relationshipSchema>;
export type ApplicationInput = z.infer<typeof applicationSchema>;
export type QuestionInput = z.infer<typeof questionSchema>;
export type GameSessionInput = z.infer<typeof gameSessionSchema>;
export type GameResponseInput = z.infer<typeof gameResponseSchema>;
export type SubscriptionInput = z.infer<typeof subscriptionSchema>;
export type WithdrawalInput = z.infer<typeof withdrawalSchema>;
