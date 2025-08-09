// Script to help restart development servers after hooks rebuild
console.log('📋 Development Server Restart Guide');
console.log('=====================================');
console.log('');

console.log('The @altamedica/hooks package has been successfully rebuilt!');
console.log('');

console.log('✅ Next steps to fix the import error:');
console.log('');

console.log('1. 🔄 RESTART YOUR DEVELOPMENT SERVERS:');
console.log('   - Stop any running dev servers (Ctrl+C)');
console.log('   - Clear Next.js cache: rm -rf .next (or delete .next folder)');
console.log('   - Restart with: npm run dev');
console.log('');

console.log('2. 🧹 CLEAR NODE MODULES (if issue persists):');
console.log('   - cd C:\\Users\\Eduardo\\Documents\\devaltamedica');
console.log('   - Delete node_modules in apps and packages');
console.log('   - Run: npm install');
console.log('   - Run: npm run build');
console.log('');

console.log('3. 🔍 VERIFY IMPORTS:');
console.log('   The import should now work:');
console.log('   import { useDiagnosticEngine } from "@altamedica/hooks/medical";');
console.log('');

console.log('4. 🚀 START APPLICATIONS:');
console.log('   - Web App: cd apps/web-app && npm run dev');
console.log('   - Patients: cd apps/patients && npm run dev');
console.log('   - Doctors: cd apps/doctors && npm run dev');
console.log('');

console.log('The module resolution error should now be resolved!');