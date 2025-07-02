console.log('🔧 Verificando que Next.js puede compilar el proyecto...');

const { execSync } = require('child_process');
const fs = require('fs');

try {
  // Verificar que las dependencias estén instaladas
  console.log('📦 Verificando package.json...');
  const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
  
  console.log('📋 Dependencias clave:');
  console.log(`  - next: ${packageJson.dependencies.next || 'NO INSTALADO'}`);
  console.log(`  - react: ${packageJson.dependencies.react || 'NO INSTALADO'}`);
  console.log(`  - three: ${packageJson.dependencies.three || 'NO INSTALADO'}`);
  console.log(`  - @types/three: ${packageJson.devDependencies['@types/three'] || 'NO INSTALADO'}`);
  
  // Verificar que node_modules existe
  console.log('\n📁 Verificando instalación...');
  const nodeModulesExists = fs.existsSync('./node_modules');
  console.log(`  node_modules: ${nodeModulesExists ? '✅ Existe' : '❌ No existe'}`);
  
  if (!nodeModulesExists) {
    console.log('\n🔄 Instalando dependencias...');
    execSync('npm install', { stdio: 'inherit' });
  }
  
  // Verificar archivos clave
  console.log('\n📄 Verificando archivos...');
  const debugComponentExists = fs.existsSync('./src/components/hospital3d/Hospital3DSimulatorDebug.tsx');
  const pageExists = fs.existsSync('./src/app/hospital3d-simulator/page.tsx');
  
  console.log(`  Debug component: ${debugComponentExists ? '✅' : '❌'}`);
  console.log(`  Page component: ${pageExists ? '✅' : '❌'}`);
  
  // Intentar compilar TypeScript
  console.log('\n🔍 Verificando errores de TypeScript...');
  try {
    execSync('npx tsc --noEmit --skipLibCheck', { stdio: 'pipe' });
    console.log('✅ TypeScript: Sin errores');
  } catch (error) {
    console.log('❌ TypeScript: Errores encontrados');
    console.log(error.stdout.toString());
  }
  
  console.log('\n🚀 Todo listo. Puedes intentar ejecutar:');
  console.log('   npm run dev');
  
} catch (error) {
  console.error('❌ Error durante la verificación:', error.message);
}