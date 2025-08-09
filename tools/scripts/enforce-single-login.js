#!/usr/bin/env node
/**
 * Enforce Single Login Page Policy
 * Falla si existe cualquier page.tsx de login fuera de web-app.
 */
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const APPS = path.join(ROOT, 'apps');
const ALLOWED = path.join(APPS, 'web-app');

function findLoginPages(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
      results.push(...findLoginPages(full));
    } else if (entry.isFile()) {
      if (/[/\\](login)[/\\]page\.(tsx|jsx|js)$/.test(full)) {
        results.push(full);
      }
    }
  }
  return results;
}

const allLoginPages = findLoginPages(APPS);
const violations = allLoginPages.filter(p => !p.startsWith(ALLOWED));

console.log('🔐 Auditoría Single Login Page');
console.log('--------------------------------');
console.log('Detectadas pages de login:');
allLoginPages.forEach(p => console.log(' -', path.relative(ROOT, p)));

if (violations.length > 0) {
  console.error('\n❌ Violación de política: Existe login fuera de web-app');
  violations.forEach(v => console.error('  ->', path.relative(ROOT, v)));
  process.exit(1);
}

console.log('\n✅ Política cumplida: solo web-app contiene página de login.');
