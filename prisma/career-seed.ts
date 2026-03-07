import { PrismaClient } from "@prisma/client";
import { Language, Visibility, ReviewStatus, RelationshipType, BloomLevel, CardType, GameMode, SubscriptionTier, SubscriptionPeriod, SubscriptionStatus, RealizationStatus, EducationLevel, SignalSource, Role, KycStatus } from "../src/types";

const prisma = new PrismaClient();

// ============================================
// 16 CAREER CATEGORIES (15 main + 1 cross-disciplinary)
// ============================================
const categories = [
    { slug: 'ai', nameTr: 'Yapay Zeka & YZ Uygulamaları', nameEn: 'Artificial Intelligence & AI Applications', icon: '🤖', colorHex: '#00d4ff', worldNameTr: 'Zeka Kalesi', worldNameEn: 'AI Fortress', heroNameTr: 'Kod Büyücüsü', heroNameEn: 'Code Wizard', sortOrder: 1, descriptionTr: 'Yapay zeka, makine öğrenmesi ve derin öğrenme teknolojileri' },
    { slug: 'metaverse', nameTr: 'Metaverse & Sanal Dünya', nameEn: 'Metaverse & Virtual World', icon: '🌐', colorHex: '#a855f7', worldNameTr: 'Dijital Medine', worldNameEn: 'Digital Medina', heroNameTr: 'Dijital Diyar Kurucusu', heroNameEn: 'Digital Realm Founder', sortOrder: 2, descriptionTr: 'Sanal gerçeklik, artırılmış gerçeklik ve metaverse teknolojileri' },
    { slug: 'data', nameTr: 'Veri & Analitik', nameEn: 'Data & Analytics', icon: '📊', colorHex: '#22c55e', worldNameTr: 'Veri Kalesi', worldNameEn: 'Data Fortress', heroNameTr: 'Veri Kâşifi', heroNameEn: 'Data Explorer', sortOrder: 3, descriptionTr: 'Büyük veri, veri bilimi ve analitik' },
    { slug: 'cyber', nameTr: 'Siber Güvenlik & Blockchain', nameEn: 'Cybersecurity & Blockchain', icon: '🔐', colorHex: '#ef4444', worldNameTr: 'Şifre Burcu', worldNameEn: 'Cipher Bastion', heroNameTr: 'Siber Kalkan', heroNameEn: 'Cyber Shield', sortOrder: 4, descriptionTr: 'Siber güvenlik, blockchain ve kriptografi' },
    { slug: 'robotics', nameTr: 'Robotik & Otonom Sistemler', nameEn: 'Robotics & Autonomous Systems', icon: '🦾', colorHex: '#f97316', worldNameTr: 'Mekanik Vadi', worldNameEn: 'Mechanical Valley', heroNameTr: 'Makine Ustası', heroNameEn: 'Machine Master', sortOrder: 5, descriptionTr: 'Robotik, dron ve otonom araç teknolojileri' },
    { slug: 'health', nameTr: 'Sağlık & Biyoteknoloji', nameEn: 'Health & Biotechnology', icon: '🧬', colorHex: '#14b8a6', worldNameTr: 'Şifa Bahçesi', worldNameEn: 'Healing Garden', heroNameTr: 'Şifa Bilgini', heroNameEn: 'Healing Sage', sortOrder: 6, descriptionTr: 'Biyoteknoloji, genomik ve dijital sağlık' },
    { slug: 'environment', nameTr: 'Çevre & Sürdürülebilirlik', nameEn: 'Environment & Sustainability', icon: '🌿', colorHex: '#22c55e', worldNameTr: 'Yeşil Kule', worldNameEn: 'Green Tower', heroNameTr: 'Yeşil Muhafız', heroNameEn: 'Green Guardian', sortOrder: 7, descriptionTr: 'Çevre bilimi, sürdürülebilirlik ve yeşil enerji' },
    { slug: 'law', nameTr: 'Hukuk, Etik & Regülasyon', nameEn: 'Law, Ethics & Regulation', icon: '⚖️', colorHex: '#f5c518', worldNameTr: 'Adalet Sarayı', worldNameEn: 'Justice Palace', heroNameTr: 'Adalet Bekçisi', heroNameEn: 'Justice Keeper', sortOrder: 8, descriptionTr: 'Dijital hukuk, YZ etiği ve regülasyon' },
    { slug: 'marketing', nameTr: 'Pazarlama & İletişim', nameEn: 'Marketing & Communication', icon: '📣', colorHex: '#fb7185', worldNameTr: 'Ses Kalesi', worldNameEn: 'Voice Fortress', heroNameTr: 'Ses Efsanesi', heroNameEn: 'Voice Legend', sortOrder: 9, descriptionTr: 'Dijital pazarlama, içerik üretimi ve sosyal medya' },
    { slug: 'education', nameTr: 'Eğitim & Koçluk', nameEn: 'Education & Coaching', icon: '📚', colorHex: '#f59e0b', worldNameTr: 'Bilgi Tapınağı', worldNameEn: 'Knowledge Temple', heroNameTr: 'Bilge Mentor', heroNameEn: 'Wise Mentor', sortOrder: 10, descriptionTr: 'Eğitim teknolojileri, koçluk ve mentorluk' },
    { slug: 'design', nameTr: 'Tasarım & Yaratıcı Sanatlar', nameEn: 'Design & Creative Arts', icon: '🎨', colorHex: '#c084fc', worldNameTr: 'Sanat Atölyesi', worldNameEn: 'Creative Workshop', heroNameTr: 'Sanat Ustası', heroNameEn: 'Art Master', sortOrder: 11, descriptionTr: 'UX/UI tasarım, 3D modelleme ve dijital sanat' },
    { slug: 'finance', nameTr: 'Finans & Ekonomi', nameEn: 'Finance & Economy', icon: '💰', colorHex: '#eab308', worldNameTr: 'Altın Kasa', worldNameEn: 'Golden Vault', heroNameTr: 'Altın Stratejist', heroNameEn: 'Golden Strategist', sortOrder: 12, descriptionTr: 'Fintech, kripto ekonomisi ve DeFi' },
    { slug: 'psychology', nameTr: 'Psikoloji & Ruh Sağlığı', nameEn: 'Psychology & Mental Health', icon: '🧠', colorHex: '#a78bfa', worldNameTr: 'Zihin Bahçesi', worldNameEn: 'Mind Garden', heroNameTr: 'Zihin Okuyucu', heroNameEn: 'Mind Reader', sortOrder: 13, descriptionTr: 'Psikoloji, dijital terapi ve ruh sağlığı' },
    { slug: 'gaming', nameTr: 'Oyun & E-Spor', nameEn: 'Gaming & E-Sports', icon: '🎮', colorHex: '#ec4899', worldNameTr: 'Arena Stadyumu', worldNameEn: 'Arena Stadium', heroNameTr: 'Arena Efsanesi', heroNameEn: 'Arena Legend', sortOrder: 14, descriptionTr: 'Oyun tasarımı, e-spor ve oyun analitiği' },
    { slug: 'science', nameTr: 'İleri Bilim & Uzay', nameEn: 'Advanced Science & Space', icon: '🚀', colorHex: '#8b5cf6', worldNameTr: 'Yıldız Gözlemevi', worldNameEn: 'Star Observatory', heroNameTr: 'Yıldız Kaşifi', heroNameEn: 'Star Explorer', sortOrder: 15, descriptionTr: 'Kuantum, nanoteknoloji ve uzay bilimi' },
    { slug: 'cross', nameTr: 'Diğer / Kesişimsel Meslekler', nameEn: 'Cross-Disciplinary Careers', icon: '⚡', colorHex: '#facc15', worldNameTr: 'Kahraman Kavşağı', worldNameEn: 'Hero Crossroads', heroNameTr: 'Çok Yönlü Kahraman', heroNameEn: 'Multi-Path Hero', sortOrder: 16, descriptionTr: 'Birden fazla alanı kesen kesişimsel meslekler' },
];

