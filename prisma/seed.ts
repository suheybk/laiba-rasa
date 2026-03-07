import { PrismaClient } from "@prisma/client";
import { Language, Visibility, ReviewStatus, RelationshipType, BloomLevel, CardType, GameMode, SubscriptionTier, SubscriptionPeriod, SubscriptionStatus, RealizationStatus, EducationLevel, SignalSource, Role, KycStatus } from "../src/types";
const prisma = new PrismaClient();

const exampleNotes = [
    {
        title: "Basic Arabic Greetings",
        language: "AR",
        subject: "Arabic",
        topic: "Greetings",
        concepts: [
            { term: "Assalamu Alaykum", definition: "Peace be upon you (Standard greeting)" },
            { term: "Wa Alaykum Assalam", definition: "And upon you be peace (Response)" },
            { term: "Marhaban", definition: "Hello" },
            { term: "Sabah al-Khayr", definition: "Good morning" },
            { term: "Masa' al-Khayr", definition: "Good evening" },
        ],
        questions: [
            { text: "What is the standard Islamic greeting?", answer: "Assalamu Alaykum" },
            { text: "How do you say 'Good morning' in Arabic?", answer: "Sabah al-Khayr" },
        ]
    },
    {
        title: "Introduction to React Hooks",
        language: "EN",
        subject: "Programming",
        topic: "React",
        concepts: [
            { term: "useState", definition: "Hook that allows you to have state variables in functional components" },
            { term: "useEffect", definition: "Hook that lets you perform side effects in functional components" },
            { term: "useContext", definition: "Hook that lets you subscribe to React context without introducing nesting" },
            { term: "Custom Hook", definition: "A JavaScript function that starts with 'use' and can call other hooks" },
        ],
        questions: [
            { text: "Which hook is used for side effects?", answer: "useEffect" },
            { text: "Which hook maintains state?", answer: "useState" },
        ]
    },
    {
        title: "Osmanlı Tarihi - Kuruluş",
        language: "TR",
        subject: "Tarih",
        topic: "Osmanlı",
        concepts: [
            { term: "Osman Gazi", definition: "Osmanlı Devleti'nin kurucusu" },
            { term: "Orhan Gazi", definition: "Bursa'yı fetheden ve ilk düzenli orduyu kuran padişah" },
            { term: "Söğüt", definition: "Osmanlı Beyliği'nin ilk başkenti" },
            { term: "İskan Politikası", definition: "Fethedilen yerlere Türkmenlerin yerleştirilmesi politikası" },
        ],
        questions: [
            { text: "Osmanlı Devleti'ni kim kurmuştur?", answer: "Osman Gazi" },
            { text: "İlk düzenli orduyu kim kurdu?", answer: "Orhan Gazi" },
        ]
    },
    {
        title: "Photosynthesis Basics",
        language: "EN",
        subject: "Biology",
        topic: "Plant Physiology",
        concepts: [
            { term: "Chlorophyll", definition: "Green pigment responsible for absorption of light" },
            { term: "Stomata", definition: "Pores in the leaf surface that allow gas exchange" },
            { term: "Photosynthesis", definition: "Process used by plants to convert light energy into chemical energy" },
            { term: "Glucose", definition: "Simple sugar produced during photosynthesis" },
        ],
        questions: [
            { text: "What pigment absorbs light in plants?", answer: "Chlorophyll" },
        ]
    },
    {
        title: "Temel Matematik - Üslü Sayılar",
        language: "TR",
        subject: "Matematik",
        topic: "Cebir",
        concepts: [
            { term: "Taban", definition: "Üslü ifadede alttaki sayı" },
            { term: "Üs (Kuvvet)", definition: "Sayının kaç kere çarpılacağını gösteren sayı" },
            { term: "Karesi", definition: "Bir sayının 2. kuvveti" },
            { term: "Küpü", definition: "Bir sayının 3. kuvveti" },
        ],
        questions: [
            { text: "5'in karesi kaçtır?", answer: "25" },
        ]
    },
    {
        title: "Geography of Turkey",
        language: "EN",
        subject: "Geography",
        topic: "Turkey",
        concepts: [
            { term: "Bosphorus", definition: "Strait creating a boundary between Europe and Asia" },
            { term: "Ankara", definition: "Capital city of Turkey" },
            { term: "Mount Ararat", definition: "Highest peak in Turkey" },
            { term: "Mediterranean Climate", definition: "Climate characterized by hot, dry summers and mild, wet winters" },
        ],
        questions: [
            { text: "What is the capital of Turkey?", answer: "Ankara" },
        ]
    },
    {
        title: "Introduction to Python",
        language: "EN",
        subject: "Computer Science",
        topic: "Python",
        concepts: [
            { term: "List", definition: "Ordered, changeable collection allowing duplicates" },
            { term: "Dictionary", definition: "Collection of key-value pairs" },
            { term: "Tuple", definition: "Ordered, unchangeable collection" },
            { term: "Indentation", definition: "Whitespace at the beginning of a line to define scope" },
        ],
        questions: [
            { text: "Which collection type is immutable?", answer: "Tuple" },
        ]
    },
    {
        title: "İslam Tarihi - Dört Halife",
        language: "TR",
        subject: "Tarih",
        topic: "İslam Tarihi",
        concepts: [
            { term: "Hz. Ebubekir", definition: "İlk halife, Sıddık lakabıyla bilinir" },
            { term: "Hz. Ömer", definition: "İkinci halife, adaletiyle tanınır" },
            { term: "Hz. Osman", definition: "Üçüncü halife, Kuran'ı çoğaltmıştır" },
            { term: "Hz. Ali", definition: "Dördüncü halife, ilmin kapısı olarak anılır" },
        ],
        questions: [
            { text: "Kuran-ı Kerim hangi halife zamanında çoğaltıldı?", answer: "Hz. Osman" },
        ]
    },
    {
        title: "Newton's Laws of Motion",
        language: "EN",
        subject: "Physics",
        topic: "Mechanics",
        concepts: [
            { term: "Inertia", definition: "Tendency of an object to resist changes in its state of motion" },
            { term: "Force", definition: "Push or pull upon an object resulting from interaction" },
            { term: "Action-Reaction", definition: "For every action, there is an equal and opposite reaction" },
            { term: "Mass", definition: "Quantity of matter in a body" },
        ],
        questions: [
            { text: "Which law states F=ma?", answer: "Second Law" },
        ]
    },
    {
        title: "Edebiyat - Şiir Bilgisi",
        language: "TR",
        subject: "Edebiyat",
        topic: "Şiir",
        concepts: [
            { term: "Uyak (Kafiye)", definition: "Dize sonlarındaki ses benzerliği" },
            { term: "Redif", definition: "Uyak'tan sonra gelen aynı görevdeki ekler veya kelimeler" },
            { term: "Hece Ölçüsü", definition: "Dizelerdeki hece sayısının eşitliğine dayanan ölçü" },
            { term: "Aruz Ölçüsü", definition: "Hecelerin uzunluk ve kısalığına dayanan ölçü" },
        ],
        questions: [
            { text: "Dize sonlarındaki görevsiz ses benzerliğine ne denir?", answer: "Kafiye" },
        ]
    }
];

