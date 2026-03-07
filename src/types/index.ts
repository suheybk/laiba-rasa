import {
    Language,
    Visibility,
    ReviewStatus,
    RelationshipType,
    BloomLevel,
    CardType,
    GameMode,
    SubscriptionTier,
    SubscriptionPeriod,
    SubscriptionStatus,
    RealizationStatus,
    EducationLevel,
    SignalSource,
} from "@prisma/client";

// ============================================
// NOTE TYPES
// ============================================

export interface Concept {
    id: string;
    term: string;
    definition: string;
    keywords: string[];
    importance: number;
}

export interface Relationship {
    id: string;
    sourceConceptId: string;
    targetConceptId: string;
    relationshipType: RelationshipType;
    description?: string;
}

export interface Application {
    id: string;
    relatedConceptIds: string[];
    scenario: string;
    context?: string;
}

export interface Question {
    id: string;
    questionText: string;
    answerConceptIds: string[];
    difficulty: number;
    bloomLevel: BloomLevel;
}

export interface Note {
    id: string;
    userId: string;
    title: string;
    language: Language;
    subject?: string;
    topic?: string;
    qualityScore: number;
    visibility: Visibility;
    reviewStatus: ReviewStatus;
    createdAt: Date;
    updatedAt: Date;
    concepts: Concept[];
    relationships: Relationship[];
    applications: Application[];
    questions: Question[];
}

// ============================================
// GAME TYPES
// ============================================

export interface GameCard {
    id: string;
    noteId: string;
    cardType: CardType;
    content: {
        question: string;
        options?: string[];
        correctAnswer: string;
        explanation?: string;
        pairs?: Array<{ term: string; definition: string }>;
    };
    difficulty: number;
    importance: number;
    prerequisites: string[];
    hints: Array<{ level: number; text: string }>;
    feedback: {
        correct: string;
        incorrect: string;
    };
    confidenceScore: number;
    verified: boolean;
}

export interface GameSession {
    id: string;
    userId: string;
    noteId: string;
    mode: GameMode;
    startedAt: Date;
    endedAt?: Date;
    score: number;
    correctCount: number;
    totalCount: number;
    durationSeconds?: number;
}

export interface GameResponse {
    id: string;
    sessionId: string;
    cardId: string;
    userAnswer?: string;
    isCorrect: boolean;
    timeTakenMs: number;
    hintsUsed: number;
}

export interface MasteryData {
    subject: string;
    topic: string;
    mastery: number;
    lastPlayed: Date;
}

// ============================================
// SUBSCRIPTION TYPES
// ============================================

export interface Subscription {
    id: string;
    userId: string;
    tier: SubscriptionTier;
    period: SubscriptionPeriod;
    status: SubscriptionStatus;
    startsAt: Date;
    endsAt: Date;
    trialUsed: boolean;
}

export interface PricingPlan {
    tier: SubscriptionTier;
    name: string;
    features: string[];
    pricing: {
        weekly: number;
        monthly: number;
        yearly: number;
    };
}

// ============================================
// CREATOR TYPES
// ============================================

export interface CreatorWallet {
    id: string;
    userId: string;
    balanceCents: number;
    lifetimeEarningsCents: number;
    pendingCents: number;
}

export interface Earning {
    id: string;
    walletId: string;
    noteId: string;
    playMinutes: number;
    amountCents: number;
    qualityMultiplier: number;
    periodStart: Date;
    periodEnd: Date;
}

export interface CreatorEligibility {
    status: "eligible" | "pending" | "ineligible";
    missingRequirements: string[];
    metrics: {
        followers: number;
        activeLearningHours: number;
        noteCompletionRate: number;
        averageNoteQuality: number;
        accountAgeDays: number;
    };
}

// ============================================
// UI TYPES
// ============================================

export interface OnboardingStep {
    id: string;
    title: string;
    description: string;
    component: "craq-intro" | "concept-practice" | "relationship-practice" | "application-practice" | "question-practice" | "score-reveal" | "first-game";
    isCompleted: boolean;
}

export interface Toast {
    id: string;
    type: "success" | "error" | "info" | "warning";
    message: string;
    duration?: number;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    errors?: string[];
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
}

// ============================================
// LOCALIZATION
// ============================================

export type LocaleKey = "tr" | "ar" | "en";

export interface LocaleStrings {
    common: {
        save: string;
        cancel: string;
        delete: string;
        edit: string;
        loading: string;
        error: string;
        success: string;
    };
    auth: {
        login: string;
        register: string;
        logout: string;
        email: string;
        password: string;
        username: string;
    };
    notes: {
        createNote: string;
        concepts: string;
        relationships: string;
        applications: string;
        questions: string;
        qualityScore: string;
        publish: string;
    };
    game: {
        dungeon: string;
        arena: string;
        raid: string;
        play: string;
        score: string;
        mastery: string;
    };
}

// ============================================
// CAREER DISCOVERY TYPES
// ============================================

export interface CareerCategoryData {
    id: string;
    slug: string;
    nameTr: string;
    nameEn: string;
    nameAr: string;
    descriptionTr: string;
    icon: string;
    colorHex: string;
    worldNameTr: string;
    worldNameEn: string;
    worldImage: string;
    heroNameTr: string;
    heroNameEn: string;
    heroImage: string;
    jobCount?: number;
}

export interface CareerJobData {
    id: string;
    categoryId: string;
    nameTr: string;
    nameEn: string;
    heroRoleTr: string;
    heroRoleEn: string;
    superPowerTr: string;
    superPowerEn: string;
    yearPredicted: number;
    realizationStatus: RealizationStatus;
    jobNumber: number;
    category?: CareerCategoryData;
}

export interface CareerProfileData {
    id: string;
    userId: string;
    primaryCategoryId: string | null;
    secondaryCategoryIds: string[];
    topJobs: Array<{ jobId: string; score: number }>;
    categoryScores: Record<string, number>;
    confidenceScore: number;
    dataSessionsCount: number;
    heroType: string;
    version: number;
    lastUpdated: Date;
}

export interface CareerSignalData {
    categoryId: string;
    sourceType: SignalSource;
    weight: number;
    signalData?: Record<string, unknown>;
    sessionId?: string;
}

export interface CareerQuestionData {
    id: string;
    questionNumber: number;
    educationLevel: EducationLevel;
    sectionTitle: string;
    questionTr: string;
    questionEn: string;
    questionAr: string;
    suggestedJobs: string;
    categoryTag: string;
    answerOptions?: {
        options: Array<{
            text: string;
            categoryWeights: Record<string, number>;
        }>;
    };
}

export interface CareerReportData {
    heroType: string;
    heroImage: string;
    primaryCategory: CareerCategoryData;
    secondaryCategories: CareerCategoryData[];
    topJobs: Array<CareerJobData & { matchScore: number }>;
    radarData: Array<{ category: string; score: number; color: string }>;
    confidenceScore: number;
    dataSessionsCount: number;
    learningRecommendations: string[];
}
