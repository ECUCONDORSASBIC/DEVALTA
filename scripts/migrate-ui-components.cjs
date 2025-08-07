#!/usr/bin/env node

/**
 * Script para migrar componentes UI duplicados a @altamedica/ui
 * Fase 1: Badge, Button, Card
 */

const fs = require('fs').promises;
const glob = require('glob');
const path = require('path');

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
    let content = await fs.readFile(filePath, 'utf8');
    let modified = false;

    // Skip if file already imports from @altamedica/ui
    if (content.includes("from '@altamedica/ui'") || content.includes('from "@altamedica/ui"')) {
      // Check if it already has the component
      const hasComponent = new RegExp(`import.*{[^}]*\\b${component}\\b[^}]*}.*from ['"]@altamedica/ui['"]`).test(content);
      if (hasComponent) {
        return 0;
      }
    }

    // Pattern to match various import styles
    const patterns = [
      // import { Badge } from '../ui/badge'
      new RegExp(`import\\s*{\\s*${component}\\s*}\\s*from\\s*['"](\\.+/ui/${component.toLowerCase()}|\\./ui/${component.toLowerCase()})['"];?`, 'gi'),
      // import { Badge } from '../ui'
      new RegExp(`import\\s*{([^}]*\\b${component}\\b[^}]*)}\\s*from\\s*['"](\\.+/ui|\\./ui)['"];?`, 'g'),
      // import Badge from '../ui/badge'
      new RegExp(`import\\s+${component}\\s+from\\s*['"](\\.+/ui/${component.toLowerCase()}|\\./ui/${component.toLowerCase()})['"];?`, 'gi'),
    ];

    for (const pattern of patterns) {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          // Don't replace if already from @altamedica/ui
          if (!match.includes('@altamedica/ui')) {
            const newImport = `import { ${component} } from '${config.importStatement}';`;
            content = content.replace(match, newImport);
            modified = true;
          }
        });
      }
    }

    if (modified) {
      await fs.writeFile(filePath, content, 'utf8');
      console.log(`✅ Migrated ${component} in: ${path.relative(process.cwd(), filePath)}`);
      return 1;
    }
    return 0;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return 0;
  }
}

async function processApp(appName) {
  console.log(`\n📱 Processing ${appName} app...`);
  let totalMigrated = 0;

  for (const [component, config] of Object.entries(COMPONENTS_TO_MIGRATE)) {
    const pattern = `apps/${appName}/src/**/*.{ts,tsx}`;
    
    const files = await new Promise((resolve, reject) => {
      glob(pattern, { 
        ignore: ['**/node_modules/**', '**/.next/**', '**/dist/**']
      }, (err, files) => {
        if (err) reject(err);
        else resolve(files);
      });
    });

    console.log(`  📦 Migrating ${component} (found ${files.length} source files)...`);
    
    let componentMigrated = 0;
    for (const file of files) {
      const migrated = await migrateFile(file, component, config);
      componentMigrated += migrated;
    }
    
    if (componentMigrated > 0) {
      console.log(`  ✨ Migrated ${componentMigrated} instances of ${component}`);
    }
    totalMigrated += componentMigrated;
  }

  return totalMigrated;
}

async function main() {
  console.log('🚀 Starting UI component migration to @altamedica/ui...\n');

  const apps = ['patients', 'doctors', 'companies'];
  let grandTotal = 0;

  for (const app of apps) {
    const appTotal = await processApp(app);
    grandTotal += appTotal;
  }

  console.log(`\n\n🎉 Migration complete! Total files migrated: ${grandTotal}`);
  
  if (grandTotal > 0) {
    console.log('\n📋 Next steps:');
    console.log('1. Run "pnpm install" to ensure dependencies are up to date');
    console.log('2. Run tests to ensure everything works');
    console.log('3. Delete the duplicate UI components from apps/*/src/components/ui/');
    console.log('4. Commit the changes');
  } else {
    console.log('\n✨ No migrations needed - components may already be using @altamedica/ui');
  }
}

main().catch(console.error);