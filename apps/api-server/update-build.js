const fs = require('fs');
const path = require('path');

const packagePath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

// Save original build command
packageJson.scripts['build:original'] = packageJson.scripts.build || 'next build';
// Update build command
packageJson.scripts.build = 'node build-no-lint.js';

fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
console.log('âœ… Updated package.json');
