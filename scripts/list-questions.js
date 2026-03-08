const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.careerDiscoveryQuestion.findMany({
    orderBy: { sortOrder: 'asc' },
    select: { questionNumber: true, questionTr: true, educationLevel: true, sortOrder: true }
}).then(qs => {
    qs.forEach((q, i) => console.log(`${i + 1}. [${q.educationLevel}] ${q.questionTr.substring(0, 90)}`));
    return p.$disconnect();
}).catch(e => { console.error(e); p.$disconnect(); });
