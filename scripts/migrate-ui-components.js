#!/usr/bin/env node

/**
 * Script para migrar componentes UI duplicados a @altamedica/ui
 * Fase 1: Badge, Button, Card
 */

import { readFile, writeFile } from 'fs/promises';
import { glob } from 'glob';
import path from 'path';

const COMPONENTS_TO_MIGRATE = {
  Badge: {
    localPaths: [
      '../ui/badge',
      './ui/badge',
      './ui/BadgeCorporate',
      '../ui/BadgeCorporate',
      './ui'
    ],
    importStatement: '@altamedica/ui'
  },
  Button: {
    localPaths: [
      '../ui/button',
      './ui/button',
      './ui/ButtonCorporate',
      '../ui/ButtonCorporate',
      './ui'
    ],
    importStatement: '@altamedica/ui'
  },
  Card: {
    localPaths: [
      '../ui/card',
      './ui/card',
      './ui/CardCorporate',
      '../ui/CardCorporate',
      './ui'
    ],
    importStatement: '@altamedica/ui'
  }
};

async function migrateFile(filePath, component, config) {
  try {
    let content = await readFile(filePath, 'utf8');
    let modified = false;

    // Regex patterns for different import styles
    const importPatterns = [
      // import { Badge } from '../ui/badge'
      new RegExp(`import\\s*{([^}]*\\b${component}\\b[^}]*)}\\s*from\\s*['"](\\.+/ui/[^'"]*|\\./ui)['"]`, 'g'),
      // import Badge from '../ui/badge'
      new RegExp(`import\\s+${component}\\s+from\\s*['"](\\.+/ui/[^'"]*|\\./ui)['"]`, 'g'),
      // import { StatusBadge as Badge } from './ui'
      new RegExp(`import\\s*{([^}]*\\bas\\s+${component}\\b[^}]*)}\\s*from\\s*['"](\\.+/ui[^'"]*)['"]`, 'g')
    ];

    for (const pattern of importPatterns) {
      if (pattern.test(content)) {
        content = content.replace(pattern, (match, imports, importPath) => {
          // If it's already importing from @altamedica/ui, skip
          if (importPath && importPath.includes('@altamedica/ui')) {
            return match;
          }

          modified = true;
          
          if (imports) {
            // Handle named imports
            const cleanedImports = imports.trim();
            return `import { ${cleanedImports} } from '${config.importStatement}'`;
          } else {
            // Handle default imports
            return `import { ${component} } from '${config.importStatement}'`;
          }
        });
      }
    }

    if (modified) {
      await writeFile(filePath, content, 'utf8');
      console.log(`✅ Migrated ${component} in: ${path.relative(process.cwd(), filePath)}`);
      return 1;
    }
    return 0;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return 0;
  }
}

async function main() {
  console.log('🚀 Starting UI component migration to @altamedica/ui...\n');

  const apps = ['patients', 'doctors', 'companies'];
  let totalMigrated = 0;

  for (const [component, config] of Object.entries(COMPONENTS_TO_MIGRATE)) {
    console.log(`\n📦 Migrating ${component}...`);
    
    for (const app of apps) {
      const pattern = `apps/${app}/src/**/*.{ts,tsx}`;
      const files = await glob(pattern, { 
        ignore: ['**/node_modules/**', '**/.next/**', '**/dist/**']
      });

      console.log(`\n  📱 Processing ${app} app (${files.length} files)...`);
      
      let appMigrated = 0;
      for (const file of files) {
        const migrated = await migrateFile(file, component, config);
        appMigrated += migrated;
      }
      
      if (appMigrated > 0) {
        console.log(`  ✨ Migrated ${appMigrated} files in ${app}`);
      }
      totalMigrated += appMigrated;
    }
  }

  console.log(`\n\n🎉 Migration complete! Total files migrated: ${totalMigrated}`);
  console.log('\n📋 Next steps:');
  console.log('1. Run tests to ensure everything works');
  console.log('2. Delete the duplicate UI components from apps/*/src/components/ui/');
  console.log('3. Update any remaining edge cases manually');
}

main().catch(console.error);