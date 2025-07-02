const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

function deleteFolderRecursive(folderPath) {
  if (fs.existsSync(folderPath)) {
    fs.readdirSync(folderPath).forEach((file) => {
      const curPath = path.join(folderPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(folderPath);
    console.log(`✅ Eliminado: ${folderPath}`);
  }
}

function runCommand(command, args, cwd) {
  return new Promise((resolve, reject) => {
    console.log(`🚀 Ejecutando: ${command} ${args.join(' ')}`);
    console.log(`📂 En directorio: ${cwd}`);
    
    const process = spawn(command, args, {
      cwd,
      stdio: 'inherit',
      shell: true
    });
    
    process.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ Comando completado: ${command}`);
        resolve();
      } else {
        console.log(`⚠️ Comando terminó con código: ${code}`);
        resolve(); // No rechazar para continuar con otros comandos
      }
    });
    
    process.on('error', (error) => {
      console.error(`❌ Error ejecutando comando:`, error);
      resolve(); // No rechazar para continuar
    });
  });
}

async function fixAndRestart() {
  const webAppPath = 'C:\\Users\\Eduardo\\Documents\\altamedicadev\\apps\\web-app';
  
  console.log('🔧 Iniciando reparación y reinicio...');
  
  try {
    // 1. Limpiar cache de Next.js
    console.log('🧹 Limpiando cache...');
    const nextCache = path.join(webAppPath, '.next');
    if (fs.existsSync(nextCache)) {
      deleteFolderRecursive(nextCache);
    }
    
    // 2. Limpiar cache de Turbo
    const turboCache = path.join(webAppPath, '.turbo');
    if (fs.existsSync(turboCache)) {
      deleteFolderRecursive(turboCache);
    }
    
    // 3. Verificar Three.js
    console.log('🔍 Verificando Three.js...');
    await runCommand('pnpm', ['list', 'three'], webAppPath);
    
    // 4. Reinstalar si es necesario
    console.log('📦 Reinstalando dependencias...');
    await runCommand('pnpm', ['install'], webAppPath);
    
    console.log('🎉 ¡Reparación completada!');
    console.log('');
    console.log('📋 Ahora ejecuta:');
    console.log('1. cd apps/web-app');
    console.log('2. pnpm dev');
    console.log('3. Abre http://localhost:3000');
    console.log('');
    console.log('🔧 Si aún hay problemas:');
    console.log('- Verifica que Three.js esté instalado: pnpm list three');
    console.log('- Usa el nuevo componente: Hospital3DSimulatorFixed.tsx');
    
  } catch (error) {
    console.error('❌ Error durante la reparación:', error.message);
  }
}

fixAndRestart();
