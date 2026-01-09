import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatCurrency(cents: number, currency: "TRY" | "SAR" | "USD"): string {
    const amount = cents / 100;
    const symbols: Record<string, string> = {
        TRY: "₺",
        SAR: "﷼",
        USD: "$",
    };
    return `${symbols[currency]}${amount.toFixed(2)}`;
}

export function calculateQualityScore(
    conceptScore: number,
    relationshipScore: number,
    applicationScore: number,
    questionScore: number,
    completionMultiplier: number,
    grammarScore: number = 1.0
): number {
    const languageQualityBonus = grammarScore * 0.1 + 1.0;

    const score =
        (conceptScore * 0.3 +
            relationshipScore * 0.25 +
            applicationScore * 0.25 +
            questionScore * 0.2) *
        completionMultiplier *
        languageQualityBonus;

    return Math.round(Math.min(100, Math.max(0, score * 100)));
}

export function getSubscriptionPricing(tier: string, period: string, currency: "TRY" | "SAR" | "USD") {
    const pricing: Record<string, Record<string, Record<string, number>>> = {
        basic: {
            weekly: { TRY: 2999, SAR: 499, USD: 199 },
            monthly: { TRY: 7999, SAR: 1499, USD: 499 },
            yearly: { TRY: 59999, SAR: 11999, USD: 3999 },
        },
        pro: {
            weekly: { TRY: 4999, SAR: 999, USD: 399 },
            monthly: { TRY: 14999, SAR: 2999, USD: 999 },
            yearly: { TRY: 99999, SAR: 19999, USD: 7999 },
        },
        pro_max: {
            weekly: { TRY: 7999, SAR: 1499, USD: 599 },
            monthly: { TRY: 24999, SAR: 4999, USD: 1999 },
            yearly: { TRY: 149999, SAR: 29999, USD: 14999 },
        },
    };

    return pricing[tier]?.[period]?.[currency] ?? 0;
}

export function calculateCreatorPayout(
    playMinutes: number,
    qualityScore: number,
    perMinuteRateCents: number = 0.1, // $0.001 = 0.1 cents
    platformRetention: number = 0.3 // Creator gets 30%
): number {
    const qualityMultiplier = Math.min(1, Math.max(0.75, qualityScore / 100));
    return Math.floor(playMinutes * perMinuteRateCents * qualityMultiplier * platformRetention);
}

export function generateGameCards(
    concepts: Array<{ term: string; definition: string }>,
    relationships: Array<{ description: string }>,
    language: "TR" | "AR" | "EN"
) {
    const cards: Array<{
        type: string;
        content: Record<string, unknown>;
        difficulty: number;
    }> = [];

    // Definition cards
    concepts.forEach((concept) => {
        cards.push({
            type: "DEFINITION",
            content: {
                question: getQuestionPrefix("definition", language) + concept.term + "?",
                answer: concept.definition,
                term: concept.term,
            },
            difficulty: 1,
        });
    });

    // Gap fill cards
    concepts.forEach((concept) => {
        const words = concept.definition.split(" ");
        if (words.length >= 3) {
            const gapIndex = Math.floor(words.length / 2);
            const answer = words[gapIndex];
            words[gapIndex] = "____";
            cards.push({
                type: "GAP_FILL",
                content: {
                    question: words.join(" "),
                    answer: answer,
                    term: concept.term,
                },
                difficulty: 3,
            });
        }
    });

    // Matching cards (if enough concepts)
    if (concepts.length >= 4) {
        cards.push({
            type: "MATCHING",
            content: {
                pairs: concepts.slice(0, 4).map((c) => ({
                    term: c.term,
                    definition: c.definition,
                })),
            },
            difficulty: 2,
        });
    }

    return cards;
}

function getQuestionPrefix(type: string, language: "TR" | "AR" | "EN"): string {
    const prefixes: Record<string, Record<string, string>> = {
        definition: {
            TR: "Nedir: ",
            AR: "ما هو: ",
            EN: "What is: ",
        },
    };
    return prefixes[type]?.[language] ?? "";
}

export function validateNoteQuality(note: {
    concepts: unknown[];
    relationships: unknown[];
    applications: unknown[];
    questions: unknown[];
}): { isValid: boolean; errors: string[]; canPublish: boolean } {
    const errors: string[] = [];

    if (note.concepts.length < 3) {
        errors.push("En az 3 kavram gerekli / At least 3 concepts required");
    }
    if (note.relationships.length < 2) {
        errors.push("En az 2 ilişki gerekli / At least 2 relationships required");
    }
    if (note.applications.length < 1) {
        errors.push("En az 1 uygulama gerekli / At least 1 application required");
    }
    if (note.questions.length < 2) {
        errors.push("En az 2 soru gerekli / At least 2 questions required");
    }

    const isValid = errors.length === 0;
    const canPublish = isValid;

    return { isValid, errors, canPublish };
}
