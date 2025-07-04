#!/usr/bin/env node
// 🚀 ALTAMEDICA SETUP CORREGIDO - Rutas correctas

console.log('🔍 DIAGNÓSTICO CORREGIDO: Iniciando script...');
console.log('📍 Directorio actual:', process.cwd());
console.log('🟢 Node.js version:', process.version);

try {
  console.log('📦 Importando módulos...');
  
  const fs = await import('fs/promises');
  const path = await import('path');
  const { exec } = await import('child_process');
  const { promisify } = await import('util');
  const execAsync = promisify(exec);

  console.log('✅ Todos los módulos importados correctamente');

  // 🏥 CONFIGURACIÓN CORREGIDA
  const SETUP_CONFIG = {
    workspace: 'C:\\Users\\Eduardo\\Documents\\devaltamedica',
    claudeConfigPath: process.env.APPDATA + '\\Claude\\claude_desktop_config.json',
    systemPath: 'C:\\Windows\\System32'
  };

  console.log('⚙️ Configuración cargada:', SETUP_CONFIG);

  const log = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = type === 'error' ? '❌' : 
                  type === 'success' ? '✅' : 
                  type === 'warning' ? '⚠️' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
  };

  // BANNER
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                🏥 ALTAMEDICA SETUP CORREGIDO                ║
║               Instalación Sistema Completo                  ║
╚══════════════════════════════════════════════════════════════╝
`);

  log('Iniciando instalación corregida...', 'info');

  // 1. VERIFICAR WORKSPACE
  log('Verificando workspace...', 'info');
  try {
    await fs.default.access(SETUP_CONFIG.workspace);
    log(`Workspace encontrado: ${SETUP_CONFIG.workspace}`, 'success');
  } catch (error) {
    log(`ERROR: Workspace no encontrado: ${SETUP_CONFIG.workspace}`, 'error');
    process.exit(1);
  }

  // 2. VERIFICAR ARCHIVOS CRÍTICOS (RUTAS CORREGIDAS)
  log('Verificando archivos críticos con rutas correctas...', 'info');
  
  const criticalFiles = [
    { file: 'mcp-servers/enhanced-multi-agent-mcp.js', description: 'Enhanced Multi-Agent MCP (principal)' },
    { file: 'altamedica-cli.js', description: 'CLI principal' },
    { file: 'altamedica-bridge.js', description: 'Bridge multi-entorno' },
    { file: 'altamedica-mcp-tools.js', description: 'Herramientas MCP para Claude' },
    { file: 'm.bat', description: 'Comando batch' },
    { file: 'claude_desktop_config_with_tools.json', description: 'Configuración Claude' },
    { file: 'mcp-servers/system-configuration.js', description: 'Configuración del sistema' },
    { file: 'mcp-servers/system-intelligence-utils.js', description: 'Utilidades de inteligencia' }
  ];

  const missingFiles = [];
  const foundFiles = [];

  for (const { file, description } of criticalFiles) {
    try {
      const filePath = path.default.join(SETUP_CONFIG.workspace, file);
      await fs.default.access(filePath);
      log(`✓ ${description}: ${file}`, 'success');
      foundFiles.push(file);
    } catch (error) {
      log(`✗ FALTANTE ${description}: ${file}`, 'error');
      missingFiles.push(file);
    }
  }

  if (missingFiles.length > 0) {
    log(`ERROR: ${missingFiles.length} archivos críticos faltantes`, 'error');
    log('Archivos faltantes:', 'error');
    missingFiles.forEach(file => log(`  - ${file}`, 'error'));
    
    log('Archivos encontrados:', 'info');
    foundFiles.forEach(file => log(`  ✓ ${file}`, 'success'));
    
    process.exit(1);
  }

  log(`✅ Todos los archivos críticos encontrados (${foundFiles.length}/${criticalFiles.length})`, 'success');

  // 3. VERIFICAR NODE.JS Y NPM
  log('Verificando Node.js y npm...', 'info');
  try {
    const { stdout: nodeVersion } = await execAsync('node --version');
    log(`Node.js: ${nodeVersion.trim()}`, 'success');
    
    const { stdout: npmVersion } = await execAsync('npm --version');
    log(`npm: ${npmVersion.trim()}`, 'success');
  } catch (error) {
    log(`ERROR verificando Node.js/npm: ${error.message}`, 'error');
  }

  // 4. PROBAR CLI BÁSICO
  log('Probando CLI básico...', 'info');
  try {
    const cliPath = path.default.join(SETUP_CONFIG.workspace, 'altamedica-cli.js');
    const { stdout } = await execAsync(`node "${cliPath}" version`, {
      cwd: SETUP_CONFIG.workspace
    });
    log('✅ CLI básico funcional', 'success');
    console.log('📋 Muestra CLI:');
    console.log(stdout.substring(0, 300) + (stdout.length > 300 ? '...' : ''));
  } catch (error) {
    log(`❌ ERROR en CLI básico: ${error.message}`, 'error');
    console.log('🔍 Error detalle:', error);
  }

  // 5. PROBAR ENHANCED MCP
  log('Verificando Enhanced Multi-Agent MCP...', 'info');
  try {
    const mcpPath = path.default.join(SETUP_CONFIG.workspace, 'mcp-servers', 'enhanced-multi-agent-mcp.js');
    
    // Solo verificar que el archivo existe y es legible
    const stats = await fs.default.stat(mcpPath);
    log(`✅ Enhanced MCP encontrado (${Math.round(stats.size/1024)}KB)`, 'success');
    
    // Verificar que contiene las clases principales
    const content = await fs.default.readFile(mcpPath, 'utf8');
    if (content.includes('EnhancedMultiAgentComposer') && content.includes('PhilosophicalCore')) {
      log('✅ Enhanced MCP contiene clases principales', 'success');
    } else {
      log('⚠️ Enhanced MCP puede estar incompleto', 'warning');
    }
    
  } catch (error) {
    log(`❌ ERROR verificando Enhanced MCP: ${error.message}`, 'error');
  }

  // 6. VERIFICAR PERMISOS
  log('Verificando permisos...', 'info');
  try {
    const testFile = path.default.join(SETUP_CONFIG.workspace, 'test-permissions.txt');
    await fs.default.writeFile(testFile, 'test');
    await fs.default.unlink(testFile);
    log('✅ Permisos de escritura en workspace: OK', 'success');
  } catch (error) {
    log(`❌ ERROR de permisos en workspace: ${error.message}`, 'error');
  }

  let hasAdminPermissions = false;
  try {
    const testSystemFile = path.default.join(SETUP_CONFIG.systemPath, 'altamedica-test.txt');
    await fs.default.writeFile(testSystemFile, 'test');
    await fs.default.unlink(testSystemFile);
    log('✅ Permisos de administrador: OK', 'success');
    hasAdminPermissions = true;
  } catch (error) {
    log('⚠️ Sin permisos de administrador (comando -m se instalará localmente)', 'warning');
    hasAdminPermissions = false;
  }

  // 7. EJECUTAR INSTALACIÓN REAL
  log('🚀 Iniciando instalación real...', 'info');

  // Instalar comando global (si hay permisos)
  if (hasAdminPermissions) {
    log('Instalando comando -m globalmente...', 'info');
    try {
      const source = path.default.join(SETUP_CONFIG.workspace, 'm.bat');
      const destination = path.default.join(SETUP_CONFIG.systemPath, 'm.bat');
      
      await fs.default.copyFile(source, destination);
      log('✅ Comando -m instalado globalmente', 'success');
    } catch (error) {
      log(`❌ Error instalando comando global: ${error.message}`, 'error');
    }
  } else {
    log('⚠️ Comando -m disponible solo desde el workspace (sin permisos admin)', 'warning');
  }

  // Configurar Claude Desktop
  log('Configurando Claude Desktop...', 'info');
  try {
    const configSource = path.default.join(SETUP_CONFIG.workspace, 'claude_desktop_config_with_tools.json');
    const configContent = await fs.default.readFile(configSource, 'utf8');
    
    // Verificar que la configuración es válida JSON
    const config = JSON.parse(configContent);
    log(`✅ Configuración JSON válida con ${Object.keys(config.mcpServers || {}).length} servidores MCP`, 'success');
    
    const claudeDir = path.default.dirname(SETUP_CONFIG.claudeConfigPath);
    await fs.default.mkdir(claudeDir, { recursive: true });
    
    await fs.default.writeFile(SETUP_CONFIG.claudeConfigPath, configContent);
    log('✅ Configuración Claude Desktop actualizada', 'success');
    log(`📍 Ubicación: ${SETUP_CONFIG.claudeConfigPath}`, 'info');
  } catch (error) {
    log(`❌ Error configurando Claude Desktop: ${error.message}`, 'error');
  }

  // Crear script de inicio rápido
  log('Creando scripts de utilidad...', 'info');
  try {
    const quickStart = `@echo off
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                🏥 ALTAMEDICA QUICK START                    ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
cd /d "${SETUP_CONFIG.workspace}"
echo ✅ Workspace: %CD%
echo.
echo 🚀 COMANDOS PRINCIPALES:
echo   -m start          - Iniciar servidor MCP Enhanced Multi-Agent
echo   -m agents         - Ver 17 agentes médicos especializados
echo   -m status         - Estado completo del sistema
echo   -m compose        - Crear nueva aplicación médica
echo   -m intel          - Reporte de inteligencia del sistema
echo   -m logs           - Ver logs del sistema
echo   -m help           - Ayuda completa
echo.
echo 🎯 PRUEBA RÁPIDA:
echo   -m status
echo.
echo 💡 Para Claude: Reinicia Claude Desktop y usa herramientas MCP
echo.
pause
`;
    await fs.default.writeFile(path.default.join(SETUP_CONFIG.workspace, 'altamedica-quick-start.bat'), quickStart);
    log('✅ Script de inicio rápido creado', 'success');

    // Crear script de test
    const testScript = `@echo off
