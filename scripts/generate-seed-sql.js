// Generate D1-compatible seed SQL from local SQLite — NO updatedAt column
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

function esc(str) {
    if (str === null || str === undefined) return 'NULL';
    return "'" + String(str).replace(/'/g, "''") + "'";
}
function dt(d) {
    if (!d) return esc(new Date().toISOString());
    return esc(d instanceof Date ? d.toISOString() : String(d));
}

async function main() {
    // 1. Categories
    const cats = await prisma.careerCategory.findMany({ orderBy: { sortOrder: 'asc' } });
    let catSQL = '-- Career Categories\n';
    for (const c of cats) {
        catSQL += `INSERT OR IGNORE INTO "CareerCategory" ("id","slug","nameTr","nameEn","nameAr","descriptionTr","descriptionEn","descriptionAr","icon","colorHex","worldNameTr","worldNameEn","worldImage","heroNameTr","heroNameEn","heroImage","sortOrder","createdAt") VALUES (${esc(c.id)},${esc(c.slug)},${esc(c.nameTr)},${esc(c.nameEn)},${esc('')},${esc(c.descriptionTr)},${esc(c.descriptionEn)},${esc('')},${esc(c.icon)},${esc(c.colorHex)},${esc(c.worldNameTr)},${esc(c.worldNameEn)},${esc(c.worldImage)},${esc(c.heroNameTr)},${esc(c.heroNameEn)},${esc(c.heroImage)},${c.sortOrder},${dt(c.createdAt)});\n`;
    }
    fs.writeFileSync(path.join(__dirname, '..', 'prisma', 'seed_1_cats.sql'), catSQL, 'utf8');

    // 2. Jobs
    const jobs = await prisma.careerJob.findMany({ orderBy: { sortOrder: 'asc' } });
    let jobSQL = '-- Career Jobs\n';
    for (const j of jobs) {
        jobSQL += `INSERT OR IGNORE INTO "CareerJob" ("id","nameTr","nameEn","nameAr","descriptionTr","descriptionEn","descriptionAr","yearPredicted","realizationStatus","categoryId","sortOrder","createdAt") VALUES (${esc(j.id)},${esc(j.nameTr)},${esc(j.nameEn)},${esc('')},${esc(j.descriptionTr)},${esc(j.descriptionEn)},${esc('')},${j.yearPredicted || 'NULL'},${esc(j.realizationStatus)},${esc(j.categoryId)},${j.sortOrder},${dt(j.createdAt)});\n`;
    }
    fs.writeFileSync(path.join(__dirname, '..', 'prisma', 'seed_2_jobs.sql'), jobSQL, 'utf8');

    // 3. Questions
    const qs = await prisma.careerDiscoveryQuestion.findMany({ orderBy: { sortOrder: 'asc' } });
    let qSQL = '-- Career Discovery Questions\n';
    for (const q of qs) {
        qSQL += `INSERT OR IGNORE INTO "CareerDiscoveryQuestion" ("id","questionNumber","educationLevel","sectionTitle","questionTr","questionEn","questionAr","suggestedJobs","categoryTag","answerOptions","gameContext","sortOrder","createdAt","categoryId") VALUES (${esc(q.id)},${q.questionNumber},${esc(q.educationLevel)},${esc(q.sectionTitle)},${esc(q.questionTr)},${esc(q.questionEn)},${esc(q.questionAr)},${esc(q.suggestedJobs)},${esc(q.categoryTag)},${esc(q.answerOptions)},${esc(q.gameContext)},${q.sortOrder},${dt(q.createdAt)},${q.categoryId ? esc(q.categoryId) : 'NULL'});\n`;
    }
    fs.writeFileSync(path.join(__dirname, '..', 'prisma', 'seed_3_questions.sql'), qSQL, 'utf8');

    console.log(`✅ Generated seed files: ${cats.length} categories, ${jobs.length} jobs, ${qs.length} questions`);
    await prisma.$disconnect();
}

main().catch(e => { console.error(e); prisma.$disconnect(); });
