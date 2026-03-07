const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

walkDir('./src/app', function (filePath) {
    if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;

        // Replace const json = await res.json() with explicit cast
        if (content.match(/const json = await res\.json\(\);/)) {
            content = content.replace(/const json = await res\.json\(\);/g, 'const json = (await res.json()) as any;');
            modified = true;
        }

        if (content.match(/const data = await res\.json\(\);/)) {
            content = content.replace(/const data = await res\.json\(\);/g, 'const data = (await res.json()) as any;');
            modified = true;
        }

        if (content.match(/const data = await response\.json\(\);/)) {
            content = content.replace(/const data = await response\.json\(\);/g, 'const data = (await response.json()) as any;');
            modified = true;
        }

        if (modified) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Updated ${filePath}`);
        }
    }
});
