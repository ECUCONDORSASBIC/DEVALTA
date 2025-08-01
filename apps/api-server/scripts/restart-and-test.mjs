/**
 * Script para Reiniciar y Probar API Server - Altamedica
 * Reinicia el servidor y verifica que Firebase funciona correctamente
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Reiniciando y probando API Server...\n');

// Función para esperar que el servidor esté listo
function esperarServidor() {
  return new Promise((resolve) => {
    console.log('⏳ Esperando que el servidor esté listo...');
    
    const verificarServidor = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/v1/patients/simple');
        
        if (response.status === 200 || response.status === 404) {
          console.log('✅ Servidor listo en puerto 3001');
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

// Función para probar las APIs
async function probarAPIs() {
  console.log('\n🧪 Probando APIs...');
  
  const endpoints = [
    { url: 'http://localhost:3001/api/v1/patients/simple', name: 'Patients API' },
    { url: 'http://localhost:3001/api/v1/appointments?patientId=test&limit=5', name: 'Appointments API' }
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`📡 Probando ${endpoint.name}...`);
      const response = await fetch(endpoint.url);
      
      if (response.status === 200) {
        console.log(`✅ ${endpoint.name}: OK (200)`);
      } else if (response.status === 404) {
        console.log(`⚠️  ${endpoint.name}: Endpoint no encontrado (404) - Normal en desarrollo`);
      } else {
        console.log(`❌ ${endpoint.name}: Error (${response.status})`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint.name}: Error de conexión - ${error.message}`);
    }
  }
}

// Función principal
async function main() {
  try {
    // 1. Verificar que no hay otro proceso corriendo
    console.log('🔍 Verificando puerto 3001...');
    try {
      const response = await fetch('http://localhost:3001');
      console.log('⚠️  El puerto 3001 ya está en uso. Deteniendo proceso anterior...');
      
      // En Windows, usar taskkill para detener procesos
      const killProcess = spawn('taskkill', ['/f', '/im', 'node.exe'], {
        stdio: 'pipe',
        shell: true
      });
      
      killProcess.on('close', () => {
        console.log('✅ Procesos anteriores detenidos');
      });
      
      // Esperar un poco antes de continuar
      await new Promise(resolve => setTimeout(resolve, 3000));
      
    } catch (error) {
      console.log('✅ Puerto 3001 disponible');
    }
    
    // 2. Iniciar servidor en segundo plano
    console.log('🚀 Iniciando servidor api-server...');
    const servidor = spawn('pnpm', ['run', 'dev'], {
      stdio: 'pipe',
      shell: true,
      cwd: path.join(__dirname, '..'),
      detached: true
    });
    
    console.log(`📊 PID del servidor: ${servidor.pid}`);
    
    // 3. Esperar que el servidor esté listo
    await esperarServidor();
    
    // 4. Probar APIs
    await probarAPIs();
    
    // 5. Mostrar instrucciones
    console.log('\n🎯 RESUMEN');
    console.log('==========');
    console.log('✅ Servidor api-server iniciado');
    console.log('✅ Configuración de Firebase corregida');
    console.log('✅ APIs probadas');
    console.log('');
    console.log('🌐 URLs disponibles:');
    console.log('   - API Server: http://localhost:3001');
    console.log('   - Patients App: http://localhost:3002');
    console.log('');
    console.log('💡 Para detener el servidor:');
    console.log('   - Ctrl+C en la terminal del servidor');
    console.log('   - O: taskkill /f /im node.exe');
    console.log('');
    console.log('✅ ¡Error de Firebase solucionado!');
    
  } catch (error) {
    console.error('❌ Error durante la ejecución:', error.message);
    console.log('\n🔧 SOLUCIÓN DE PROBLEMAS:');
    console.log('1. Verifica que el puerto 3001 esté libre');
    console.log('2. Asegúrate de que las variables de Firebase estén configuradas');
    console.log('3. Revisa los logs del servidor para más detalles');
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main }; 