// Category name → slug mapping
const catNameToSlug: Record<string, string> = {
    'Yapay Zeka & YZ Uygulamaları': 'ai',
    'Metaverse & Sanal Dünya': 'metaverse',
    'Veri & Analitik': 'data',
    'Siber Güvenlik & Blockchain': 'cyber',
    'Robotik & Otonom Sistemler': 'robotics',
    'Sağlık & Biyoteknoloji': 'health',
    'Çevre & Sürdürülebilirlik': 'environment',
    'Hukuk, Etik & Regülasyon': 'law',
    'Pazarlama & İletişim': 'marketing',
    'Eğitim & Koçluk': 'education',
    'Tasarım & Yaratıcı Sanatlar': 'design',
    'Finans & Ekonomi': 'finance',
    'Psikoloji & Ruh Sağlığı': 'psychology',
    'Oyun & E-Spor': 'gaming',
    'İleri Bilim & Uzay': 'science',
    'Diğer / Kesişimsel Meslekler': 'cross',
};

function resolveSlug(categoryName: string): string {
    for (const [key, slug] of Object.entries(catNameToSlug)) {
        if (categoryName.includes(key) || key.includes(categoryName)) return slug;
    }
    // Fuzzy match
    const lower = categoryName.toLowerCase();
    if (lower.includes('yapay zeka') || lower.includes('yz')) return 'ai';
    if (lower.includes('metaverse') || lower.includes('sanal')) return 'metaverse';
    if (lower.includes('veri') && !lower.includes('hukuk')) return 'data';
    if (lower.includes('siber') || lower.includes('blockchain')) return 'cyber';
    if (lower.includes('robotik') || lower.includes('otonom')) return 'robotics';
    if (lower.includes('sağlık') || lower.includes('biyo')) return 'health';
    if (lower.includes('çevre') || lower.includes('sürdürü')) return 'environment';
    if (lower.includes('hukuk') || lower.includes('etik') || lower.includes('regülasyon')) return 'law';
    if (lower.includes('pazarlama') || lower.includes('iletişim')) return 'marketing';
    if (lower.includes('eğitim') || lower.includes('koçluk')) return 'education';
    if (lower.includes('tasarım') || lower.includes('yaratıcı') || lower.includes('sanat')) return 'design';
    if (lower.includes('finans') || lower.includes('ekonomi')) return 'finance';
    if (lower.includes('psikoloji') || lower.includes('ruh')) return 'psychology';
    if (lower.includes('oyun') || lower.includes('e-spor') || lower.includes('espor')) return 'gaming';
    if (lower.includes('bilim') || lower.includes('uzay')) return 'science';
    if (lower.includes('medya') || lower.includes('diplomasi')) return 'cross';
    return 'cross';
}