async function main() {
    console.log('Start seeding...');

    // Get the first user to assign notes to, or create one if none exists
    let user = await prisma.user.findFirst();
    if (!user) {
        console.log('No user found, creating a default user...');
        user = await prisma.user.create({
            data: {
                email: 'demo@example.com',
                username: 'demo_user',
                password: '$2a$10$YourHashedPasswordHere', // Example hash
                displayName: 'Demo User',
            }
        });
    }

    for (const noteData of exampleNotes) {
        console.log(`Creating note: ${noteData.title}`);

        // Create the note
        const note = await prisma.note.create({
            data: {
                userId: user.id,
                title: noteData.title,
                language: noteData.language,
                subject: noteData.subject,
                topic: noteData.topic,
                visibility: "PUBLIC",
                reviewStatus: "APPROVED",
                concepts: {
                    create: noteData.concepts.map(c => ({
                        term: c.term,
                        definition: c.definition,
                        importance: 3
                    }))
                },
                questions: {
                    create: noteData.questions.map(q => ({
                        questionText: q.text,
                        difficulty: 3,
                        bloomLevel: "UNDERSTAND"
                    }))
                }
            },
            include: {
                concepts: true
            }
        });

        // Create Game Cards for the note
        // 1. Definition Cards
        for (const concept of note.concepts) {
            await prisma.gameCard.create({
                data: {
                    noteId: note.id,
                    cardType: "DEFINITION",
                    content: {
                        front: concept.term,
                        back: concept.definition
                    },
                    difficulty: 3,
                    importance: 3
                }
            });
        }

        // 2. Matching Card (if enough concepts)
        if (note.concepts.length >= 2) {
            await prisma.gameCard.create({
                data: {
                    noteId: note.id,
                    cardType: "MATCHING",
                    content: {
                        pairs: note.concepts.slice(0, 4).map(c => ({
                            id: c.id,
                            term: c.term,
                            definition: c.definition
                        }))
                    },
                    difficulty: 3,
                    importance: 3
                }
            });
        }

        // 3. Ordering Card (Mock Example)
        if (note.concepts.length >= 3) {
            await prisma.gameCard.create({
                data: {
                    noteId: note.id,
                    cardType: "ORDERING",
                    content: {
                        items: note.concepts.slice(0, 3).map((c, index) => ({
                            id: c.id,
                            text: c.term,
                            correctOrder: index + 1
                        })),
                        question: "Order these terms alphabetically (just as an example criteria)"
                    },
                    difficulty: 3,
                    importance: 3
                }
            });
        }

    }

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
