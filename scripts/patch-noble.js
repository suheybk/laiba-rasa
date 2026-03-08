const fs = require('fs');
const path = require('path');

const pkgPath = path.join(__dirname, '..', 'node_modules', '@noble', 'ciphers', 'package.json');

if (fs.existsSync(pkgPath)) {
    try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

        if (pkg.exports) {
            pkg.exports['./utils'] = {
                types: './utils.d.ts',
                import: './utils.js',
                default: './utils.js'
            };
            fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2), 'utf8');
            console.log('Successfully patched @noble/ciphers package.json to export ./utils');
        } else {
            console.log('exports field not found in @noble/ciphers package.json');
        }
    } catch (e) {
        console.error('Error patching package.json:', e);
    }
} else {
    console.log('Could not find @noble/ciphers at', pkgPath);
}
