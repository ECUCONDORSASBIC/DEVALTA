#!/usr/bin/env node

/**
 * Script para eliminar componentes UI duplicados después de la migración
 * ADVERTENCIA: Este script ELIMINA archivos. Asegúrate de haber migrado todo primero.
 */

const fs = require('fs').promises;
const path = require('path');
const glob = require('glob');

// Componentes que YA están en @altamedica/ui y pueden ser eliminados
const COMPONENTS_TO_DELETE = [
  'badge.tsx',
  'Badge.tsx',
  'BadgeCorporate.tsx',
  'button.tsx',
  'Button.tsx',
  'ButtonCorporate.tsx',
  'card.tsx',
  'Card.tsx',
  'CardCorporate.tsx',
  'input.tsx',
  'Input.tsx',
  'InputCorporate.tsx',
  'select.tsx',
  'Select.tsx',
  'textarea.tsx',
  'Textarea.tsx',
  'label.tsx',
  'Label.tsx',
  'switch.tsx',
  'Switch.tsx',
  'separator.tsx',
  'Separator.tsx',
  'alert.tsx',
  'Alert.tsx',
  'progress.tsx',
  'Progress.tsx',
  'tabs.tsx',
  'Tabs.tsx',
  'modal.tsx',
  'Modal.tsx',
  'LoadingSpinner.tsx',
  'StatusBadge.tsx',
  'AppointmentCard.tsx',
  'HealthMetricCard.tsx',
  'MedicalRecordCard.tsx'
];

async function checkIfSafeToDelete(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    
    // Check if it's a re-export file
    if (content.includes("export * from '@altamedica/ui'") || 
        content.includes("export { } from '@altamedica/ui'")) {
      return false; // Don't delete re-export files
    }
    
    // Check if it's an index file that might be important
    if (path.basename(filePath).includes('index')) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    return false;
  }
}

async function findComponentsToDelete(appName) {
  const uiPath = path.join('apps', appName, 'src', 'components', 'ui');
  const filesToDelete = [];
  
  try {
    const files = await new Promise((resolve, reject) => {
      glob(`${uiPath}/**/*.{ts,tsx}`, (err, files) => {
        if (err) reject(err);
        else resolve(files);
      });
    });
    
    for (const file of files) {
      const filename = path.basename(file);
      
      if (COMPONENTS_TO_DELETE.includes(filename)) {
        const isSafe = await checkIfSafeToDelete(file);
        if (isSafe) {
          filesToDelete.push(file);
        }
      }
    }
    
    return filesToDelete;
  } catch (error) {
    console.error(`Error scanning ${appName}:`, error.message);
    return [];
  }
}

async function deleteFiles(files, dryRun = true) {
  for (const file of files) {
    if (dryRun) {
      console.log(`   🗑️  Would delete: ${path.relative(process.cwd(), file)}`);
    } else {
      try {
        await fs.unlink(file);
        console.log(`   ✅ Deleted: ${path.relative(process.cwd(), file)}`);
      } catch (error) {
        console.error(`   ❌ Failed to delete ${file}:`, error.message);
      }
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = !args.includes('--force');
  
  if (dryRun) {
    console.log('🔍 DRY RUN MODE - No files will be deleted');
    console.log('   To actually delete files, run: node scripts/cleanup-duplicate-ui.cjs --force\n');
  } else {
    console.log('⚠️  DELETION MODE - Files will be permanently deleted!\n');
  }
  
  console.log('🧹 Cleaning up duplicate UI components...\n');
  
  const apps = ['patients', 'doctors', 'companies'];
  let totalFiles = 0;
  
  for (const app of apps) {
    console.log(`📱 Checking ${app} app...`);
    
    const filesToDelete = await findComponentsToDelete(app);
    
    if (filesToDelete.length > 0) {
      console.log(`   Found ${filesToDelete.length} duplicate components`);
      await deleteFiles(filesToDelete, dryRun);
      totalFiles += filesToDelete.length;
    } else {
      console.log(`   ✨ No duplicate components found`);
    }
    
    console.log('');
  }
  
  if (totalFiles > 0) {
    if (dryRun) {
      console.log(`\n📊 Would delete ${totalFiles} files total`);
      console.log('\n⚠️  Review the files above and run with --force to delete them');
    } else {
      console.log(`\n✅ Deleted ${totalFiles} duplicate component files`);
      console.log('\n📋 Next steps:');
      console.log('1. Run your tests to ensure everything still works');
      console.log('2. Update any remaining imports that might be broken');
      console.log('3. Commit your changes');
    }
  } else {
    console.log('\n✨ No duplicate components found!');
  }
}

main().catch(console.error);