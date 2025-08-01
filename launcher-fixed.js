// AltaMedica - Launcher Node.js CORREGIDO
// Usa autonomous-update-fixed.ps1 (versión sin errores)

const { exec, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🏥 AltaMedica - Launcher Node.js (VERSIÓN CORREGIDA)');
console.log('=' * 60);

// Configuración - USA EL SCRIPT CORREGIDO
const projectPath = 'C:\\Users\\Eduardo\\Documents\\devaltamedica';
const scriptPath = path.join(projectPath, 'autonomous-update-fixed.ps1'); // ← SCRIPT CORREGIDO

// Función para ejecutar PowerShell con paths correctos
function executePowerShellScript(scriptPath, callback) {
    console.log('🚀 Ejecutando script PowerShell CORREGIDO...');
    console.log('📄 Script:', scriptPath);
    
    // Usar spawn para mejor control de output
    const psProcess = spawn('powershell.exe', [
        '-ExecutionPolicy', 'Bypass',
        '-NoProfile',
        '-File', scriptPath
    ], {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: projectPath,
        shell: false
    });

    let outputBuffer = '';
    let errorBuffer = '';

    // Capturar output en tiempo real
    psProcess.stdout.on('data', (data) => {
        const output = data.toString('utf8');
        outputBuffer += output;
        
        // Mostrar líneas completas inmediatamente
        const lines = output.split('\n');
        lines.forEach(line => {
            if (line.trim()) {
                // Colorear output según contenido
                if (line.includes('ERROR') || line.includes('❌')) {
                    console.log('❌', line.trim());
                } else if (line.includes('SUCCESS') || line.includes('✅')) {
                    console.log('✅', line.trim());
                } else if (line.includes('WARNING') || line.includes('⚠️')) {
                    console.log('⚠️', line.trim());
                } else if (line.includes('🚀') || line.includes('FASE')) {
                    console.log('🚀', line.trim());
                } else if (line.includes('🎉') || line.includes('COMPLETADO')) {
                    console.log('🎉', line.trim());
                } else {
                    console.log('📄', line.trim());
                }
            }
        });
    });

    psProcess.stderr.on('data', (data) => {
        const error = data.toString('utf8');
        errorBuffer += error;
        console.error('🔥 PowerShell Error:', error.trim());
    });

    psProcess.on('close', (code) => {
        console.log('\n' + '='.repeat(60));
        if (code === 0) {
            console.log('🎉 ACTUALIZACIÓN ALTAMEDICA COMPLETADA EXITOSAMENTE!');
            
            // Verificar logs generados
            const logsPath = path.join(projectPath, 'logs');
            if (fs.existsSync(logsPath)) {
                console.log('\n📁 Logs generados en:', logsPath);
                const logFiles = fs.readdirSync(logsPath);
                logFiles.forEach(file => {
                    const filePath = path.join(logsPath, file);
                    const stats = fs.statSync(filePath);
                    console.log(`  📄 ${file} (${(stats.size / 1024).toFixed(1)} KB)`);
                });
            }
            
            console.log('\n🚀 PRÓXIMOS PASOS:');
            console.log('1. Revisar logs para confirmar éxito');
            console.log('2. Ejecutar: npm run dev:all');
            console.log('3. Abrir: http://localhost:3000');
            console.log('4. Verificar que todas las apps funcionan');
            
        } else {
            console.log('⚠️ Script terminado con código:', code);
            console.log('📊 Revisa los mensajes arriba para detalles');
        }
        
        if (callback) callback(code, outputBuffer, errorBuffer);
    });

    psProcess.on('error', (err) => {
        console.error('❌ Error ejecutando PowerShell:', err.message);
        if (callback) callback(-1, '', err.message);
    });

    return psProcess;
}

// Función de diagnóstico
function runDiagnostics() {
    console.log('\n🔍 DIAGNÓSTICO DEL ENTORNO:');
    console.log('-'.repeat(40));
    
    // Verificar PowerShell
    exec('powershell.exe -Command "$PSVersionTable.PSVersion"', (error, stdout, stderr) => {
        if (error) {
            console.log('❌ PowerShell no disponible:', error.message);
        } else {
            console.log('✅ PowerShell versión:', stdout.trim());
        }
    });
    
    // Verificar Node.js
    console.log('✅ Node.js versión:', process.version);
    console.log('✅ Plataforma:', process.platform);
    console.log('✅ Arquitectura:', process.arch);
    
    // Verificar directorio y archivos
    console.log('✅ Directorio actual:', process.cwd());
    console.log('✅ Directorio proyecto:', projectPath);
    
    if (fs.existsSync(scriptPath)) {
        console.log('✅ Script CORREGIDO encontrado:', scriptPath);
    } else {
        console.log('❌ Script CORREGIDO NO encontrado:', scriptPath);
    }
    
    // Verificar permisos de ejecución
    try {
        fs.accessSync(projectPath, fs.constants.R_OK | fs.constants.W_OK);
        console.log('✅ Permisos de directorio: OK');
    } catch (err) {
        console.log('❌ Permisos de directorio: FALLO');
    }
}

// Función principal
function main() {
    console.log('🔧 Usando script PowerShell CORREGIDO sin errores de sintaxis...');
    
    // Cambiar al directorio del proyecto
    try {
        process.chdir(projectPath);
        console.log('✅ Directorio cambiado a:', process.cwd());
    } catch (err) {
        console.error('❌ Error cambiando directorio:', err.message);
        process.exit(1);
    }
    
    // Ejecutar diagnóstico
    runDiagnostics();
    
    // Verificar que el script corregido existe
    if (!fs.existsSync(scriptPath)) {
        console.error('❌ Script CORREGIDO no encontrado. Verifica que exists:');
        console.error('   ', scriptPath);
        process.exit(1);
    }
    
    console.log('\n🚀 Iniciando ejecución del script CORREGIDO...');
    console.log('⏱️ Tiempo estimado: 5-8 minutos');
    console.log('💡 Presiona Ctrl+C para interrumpir\n');
    
    // Ejecutar el script corregido
    const psProcess = executePowerShellScript(scriptPath, (code, stdout, stderr) => {
        console.log('\n📊 RESUMEN FINAL:');
        console.log('Exit Code:', code);
        
        if (code === 0) {
            console.log('\n🎉 ¡ACTUALIZACIÓN ALTAMEDICA COMPLETADA EXITOSAMENTE!');
            console.log('🏥 Tu plataforma médica está lista para desarrollo avanzado!');
        } else {
            console.log('⚠️ Revisa los mensajes arriba para detalles');
        }
        
        process.exit(code);
    });
    
    // Manejar Ctrl+C
    process.on('SIGINT', () => {
        console.log('\n🛑 Interrumpido por usuario');
        if (psProcess) {
            psProcess.kill('SIGTERM');
        }
        process.exit(0);
    });
}

// Ejecutar
main();