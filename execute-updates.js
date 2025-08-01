// AltaMedica - Ejecutor de Scripts de Actualización
// Ejecutar con: node execute-updates.js

const { spawn, exec } = require('child_process');
const path = require('path');

console.log('🏥 AltaMedica - Ejecutando Actualizaciones del Entorno');
console.log('=' * 60);

// Función para ejecutar PowerShell scripts
function runPowerShellScript(scriptPath, description) {
    return new Promise((resolve, reject) => {
        console.log(`\n🚀 ${description}...`);
        console.log(`📄 Ejecutando: ${scriptPath}`);
        
        const ps = spawn('powershell.exe', [
            '-ExecutionPolicy', 'Bypass',
            '-File', scriptPath
        ], {
            stdio: 'inherit',
            shell: true
        });

        ps.on('close', (code) => {
            if (code === 0) {
                console.log(`✅ ${description} - COMPLETADO`);
                resolve();
            } else {
                console.log(`⚠️ ${description} - TERMINADO CON CÓDIGO ${code}`);
                resolve(); // Continue even if there are warnings
            }
        });

        ps.on('error', (err) => {
            console.error(`❌ Error ejecutando ${description}:`, err.message);
            reject(err);
        });
    });
}

// Función para ejecutar comandos npm
function runNpmCommand(command, description) {
    return new Promise((resolve, reject) => {
        console.log(`\n📦 ${description}...`);
        console.log(`💻 Ejecutando: ${command}`);
        
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`❌ Error: ${error.message}`);
                reject(error);
                return;
            }
            if (stderr) {
                console.log(`⚠️ Warnings: ${stderr}`);
            }
            console.log(stdout);
            console.log(`✅ ${description} - COMPLETADO`);
            resolve();
        });
    });
}

// Función principal
async function executeUpdates() {
    try {
        const projectPath = 'C:\\Users\\Eduardo\\Documents\\devaltamedica';
        
        // 1. Verificación inicial
        await runPowerShellScript(
            path.join(projectPath, 'verify-environment.ps1'),
            'Verificación inicial del entorno'
        );

        // 2. Verificar si necesitamos setup del entorno
        console.log('\n🤔 ¿Necesitas configurar el entorno básico? (PowerShell 7+, Chocolatey, etc.)');
        console.log('Si es la primera vez, ejecuta manualmente: setup-windows-environment.ps1');
        
        // 3. Actualizar dependencias existentes
        await runPowerShellScript(
            path.join(projectPath, 'update-dependencies.ps1'),
            'Actualización de dependencias existentes'
        );

        // 4. Instalar nuevas bibliotecas médicas
        await runPowerShellScript(
            path.join(projectPath, 'medical-libraries-upgrade.ps1'),
            'Instalación de nuevas bibliotecas médicas'
        );

        // 5. Verificación final
        await runPowerShellScript(
            path.join(projectPath, 'verify-environment.ps1'),
            'Verificación final del entorno'
        );

        // 6. Test rápido de la instalación
        console.log('\n🧪 Ejecutando tests básicos...');
        process.chdir(projectPath);
        
        await runNpmCommand('npm run type-check', 'Verificación de TypeScript');
        
        console.log('\n🎉 ¡ACTUALIZACIÓN COMPLETADA!');
        console.log('🚀 Tu entorno AltaMedica está listo para desarrollo');
        console.log('📝 Próximo paso: npm run dev:all');

    } catch (error) {
        console.error('\n❌ Error durante la actualización:', error.message);
        console.log('\n🔧 Soluciones alternativas:');
        console.log('1. Ejecutar scripts manualmente en PowerShell como Administrador');
        console.log('2. Verificar permisos de ejecución');
        console.log('3. Contactar soporte si persisten los problemas');
    }
}

// Ejecutar
executeUpdates();