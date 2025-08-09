// Script to rebuild hooks package and fix module resolution
const { execSync } = require('child_process');
const path = require('path');

console.log('🔧 Fixing @altamedica/hooks build...');

try {
  // Navigate to hooks package
  const hooksPath = path.join(__dirname, 'packages', 'hooks');
  console.log(`📁 Hooks path: ${hooksPath}`);
  
  // Build hooks package
  console.log('🏗️ Building hooks package...');
  execSync('npm run build', { 
    cwd: hooksPath, 
    stdio: 'inherit' 
  });
  
  console.log('✅ Hooks package built successfully!');
  
  // Build root workspace packages 
  console.log('🏗️ Building all packages...');
  execSync('npm run build', { 
    cwd: __dirname,
    stdio: 'inherit' 
  });
  
  console.log('✅ All packages built successfully!');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}