#!/usr/bin/env node

/**
 * 🏥 ALTAMEDICA MARKETPLACE SERVER STARTER
 * =========================================
 * Script para levantar el servidor de marketplace con todas las funcionalidades
 * 
 * Uso:
 *   node scripts/start-marketplace-server.js [puerto] [--clean] [--help]
 * 
 * Ejemplos:
 *   node scripts/start-marketplace-server.js
 *   node scripts/start-marketplace-server.js 3001
 *   node scripts/start-marketplace-server.js --clean
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const http = require('http');

// Configuración
const DEFAULT_PORT = 3001;
const API_SERVER_DIR = path.join(__dirname, '..', 'apps', 'api-server');

// Colores para consola
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function showHelp() {
    log('\n🏥 ALTAMEDICA MARKETPLACE SERVER STARTER', 'bright');
    log('==========================================\n', 'cyan');

    log('Uso:', 'yellow');
    log('  node scripts/start-marketplace-server.js [opciones]\n', 'reset');

    log('Opciones:', 'yellow');
    log('  [puerto]     Puerto del servidor (default: 3001)', 'reset');
    log('  --clean      Limpiar caché antes de iniciar', 'reset');
    log('  --help       Mostrar esta ayuda', 'reset');
    log('  --install    Instalar dependencias antes de iniciar', 'reset');

    log('\nEndpoints del Marketplace:', 'yellow');
    log('  GET  /api/v1/marketplace/orphan-patients     - Listar pacientes huérfanos', 'reset');
    log('  POST /api/v1/marketplace/orphan-patients     - Registrar paciente huérfano', 'reset');
    log('  GET  /api/v1/marketplace/doctors             - Listar médicos disponibles', 'reset');
    log('  POST /api/v1/marketplace/doctors             - Registrar médico', 'reset');
    log('  POST /api/v1/marketplace/match               - Asignar paciente a médico', 'reset');
    log('  GET  /api/v1/marketplace/stats               - Estadísticas del marketplace', 'reset');

    log('\nURLs de Acceso:', 'yellow');
    log('  Local:  http://localhost:[puerto]', 'green');
    log('  API:    http://localhost:[puerto]/api/v1/marketplace', 'green');
    log('  Health: http://localhost:[puerto]/api/v1/health', 'green');

    log('\nEjemplos:', 'yellow');
    log('  node scripts/start-marketplace-server.js', 'reset');
    log('  node scripts/start-marketplace-server.js 3001', 'reset');
    log('  node scripts/start-marketplace-server.js --clean', 'reset');
    log('  node scripts/start-marketplace-server.js 3001 --install\n', 'reset');

    process.exit(0);
}

function validatePort(port) {
    const portNum = parseInt(port);
    if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
        log('❌ Puerto inválido. Debe ser un número entre 1 y 65535', 'red');
        process.exit(1);
    }
    return portNum;
}

function cleanCache() {
    log('\n🧹 Limpiando caché...', 'yellow');

    const cacheDirs = [
        path.join(API_SERVER_DIR, '.next'),
        path.join(API_SERVER_DIR, '.turbo'),
        path.join(API_SERVER_DIR, 'node_modules', '.cache')
    ];

    cacheDirs.forEach(dir => {
        if (fs.existsSync(dir)) {
            try {
                fs.rmSync(dir, { recursive: true, force: true });
                log(`✅ Caché limpiado: ${path.basename(dir)}`, 'green');
            } catch (error) {
                log(`⚠️  No se pudo limpiar: ${path.basename(dir)}`, 'yellow');
            }
        }
    });
}

function checkDependencies() {
    const packageJsonPath = path.join(API_SERVER_DIR, 'package.json');
    const nodeModulesPath = path.join(API_SERVER_DIR, 'node_modules');

    if (!fs.existsSync(packageJsonPath)) {
        log('❌ package.json no encontrado en apps/api-server', 'red');
        return false;
    }

    if (!fs.existsSync(nodeModulesPath)) {
        log('⚠️  node_modules no encontrado', 'yellow');
        return false;
    }

    return true;
}

async function installDependencies() {
    log('\n📦 Instalando dependencias...', 'yellow');

    return new Promise((resolve, reject) => {
        const installProcess = spawn('pnpm', ['install'], {
            stdio: 'inherit',
            shell: true,
            cwd: API_SERVER_DIR
        });

        installProcess.on('close', (code) => {
            if (code === 0) {
                log('✅ Dependencias instaladas correctamente', 'green');
                resolve(true);
            } else {
                log('❌ Error instalando dependencias', 'red');
                reject(new Error(`Install failed with code ${code}`));
            }
        });
    });
}

function checkServerHealth(port, maxAttempts = 30) {
    return new Promise((resolve) => {
        let attempts = 0;

        const checkHealth = () => {
            attempts++;

            const req = http.request({
                hostname: 'localhost',
                port: port,
                path: '/api/v1/health',
                method: 'GET',
                timeout: 3000
            }, (res) => {
                if (res.statusCode === 200) {
                    log('✅ Servidor de marketplace iniciado correctamente', 'green');
                    resolve(true);
                } else {
                    if (attempts < maxAttempts) {
                        setTimeout(checkHealth, 2000);
                    } else {
                        log('❌ Servidor no responde correctamente', 'red');
                        resolve(false);
                    }
                }
            });

            req.on('error', () => {
                if (attempts < maxAttempts) {
                    setTimeout(checkHealth, 2000);
                } else {
                    log('❌ No se pudo conectar al servidor', 'red');
                    resolve(false);
                }
            });

            req.on('timeout', () => {
                req.destroy();
                if (attempts < maxAttempts) {
                    setTimeout(checkHealth, 2000);
                } else {
                    log('❌ Timeout al conectar con el servidor', 'red');
                    resolve(false);
                }
            });

            req.end();
        };

        checkHealth();
    });
}

function startServer(port) {
    log('\n🚀 INICIANDO ALTAMEDICA MARKETPLACE SERVER', 'bright');
    log('==========================================\n', 'cyan');

    log(`📁 Directorio: ${API_SERVER_DIR}`, 'blue');
    log(`🌐 Puerto: ${port}`, 'blue');
    log(`🔗 URL Local: http://localhost:${port}`, 'green');
    log(`🏥 API Marketplace: http://localhost:${port}/api/v1/marketplace`, 'green');
    log(`💚 Health Check: http://localhost:${port}/api/v1/health`, 'green');
    log('\n⏳ Iniciando servidor de desarrollo...\n', 'yellow');

    const devProcess = spawn('pnpm', ['dev', '--port', port.toString()], {
        stdio: 'inherit',
        shell: true,
        cwd: API_SERVER_DIR,
        env: {
            ...process.env,
            NODE_ENV: 'development',
            FAST_REFRESH: 'true',
            NEXT_TELEMETRY_DISABLED: '1',
            PORT: port.toString()
        }
    });

    devProcess.on('error', (error) => {
        log(`❌ Error al iniciar el servidor: ${error.message}`, 'red');
        process.exit(1);
    });

    devProcess.on('close', (code) => {
        log(`\n📊 Proceso terminado con código: ${code}`, 'blue');
        process.exit(code);
    });

    // Verificar salud del servidor después de un tiempo
    setTimeout(async () => {
        const isHealthy = await checkServerHealth(port);
        if (isHealthy) {
            log('\n🎉 MARKETPLACE SERVER LISTO PARA USAR', 'bright');
            log('====================================', 'cyan');
            log('\n📋 Endpoints disponibles:', 'yellow');
            log('  • GET  /api/v1/marketplace/orphan-patients', 'reset');
            log('  • POST /api/v1/marketplace/orphan-patients', 'reset');
            log('  • GET  /api/v1/marketplace/doctors', 'reset');
            log('  • POST /api/v1/marketplace/doctors', 'reset');
            log('  • POST /api/v1/marketplace/match', 'reset');
            log('  • GET  /api/v1/marketplace/stats', 'reset');
            log('\n🔧 Para detener el servidor: Ctrl+C', 'yellow');
        }
    }, 10000);

    // Manejo de señales para cerrar limpiamente
    process.on('SIGINT', () => {
        log('\n🛑 Deteniendo servidor de marketplace...', 'yellow');
        devProcess.kill('SIGINT');
        process.exit(0);
    });

    process.on('SIGTERM', () => {
        log('\n🛑 Terminando servidor de marketplace...', 'yellow');
        devProcess.kill('SIGTERM');
        process.exit(0);
    });
}

// Función principal
async function main() {
    const args = process.argv.slice(2);
    let port = DEFAULT_PORT;
    let shouldClean = false;
    let shouldInstall = false;

    // Procesar argumentos
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];

        if (arg === '--help' || arg === '-h') {
            showHelp();
        } else if (arg === '--clean') {
            shouldClean = true;
        } else if (arg === '--install') {
            shouldInstall = true;
        } else if (!isNaN(arg)) {
            port = validatePort(arg);
        } else {
            log(`⚠️  Argumento desconocido: ${arg}`, 'yellow');
            showHelp();
        }
    }

    // Verificar directorio
    if (!fs.existsSync(API_SERVER_DIR)) {
        log('❌ Directorio apps/api-server no encontrado', 'red');
        process.exit(1);
    }

    // Limpiar caché si se solicita
    if (shouldClean) {
        cleanCache();
    }

    // Verificar/instalar dependencias
    const depsOk = checkDependencies();
    if (!depsOk || shouldInstall) {
        try {
            await installDependencies();
        } catch (error) {
            process.exit(1);
        }
    }

    // Iniciar servidor
    startServer(port);
}

// Ejecutar si es el archivo principal
if (require.main === module) {
    main().catch((error) => {
        log(`❌ Error: ${error.message}`, 'red');
        process.exit(1);
    });
}

module.exports = { startServer, checkServerHealth }; 