function resolveStatus(status: string): RealizationStatus {
    if (status.includes('Gerçekleşti') && !status.includes('Henüz')) return 'REALIZED';
    if (status.includes('Başlangıç')) return 'EMERGING';
    if (status.includes('Beklemede')) return 'PENDING';
    if (status.includes('Ömrü') || status.includes('Tamamlan')) return 'LIFECYCLE_END';
    return 'NOT_YET';
}

function resolveLevel(text: string): EducationLevel {
    if (text.includes('İLKOKUL') || text.includes('1-4')) return 'PRIMARY';
    if (text.includes('ORTAOKUL') || text.includes('5-8')) return 'MIDDLE';
    if (text.includes('LİSE') || text.includes('9-12')) return 'HIGH';
    return 'PRIMARY';
}

// ============================================
// MAIN SEED FUNCTION
// ============================================
async function seedCareer() {
    console.log('🚀 Starting career data seed...');

    // Read Excel
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const XLSX = require('xlsx');
    const wb = XLSX.readFile('meslek/Gelecek_Meslekleri_Kapsamli.xlsx');

    // --- 1) Seed Categories ---
    console.log('📂 Seeding 16 career categories...');
    const categoryMap: Record<string, string> = {}; // slug -> id

    for (const cat of categories) {
        const created = await prisma.careerCategory.upsert({
            where: { slug: cat.slug },
            update: { ...cat },
            create: { ...cat },
        });
        categoryMap[cat.slug] = created.id;
        console.log(`  ✓ ${cat.icon} ${cat.nameTr}`);
    }

    // --- 2) Seed 295 Jobs from Excel ---
    console.log('\n💼 Seeding 295 career jobs...');
    const jobSheet = XLSX.utils.sheet_to_json(wb.Sheets['Meslekler Listesi'], { header: 1 });
    let jobCount = 0;

    for (let i = 1; i < jobSheet.length; i++) {
        const row = jobSheet[i] as (string | number | undefined)[];
        if (!row || !row[0] || typeof row[0] !== 'number') continue;

        const no = row[0] as number;
        const nameTr = (row[1] as string || '').trim();
        const nameEn = (row[2] as string || '').trim();
        const year = (row[3] as number) || 2026;
        const statusText = (row[4] as string || 'Henüz Gerçekleşmedi');
        const categoryText = (row[5] as string || 'Diğer / Kesişimsel Meslekler');

        if (!nameTr) continue;

        const slug = resolveSlug(categoryText);
        const categoryId = categoryMap[slug];
        if (!categoryId) {
            console.warn(`  ⚠ No category found for "${categoryText}" → defaulting to cross`);
            continue;
        }

        await prisma.careerJob.create({
            data: {
                categoryId,
                nameTr,
                nameEn,
                yearPredicted: year,
                realizationStatus: resolveStatus(statusText),
                jobNumber: no,
                sortOrder: no,
            },
        });
        jobCount++;
    }
    console.log(`  ✓ ${jobCount} jobs seeded`);

    // --- 3) Seed 55 Career Discovery Questions from Excel ---
    console.log('\n❓ Seeding career discovery questions...');
    const qSheet = XLSX.utils.sheet_to_json(wb.Sheets['Kariyer Keşif Soruları'], { header: 1 });
    let questionCount = 0;
    let currentLevel: EducationLevel = 'PRIMARY';
    let currentSection = '';

    for (let i = 0; i < qSheet.length; i++) {
        const row = qSheet[i] as (string | number | undefined)[];
        if (!row || row.length === 0) continue;

        const firstCell = String(row[0] || '').trim();

        // Detect education level headers
        if (firstCell.includes('İLKOKUL')) { currentLevel = 'PRIMARY'; continue; }
        if (firstCell.includes('ORTAOKUL')) { currentLevel = 'MIDDLE'; continue; }
        if (firstCell.includes('LİSE')) { currentLevel = 'HIGH'; continue; }

        // Detect section headers
        if (firstCell.startsWith(' ') && !firstCell.startsWith('No') && typeof row[0] === 'string' && isNaN(Number(firstCell))) {
            currentSection = firstCell.trim();
            continue;
        }

        // Skip header rows
        if (firstCell === 'No' || firstCell === 'GELECEĞİN' || firstCell === 'Bu sorular') continue;

        // Parse question rows
        const qNo = Number(firstCell);
        if (isNaN(qNo) || qNo === 0) continue;

        const questionText = (row[1] as string || '').trim();
        const suggestedJobs = (row[2] as string || '').trim();
        const categoryTag = (row[3] as string || '').trim();

        if (!questionText) continue;

        await prisma.careerDiscoveryQuestion.create({
            data: {
                questionNumber: qNo,
                educationLevel: currentLevel,
                sectionTitle: currentSection,
                questionTr: questionText,
                suggestedJobs,
                categoryTag,
                sortOrder: questionCount + 1,
            },
        });
        questionCount++;
    }
    console.log(`  ✓ ${questionCount} questions seeded`);

    console.log('\n✅ Career seed complete!');
    console.log(`   Categories: ${Object.keys(categoryMap).length}`);
    console.log(`   Jobs: ${jobCount}`);
    console.log(`   Questions: ${questionCount}`);
}

seedCareer()
    .catch((e) => {
        console.error('❌ Career seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
