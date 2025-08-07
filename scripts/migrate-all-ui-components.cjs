#!/usr/bin/env node

/**
 * Script completo para migrar TODOS los componentes UI duplicados a @altamedica/ui
 */

const fs = require('fs').promises;
const glob = require('glob');
const path = require('path');

const COMPONENTS_TO_MIGRATE = {
  // Componentes base
  Badge: '@altamedica/ui',
  Button: '@altamedica/ui',
  Card: '@altamedica/ui',
  Input: '@altamedica/ui',
  
  // Componentes de formulario
  Select: '@altamedica/ui',
  Textarea: '@altamedica/ui',
  Label: '@altamedica/ui',
  Switch: '@altamedica/ui',
  
  // Componentes de layout
  Modal: '@altamedica/ui',
  Tabs: '@altamedica/ui',
  Separator: '@altamedica/ui',
  
  // Componentes de feedback
  Alert: '@altamedica/ui',
  LoadingSpinner: '@altamedica/ui',
  Progress: '@altamedica/ui',
  
  // Componentes corporativos
  ButtonCorporate: '@altamedica/ui',
  CardCorporate: '@altamedica/ui',
  BadgeCorporate: '@altamedica/ui',
  InputCorporate: '@altamedica/ui',
  
  // Componentes médicos
  StatusBadge: '@altamedica/ui',
  AppointmentCard: '@altamedica/ui',
  HealthMetricCard: '@altamedica/ui',
  MedicalRecordCard: '@altamedica/ui'
};

// Mapeo de imports especiales
const SPECIAL_IMPORTS = {
  'CardHeader': { from: 'Card', package: '@altamedica/ui' },
  'CardContent': { from: 'Card', package: '@altamedica/ui' },
  'CardFooter': { from: 'Card', package: '@altamedica/ui' },
  'CardTitle': { from: 'Card', package: '@altamedica/ui' },
  'CardDescription': { from: 'Card', package: '@altamedica/ui' },
  'TabsList': { from: 'Tabs', package: '@altamedica/ui' },
  'TabsTrigger': { from: 'Tabs', package: '@altamedica/ui' },
  'TabsContent': { from: 'Tabs', package: '@altamedica/ui' }
};

async function findAndReplaceImports(filePath) {
  try {
    let content = await fs.readFile(filePath, 'utf8');
    let modified = false;
    const changes = [];

    // Pattern to match import statements
    const importRegex = /import\s*{([^}]+)}\s*from\s*['"]([^'"]+)['"]/g;
    const defaultImportRegex = /import\s+(\w+)\s+from\s*['"]([^'"]+)['"]/g;

    // Process named imports
    content = content.replace(importRegex, (match, imports, fromPath) => {
      // Skip if already from @altamedica
      if (fromPath.includes('@altamedica')) return match;
      
      // Skip non-UI imports
      if (!fromPath.includes('/ui') && !fromPath.includes('components/ui')) return match;

      const importList = imports.split(',').map(imp => imp.trim());
      const newImports = [];
      const remainingImports = [];

      for (const imp of importList) {
        let componentName = imp;
        let alias = '';
        
        // Handle aliased imports (e.g., StatusBadge as Badge)
        if (imp.includes(' as ')) {
          [componentName, alias] = imp.split(' as ').map(s => s.trim());
        }

        // Check if it's a component we want to migrate
        let found = false;
        
        // Check regular components
        if (COMPONENTS_TO_MIGRATE[componentName]) {
          newImports.push({ 
            component: imp, 
            package: COMPONENTS_TO_MIGRATE[componentName] 
          });
          found = true;
          changes.push(`${componentName} → @altamedica/ui`);
        }
        
        // Check special imports (like CardHeader)
        else if (SPECIAL_IMPORTS[componentName]) {
          newImports.push({ 
            component: imp, 
            package: SPECIAL_IMPORTS[componentName].package 
          });
          found = true;
          changes.push(`${componentName} → @altamedica/ui`);
        }

        if (!found) {
          remainingImports.push(imp);
        }
      }

      if (newImports.length > 0) {
        modified = true;
        
        // Group imports by package
        const importsByPackage = {};
        newImports.forEach(({ component, package: pkg }) => {
          if (!importsByPackage[pkg]) importsByPackage[pkg] = [];
          importsByPackage[pkg].push(component);
        });

        // Build new import statements
        let newImportStatements = [];
        for (const [pkg, components] of Object.entries(importsByPackage)) {
          newImportStatements.push(`import { ${components.join(', ')} } from '${pkg}'`);
        }

        // Keep remaining imports if any
        if (remainingImports.length > 0) {
          newImportStatements.push(`import { ${remainingImports.join(', ')} } from '${fromPath}'`);
        }

        return newImportStatements.join(';\n');
      }

      return match;
    });

    // Process default imports
    content = content.replace(defaultImportRegex, (match, componentName, fromPath) => {
      if (fromPath.includes('@altamedica')) return match;
      if (!fromPath.includes('/ui') && !fromPath.includes('components/ui')) return match;

      if (COMPONENTS_TO_MIGRATE[componentName]) {
        modified = true;
        changes.push(`${componentName} → @altamedica/ui`);
        return `import { ${componentName} } from '${COMPONENTS_TO_MIGRATE[componentName]}'`;
      }

      return match;
    });

    if (modified) {
      // Clean up multiple semicolons
      content = content.replace(/;{2,}/g, ';');
      
      await fs.writeFile(filePath, content, 'utf8');
      console.log(`✅ ${path.relative(process.cwd(), filePath)}`);
      changes.forEach(change => console.log(`   → ${change}`));
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
  
  const pattern = `apps/${appName}/src/**/*.{ts,tsx}`;
  
  const files = await new Promise((resolve, reject) => {
    glob(pattern, { 
      ignore: ['**/node_modules/**', '**/.next/**', '**/dist/**', '**/ui/**']
    }, (err, files) => {
      if (err) reject(err);
      else resolve(files);
    });
  });

  console.log(`   Found ${files.length} source files`);
  
  let migrated = 0;
  for (const file of files) {
    const result = await findAndReplaceImports(file);
    migrated += result;
  }
  
  return migrated;
}

async function main() {
  console.log('🚀 Starting comprehensive UI component migration to @altamedica/ui...\n');
  console.log('📦 Components to migrate:');
  Object.keys(COMPONENTS_TO_MIGRATE).forEach(comp => console.log(`   - ${comp}`));

  const apps = ['patients', 'doctors', 'companies'];
  let grandTotal = 0;

  for (const app of apps) {
    const appTotal = await processApp(app);
    grandTotal += appTotal;
    if (appTotal > 0) {
      console.log(`   ✨ Migrated ${appTotal} files`);
    }
  }

  console.log(`\n\n🎉 Migration complete! Total files migrated: ${grandTotal}`);
  
  if (grandTotal > 0) {
    console.log('\n📋 Next steps:');
    console.log('1. Review the changes with git diff');
    console.log('2. Run "pnpm install" in each app directory');
    console.log('3. Run "pnpm dev" to test the applications');
    console.log('4. Delete duplicate UI components:');
    console.log('   - apps/patients/src/components/ui/*');
    console.log('   - apps/doctors/src/components/ui/*');
    console.log('   - apps/companies/src/components/ui/*');
    console.log('5. Commit the changes');
  }
}

main().catch(console.error);