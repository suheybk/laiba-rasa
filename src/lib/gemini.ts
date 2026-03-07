import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY || "";

// CRAQ Interfaces
export interface Concept {
    term: string;
    definition: string;
    keywords: string[];
    importance: number;
}

export interface Relationship {
    sourceTerm: string; // We'll map this to IDs later
    targetTerm: string;
    type: "PRODUCES" | "REQUIRES" | "CAUSES" | "PART_OF" | "LEADS_TO" | "SIMILAR_TO";
    description: string;
}

export interface Application {
    scenario: string;
    context: string;
    relatedTerms: string[];
}

export interface Question {
    text: string;
    answer: string;
    difficulty: number; // 1-5
    relatedTerms: string[];
}

export interface AIAnalysisResult {
    concepts: Concept[];
    relationships: Relationship[];
    applications: Application[];
    questions: Question[];
}

export async function analyzeTextForCRAQ(text: string): Promise<AIAnalysisResult | null> {
    if (!API_KEY) {
        console.error("GEMINI_API_KEY is missing");
        return null;
    }

    try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig: { responseMimeType: "application/json" } });

        const prompt = `
        You are an educational content creator AI. Normalize and analyze the following text to create comprehensive study notes using the CRAQ (Concepts, Relationships, Applications, Questions) framework.
        
        Analyze this text:
        """
        ${text.substring(0, 30000)}
        """

        Return a JSON object with this exact structure:
        {
            "concepts": [
                { "term": "string", "definition": "detailed definition", "keywords": ["k1", "k2"], "importance": 1-5 }
            ],
            "relationships": [
                { "sourceTerm": "term1", "targetTerm": "term2", "type": "one of (PRODUCES, REQUIRES, CAUSES, PART_OF, LEADS_TO, SIMILAR_TO)", "description": "how they are related" }
            ],
            "applications": [
                { "scenario": "real world usage description", "context": "field or industry", "relatedTerms": ["term1"] }
            ],
            "questions": [
                { "text": "question text", "answer": "correct answer", "difficulty": 1-5, "relatedTerms": ["term1"] }
            ]
        }

        Rules:
        1. Extract at least 3-5 key concepts. Definitions should be clear and academic.
        2. Find at least 3 meaningful relationships between these concepts. Use the sourceTerm and targetTerm that exactly match the concept terms.
        3. Create at least 2 real-world application scenarios.
        4. Generate at least 3 quiz questions of varying difficulty.
        5. Respond ONLY with valid JSON.
        6. If the text is in Turkish, generate the response in Turkish.
        7. If it is in English, generate in English.
        `;

        const result = await model.generateContent(prompt);
        const response = result.response;
        const textResponse = response.text();

        // Parse JSON
        const data = JSON.parse(textResponse) as AIAnalysisResult;
        return data;

    } catch (error) {
        console.error("Gemini Analysis Error:", error);
        return null;
    }
}
