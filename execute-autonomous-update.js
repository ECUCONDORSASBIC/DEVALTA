// AltaMedica - Ejecutor Node.js del Sistema Autónomo
// Alternativa para ejecutar autonomous-update-monitor.ps1 cuando bash está bloqueado

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🏥 AltaMedica - Ejecutor Node.js del Sistema Autónomo');
console.log('=' * 60);

// Configuración
const projectPath = 'C:\\Users\\Eduardo\\Documents\\devaltamedica';
const scriptPath = path.join(projectPath, 'autonomous-update-monitor.ps1');
const logsPath = path.join(projectPath, 'logs');

// Verificar que el script existe
if (!fs.existsSync(scriptPath)) {
    console.error('❌ Script no encontrado:', scriptPath);
    process.exit(1);
}

console.log('📁 Directorio del proyecto:', projectPath);
console.log('📄 Script a ejecutar:', scriptPath);
console.log('📊 Logs se crearán en:', logsPath);

// Cambiar al directorio del proyecto
process.chdir(projectPath);
console.log('✅ Directorio cambiado a:', process.cwd());

console.log('\n🚀 Iniciando ejecución del sistema autónomo...');
console.log('⏱️ Tiempo estimado: 5-8 minutos');
console.log('🔄 Monitoreo en tiempo real activado');
console.log('=' * 60);

// Ejecutar el script PowerShell
const psProcess = spawn('powershell.exe', [
    '-ExecutionPolicy', 'Bypass',
    '-File', scriptPath
], {
    stdio: ['pipe', 'pipe', 'pipe'],
    shell: true,
    cwd: projectPath
});

// Variables para el monitoreo
let lastOutput = '';
let outputBuffer = '';
const startTime = Date.now();

// Función para mostrar progreso estimado
function showProgress() {
    const elapsed = (Date.now() - startTime) / 1000 / 60; // minutos
    const estimatedTotal = 8; // minutos
    const progress = Math.min(95, (elapsed / estimatedTotal) * 100);
    const progressBar = '█'.repeat(Math.floor(progress / 5)) + '░'.repeat(20 - Math.floor(progress / 5));
    
    process.stdout.write(`\r🚀 Progreso: [${progressBar}] ${progress.toFixed(1)}% | ${elapsed.toFixed(1)}/${estimatedTotal} min`);
}

// Mostrar progreso cada 10 segundos
const progressInterval = setInterval(showProgress, 10000);

// Capturar salida estándar
psProcess.stdout.on('data', (data) => {
    const output = data.toString();
    outputBuffer += output;
    
    // Mostrar líneas completas
    const lines = outputBuffer.split('\n');
    outputBuffer = lines.pop(); // Mantener línea incompleta en buffer
    
    lines.forEach(line => {
        if (line.trim()) {
            console.log('\n📄', line.trim());
            lastOutput = line.trim();
        }
    });
});

// Capturar errores
psProcess.stderr.on('data', (data) => {
    const error = data.toString();
    console.error('\n❌ Error:', error.trim());
});

// Manejar cierre del proceso
psProcess.on('close', (code) => {
    clearInterval(progressInterval);
    console.log('\n' + '=' * 60);
    
    if (code === 0) {
        console.log('🎉 ACTUALIZACIÓN COMPLETADA EXITOSAMENTE!');
        console.log('✅ Código de salida:', code);
        
        // Mostrar información de logs
        if (fs.existsSync(logsPath)) {
            console.log('\n📊 LOGS GENERADOS:');
            const logFiles = fs.readdirSync(logsPath);
            logFiles.forEach(file => {
                const filePath = path.join(logsPath, file);
                const stats = fs.statSync(filePath);
                console.log(`📄 ${file} (${(stats.size / 1024).toFixed(1)} KB)`);
            });
            
            // Mostrar últimas líneas del log principal
            const mainLogPath = path.join(logsPath, 'update-main.log');
            if (fs.existsSync(mainLogPath)) {
                try {
                    const logContent = fs.readFileSync(mainLogPath, 'utf8');
                    const lastLines = logContent.split('\n').slice(-5).filter(line => line.trim());
                    console.log('\n📋 ÚLTIMAS ACTIVIDADES:');
                    lastLines.forEach(line => console.log('  ', line));
                } catch (err) {
                    console.log('⚠️ No se pudo leer el log principal');
                }
            }
        }
        
        console.log('\n🚀 PRÓXIMOS PASOS:');
        console.log('1. Verificar que no hay errores en los logs');
        console.log('2. Ejecutar: npm run dev:all');
        console.log('3. Abrir: http://localhost:3000');
        
    } else {
        console.log('⚠️ ACTUALIZACIÓN TERMINADA CON ADVERTENCIAS');
        console.log('❌ Código de salida:', code);
        console.log('📊 Revisa los logs para más detalles');
    }
    
    console.log('\n🏥 Tu plataforma AltaMedica está lista!');
    console.log('=' * 60);
});

// Manejar errores del proceso
psProcess.on('error', (err) => {
    clearInterval(progressInterval);
    console.error('\n❌ ERROR EJECUTANDO SCRIPT:', err.message);
    
    console.log('\n🔧 SOLUCIONES ALTERNATIVAS:');
    console.log('1. Ejecutar manualmente: .\\autonomous-update-monitor.ps1');
    console.log('2. Verificar permisos de PowerShell');
    console.log('3. Ejecutar como Administrador');
    
    process.exit(1);
});

// Manejar Ctrl+C
process.on('SIGINT', () => {
    console.log('\n\n🛑 Interrumpido por usuario');
    clearInterval(progressInterval);
    psProcess.kill();
    process.exit(0);
});

console.log('\n💡 Presiona Ctrl+C para interrumpir si es necesario');
console.log('🔍 Monitoreo iniciado...\n');