/**
 * Script para Iniciar Servidor y Probar Anamnesis - Altamedica
 * Inicia el servidor de desarrollo y ejecuta pruebas de integración
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Iniciando servidor de desarrollo y pruebas de anamnesis...\n');

// Función para ejecutar comandos
function ejecutarComando(comando, args, descripcion) {
  return new Promise((resolve, reject) => {
    console.log(`📋 ${descripcion}...`);
    
    const proceso = spawn(comando, args, {
      stdio: 'pipe',
      shell: true,
      cwd: path.join(__dirname, '..')
    });
    
    let salida = '';
    let errores = '';
    
    proceso.stdout.on('data', (data) => {
      salida += data.toString();
      // Mostrar logs del servidor
      if (data.toString().includes('Ready') || data.toString().includes('localhost:3002')) {
        console.log(`✅ ${data.toString().trim()}`);
      }
    });
    
    proceso.stderr.on('data', (data) => {
      errores += data.toString();
      // Mostrar errores importantes
      if (data.toString().includes('Error') || data.toString().includes('Failed')) {
        console.log(`⚠️  ${data.toString().trim()}`);
      }
    });
    
    proceso.on('close', (codigo) => {
      if (codigo === 0) {
        console.log(`✅ ${descripcion} completado exitosamente`);
        resolve(salida);
      } else {
        console.log(`❌ ${descripcion} falló con código ${codigo}`);
        reject(new Error(errores));
      }
    });
    
    proceso.on('error', (error) => {
      console.log(`❌ Error al ejecutar ${descripcion}:`, error.message);
      reject(error);
    });
  });
}

// Función para esperar que el servidor esté listo
function esperarServidor() {
  return new Promise((resolve) => {
    console.log('⏳ Esperando que el servidor esté listo...');
    
    const verificarServidor = async () => {
      try {
        const response = await fetch('http://localhost:3002/api/v1/anamnesis', {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer test-token'
          }
        });
        
        if (response.status === 401 || response.status === 200) {
          console.log('✅ Servidor listo en puerto 3002');
          resolve();
        } else {
          setTimeout(verificarServidor, 2000);
        }
      } catch (error) {
        setTimeout(verificarServidor, 2000);
      }
    };
    
    setTimeout(verificarServidor, 3000);
  });
}

// Función principal
async function iniciarYProbar() {
  try {
    // 1. Verificar que no hay otro proceso corriendo en el puerto
    console.log('🔍 Verificando puerto 3002...');
    try {
      const response = await fetch('http://localhost:3002');
      console.log('⚠️  El puerto 3002 ya está en uso. Asegúrate de detener otros servidores.');
      console.log('💡 Puedes usar: pkill -f "next dev" o cerrar las terminales con servidores activos.\n');
    } catch (error) {
      console.log('✅ Puerto 3002 disponible\n');
    }
    
    // 2. Ejecutar pruebas de integración
    console.log('🧪 Ejecutando pruebas de integración...');
    await ejecutarComando('node', ['scripts/test-anamnesis-integration.mjs'], 'Pruebas de integración');
    console.log('');
    
    // 3. Iniciar servidor de desarrollo
    console.log('🚀 Iniciando servidor de desarrollo...');
    console.log('📝 El servidor se iniciará en segundo plano.');
    console.log('🌐 URL: http://localhost:3002');
    console.log('📊 Dashboard: http://localhost:3002');
    console.log('🎮 Juego de anamnesis: http://localhost:3002/anamnesis-juego');
    console.log('');
    
    // Iniciar servidor en segundo plano
    const servidor = spawn('pnpm', ['run', 'dev'], {
      stdio: 'pipe',
      shell: true,
      cwd: path.join(__dirname, '..'),
      detached: true
    });
    
    // Mostrar información del proceso
    console.log(`📊 PID del servidor: ${servidor.pid}`);
    console.log('💡 Para detener el servidor: pkill -f "next dev" o Ctrl+C en la terminal del servidor\n');
    
    // 4. Esperar que el servidor esté listo
    await esperarServidor();
    
    // 5. Mostrar instrucciones finales
    console.log('\n🎯 INSTRUCCIONES DE USO');
    console.log('========================');
    console.log('1. 🌐 Abre http://localhost:3002 en tu navegador');
    console.log('2. 👤 Inicia sesión o crea una cuenta de paciente');
    console.log('3. 📋 Ve al dashboard principal');
    console.log('4. 🎮 Completa la anamnesis usando el botón "Completar Anamnesis"');
    console.log('5. 📊 Verifica que los datos aparezcan en el componente AnamnesisCard');
    console.log('');
    console.log('🔧 COMANDOS ÚTILES:');
    console.log('   - Detener servidor: pkill -f "next dev"');
    console.log('   - Ver logs: tail -f .next/server.log');
    console.log('   - Limpiar cache: rm -rf .next');
    console.log('');
    console.log('✅ ¡Integración de anamnesis lista para usar!');
    
  } catch (error) {
    console.error('❌ Error durante la ejecución:', error.message);
    console.log('\n🔧 SOLUCIÓN DE PROBLEMAS:');
    console.log('1. Verifica que el puerto 3002 esté libre');
    console.log('2. Asegúrate de tener todas las dependencias instaladas: pnpm install');
    console.log('3. Verifica que no haya errores de TypeScript: pnpm type-check');
    console.log('4. Revisa los logs del servidor para más detalles');
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  iniciarYProbar();
}

export { iniciarYProbar }; 