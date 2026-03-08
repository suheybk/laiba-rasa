const fs = require('fs');
const path = require('path');

const apiDir = path.join(__dirname, '..', 'src', 'app', 'api');

function processDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            processDir(fullPath);
        } else if (entry.name === 'route.ts') {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('export const runtime = "edge"')) {
                content = content.replace(/export const runtime = "edge";\s*\n?/g, '');
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log('Removed edge runtime from:', fullPath.replace(apiDir, ''));
            }
        }
    }
}

processDir(apiDir);
console.log('Done!');
