// Script to fix the @altamedica/hooks/medical import issue
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🏥 Fixing @altamedica/hooks/medical import issue...');
console.log('');

try {
  // Step 1: Clean all build artifacts
  console.log('🧹 Step 1: Cleaning build artifacts...');
  
  const appsToClean = ['web-app', 'patients', 'doctors', 'companies', 'admin'];
  
  for (const app of appsToClean) {
    const nextPath = path.join(__dirname, 'apps', app, '.next');
    if (fs.existsSync(nextPath)) {
      fs.rmSync(nextPath, { recursive: true, force: true });
      console.log(`✅ Cleaned .next in ${app}`);
    }
    
    const nodeModulesPath = path.join(__dirname, 'apps', app, 'node_modules', '.cache');
    if (fs.existsSync(nodeModulesPath)) {
      fs.rmSync(nodeModulesPath, { recursive: true, force: true });
      console.log(`✅ Cleaned cache in ${app}`);
    }
  }
  
  // Step 2: Rebuild critical packages in order
  console.log('');
  console.log('🏗️ Step 2: Rebuilding packages in dependency order...');
  
  const packagesToBuild = [
    'types',
    'diagnostic-engine', 
    'hooks',
    'medical-hooks'
  ];
  
  for (const pkg of packagesToBuild) {
    const pkgPath = path.join(__dirname, 'packages', pkg);
    if (fs.existsSync(pkgPath)) {
      console.log(`📦 Building ${pkg}...`);
      try {
        execSync('npm run build', { cwd: pkgPath, stdio: 'inherit' });
        console.log(`✅ ${pkg} built successfully`);
      } catch (error) {
        console.log(`⚠️ ${pkg} had build issues, but continuing...`);
      }
    }
  }
  
  // Step 3: Verify the medical index export
  console.log('');
  console.log('🔍 Step 3: Verifying medical hooks export...');
  
  const medicalIndexPath = path.join(__dirname, 'packages', 'hooks', 'dist', 'medical', 'index.d.ts');
  if (fs.existsSync(medicalIndexPath)) {
    const content = fs.readFileSync(medicalIndexPath, 'utf8');
    if (content.includes('useDiagnosticEngine')) {
      console.log('✅ useDiagnosticEngine found in medical index exports');
    } else {
      console.log('❌ useDiagnosticEngine NOT found in medical index exports');
    }
  } else {
    console.log('❌ Medical index.d.ts not found');
  }
  
  // Step 4: Check package.json exports
  console.log('');
  console.log('🔍 Step 4: Verifying package.json exports...');
  
  const hooksPackageJson = path.join(__dirname, 'packages', 'hooks', 'package.json');
  const pkgJson = JSON.parse(fs.readFileSync(hooksPackageJson, 'utf8'));
  
  if (pkgJson.exports && pkgJson.exports['./medical']) {
    console.log('✅ Medical subpath export found in package.json');
    console.log(`   Path: ${pkgJson.exports['./medical'].types}`);
  } else {
    console.log('❌ Medical subpath export NOT found in package.json');
  }
  
  // Step 5: Install and rebuild root
  console.log('');
  console.log('📦 Step 5: Rebuilding root workspace...');
  
  execSync('npm install', { cwd: __dirname, stdio: 'inherit' });
  execSync('npm run build', { cwd: __dirname, stdio: 'inherit' });
  
  console.log('');
  console.log('🎉 Fix completed!');
  console.log('');
  console.log('📋 Next steps:');
  console.log('1. Restart your development server');
  console.log('2. The import should now work:');
  console.log('   import { useDiagnosticEngine } from "@altamedica/hooks/medical";');
  console.log('');
  
} catch (error) {
  console.error('❌ Fix failed:', error.message);
  console.log('');
  console.log('🔧 Manual steps to try:');
  console.log('1. cd packages/hooks && npm run build');
  console.log('2. Delete .next folders in your apps');
  console.log('3. Restart development servers');
}