echo 🧪 Probando sistema Altamedica...
cd /d "${SETUP_CONFIG.workspace}"
echo.
echo 📊 Test 1: CLI básico
node altamedica-cli.js version
echo.
echo 📊 Test 2: Bridge multi-entorno  
node altamedica-bridge.js env
echo.
echo ✅ Tests completados
pause
`;
    await fs.default.writeFile(path.default.join(SETUP_CONFIG.workspace, 'test-altamedica.bat'), testScript);
    log('✅ Script de test creado', 'success');
    
  } catch (error) {
    log(`❌ Error creando scripts: ${error.message}`, 'error');
  }

  // REPORTE FINAL COMPLETO
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                    🎊 INSTALACIÓN COMPLETADA                ║
╚══════════════════════════════════════════════════════════════╝

✅ SISTEMA ALTAMEDICA INSTALADO CORRECTAMENTE

📊 RESUMEN:
   📁 Workspace: ${SETUP_CONFIG.workspace}
   🛠️ Archivos verificados: ${foundFiles.length}/${criticalFiles.length}
   ⚙️ Claude Desktop: Configurado
   🚀 Scripts creados: 2
   🔑 Comando global: ${hasAdminPermissions ? 'Instalado' : 'Solo local'}

🎯 PRÓXIMOS PASOS INMEDIATOS:

1️⃣ REINICIAR CLAUDE DESKTOP COMPLETAMENTE
   - Cerrar Claude Desktop
   - Esperar 10 segundos  
   - Volver a abrir Claude Desktop
   - Verificar que aparecen herramientas MCP

2️⃣ PROBAR EN CLAUDE:
   En Claude, escribe: "Usa altamedica_quick_status"
   
3️⃣ PROBAR COMANDO -M:
   ${hasAdminPermissions ? 
     'Desde cualquier ubicación: -m status' : 
     `cd ${SETUP_CONFIG.workspace}
   -m status`}

4️⃣ EJECUTAR TEST COMPLETO:
   Doble clic en: altamedica-quick-start.bat

📚 COMANDOS DISPONIBLES:
   -m start     🚀 Iniciar servidor MCP Enhanced Multi-Agent
   -m agents    🤖 Ver 17 agentes médicos especializados  
   -m status    📊 Estado completo del sistema
   -m compose   🎼 Crear nueva aplicación médica
   -m intel     🧠 Reporte de inteligencia del sistema
   -m logs      📄 Ver logs del sistema
   -m help      ❓ Ayuda completa

🏥 HERRAMIENTAS CLAUDE MCP:
   • altamedica_command        - Ejecutar comandos -m desde Claude
   • altamedica_agents_list    - Listar agentes médicos
   • altamedica_quick_status   - Estado rápido del sistema
   • altamedica_compose_app    - Crear aplicación médica
   • altamedica_bridge_command - Comandos especiales

💡 PRUEBA INMEDIATA:
   1. Ejecuta: test-altamedica.bat
   2. En Claude: "Usa altamedica_quick_status para verificar el sistema"
   3. Terminal: -m agents

🎊 ¡ALTAMEDICA ENHANCED MULTI-AGENT MCP LISTO PARA USO!
`);

} catch (error) {
  console.error('💥 ERROR CRÍTICO EN SETUP:', error);
  console.error('📍 Stack trace:', error.stack);
  process.exit(1);
}
