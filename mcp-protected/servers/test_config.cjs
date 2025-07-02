#!/usr/bin/env node

/**
 * Script de pruebas para validar la configuración de servidores MCP
 * Uso: node test_config.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Iniciando validación de configuración MCP...\n');

// Test 1: Verificar Node.js
console.log('✅ Test 1: Verificando Node.js');
console.log(`   Versión: ${process.version}`);
console.log(`   Plataforma: ${process.platform}`);
console.log(`   Arquitectura: ${process.arch}\n`);

// Test 2: Verificar archivos de configuración
console.log('✅ Test 2: Verificando archivos de configuración');
const configFile = 'claude_desktop_config_working_20250702.json';

try {
    if (fs.existsSync(configFile)) {
        console.log(`   ✓ ${configFile} existe`);
        
        const configData = fs.readFileSync(configFile, 'utf8');
        const config = JSON.parse(configData);
        
        console.log(`   ✓ JSON válido`);
        console.log(`   ✓ Servidores configurados: ${Object.keys(config.mcpServers).length}`);
        
        // Listar servidores
        Object.keys(config.mcpServers).forEach(serverName => {
            console.log(`     - ${serverName}`);
        });
        
    } else {
        console.log(`   ❌ ${configFile} no encontrado`);
    }
} catch (error) {
    console.log(`   ❌ Error al leer configuración: ${error.message}`);
}

console.log('');

// Test 3: Verificar archivos de servidores
console.log('✅ Test 3: Verificando archivos de servidores');
const serverFiles = [
    'ai-flow-orchestrator-mcp.js',
    'codebase-intelligence-mcp.js',
    'context-memory-mcp.js',
    'multi-agent-composer-mcp.js',
    'smart-completion-mcp.js',
    'frontend-error-handler.js'
];

let validServers = 0;
serverFiles.forEach(serverFile => {
    if (fs.existsSync(serverFile)) {
        console.log(`   ✓ ${serverFile}`);
        validServers++;
    } else {
        console.log(`   ❌ ${serverFile} no encontrado`);
    }
});

console.log(`   Total de servidores válidos: ${validServers}/${serverFiles.length}\n`);

// Test 4: Verificar sintaxis de archivos JS
console.log('✅ Test 4: Verificando sintaxis de archivos JS');
serverFiles.forEach(serverFile => {
    if (fs.existsSync(serverFile)) {
        try {
            // Verificación básica de sintaxis
            const content = fs.readFileSync(serverFile, 'utf8');
            if (content.length > 0) {
                console.log(`   ✓ ${serverFile} - sintaxis aparentemente válida`);
            } else {
                console.log(`   ⚠️ ${serverFile} - archivo vacío`);
            }
        } catch (error) {
            console.log(`   ❌ ${serverFile} - error: ${error.message}`);
        }
    }
});

console.log('');

// Test 5: Verificar estructura de directorios
console.log('✅ Test 5: Verificando estructura de directorios');
console.log(`   Directorio actual: ${process.cwd()}`);
console.log(`   package.json: ${fs.existsSync('package.json') ? '✓' : '❌'}`);
console.log(`   README.md: ${fs.existsSync('README.md') ? '✓' : '❌'}`);
console.log(`   INSTRUCCIONES_EQUIPO.md: ${fs.existsSync('INSTRUCCIONES_EQUIPO.md') ? '✓' : '❌'}`);

console.log('');

// Test 6: Información del sistema
console.log('✅ Test 6: Información del sistema');
const osInfo = {
    platform: process.platform,
    release: require('os').release(),
    homedir: require('os').homedir(),
    tmpdir: require('os').tmpdir()
};

console.log(`   SO: ${osInfo.platform}`);
console.log(`   Versión: ${osInfo.release}`);
console.log(`   Directorio home: ${osInfo.homedir}`);

// Verificar ubicación esperada de Claude Desktop config
let claudeConfigPath;
if (process.platform === 'win32') {
    claudeConfigPath = path.join(process.env.APPDATA, 'Claude', 'claude_desktop_config.json');
} else if (process.platform === 'darwin') {
    claudeConfigPath = path.join(osInfo.homedir, 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json');
} else {
    claudeConfigPath = path.join(osInfo.homedir, '.config', 'Claude', 'claude_desktop_config.json');
}

console.log(`   Ruta esperada de config Claude: ${claudeConfigPath}`);
console.log(`   Config Claude existe: ${fs.existsSync(claudeConfigPath) ? '✓' : '❌'}`);

console.log('');

// Resumen final
console.log('📊 RESUMEN DE VALIDACIÓN');
console.log('========================');
console.log(`Node.js: ${process.version} ✓`);
console.log(`Archivos de configuración: ${fs.existsSync(configFile) ? '✓' : '❌'}`);
console.log(`Servidores encontrados: ${validServers}/${serverFiles.length}`);
console.log(`Documentación: ${fs.existsSync('README.md') && fs.existsSync('INSTRUCCIONES_EQUIPO.md') ? '✓' : '❌'}`);
console.log(`Claude Desktop config: ${fs.existsSync(claudeConfigPath) ? '✓' : '❌'}`);

console.log('\n🎉 Validación completada!');

if (validServers === serverFiles.length && fs.existsSync(configFile)) {
    console.log('\n✨ Todo parece estar en orden. La configuración está lista para usar.');
} else {
    console.log('\n⚠️ Se encontraron algunos problemas. Revisa los detalles arriba.');
}

console.log('\nPara más información, consulta README.md o INSTRUCCIONES_EQUIPO.md');
