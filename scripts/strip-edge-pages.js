const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, '..', 'src', 'app', '[locale]');

function processDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            processDir(fullPath);
        } else if (entry.name === 'page.tsx') {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('export const runtime = "edge"')) {
                content = content.replace(/export const runtime = "edge";\s*\n?/g, '');
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log('Removed edge runtime from:', fullPath.replace(pagesDir, ''));
            }
        }
    }
}

processDir(pagesDir);
console.log('Done!');
