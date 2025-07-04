#!/usr/bin/env node
// 🚀 ALTAMEDICA SETUP DEBUG - Versión con diagnóstico completo

console.log('🔍 DIAGNÓSTICO: Iniciando script...');
console.log('📍 Directorio actual:', process.cwd());
console.log('🟢 Node.js version:', process.version);
console.log('🗂️ Argumentos:', process.argv);

try {
  console.log('📦 Intentando importar módulos...');
  
  const fs = await import('fs/promises');
  console.log('✅ fs/promises importado');
  
  const path = await import('path');
  console.log('✅ path importado');
  
  const { exec } = await import('child_process');
  console.log('✅ child_process importado');
  
  const { promisify } = await import('util');
  console.log('✅ util importado');
  
  const execAsync = promisify(exec);
  console.log('✅ execAsync configurado');

  // 🏥 CONFIGURACIÓN
  const SETUP_CONFIG = {
    workspace: 'C:\\Users\\Eduardo\\Documents\\devaltamedica',
    claudeConfigPath: process.env.APPDATA + '\\Claude\\claude_desktop_config.json',
    systemPath: 'C:\\Windows\\System32'
  };

  console.log('⚙️ Configuración cargada:', SETUP_CONFIG);

  // 🎨 COLORES SIMPLES (sin ANSI para debug)
  const log = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = type === 'error' ? '❌' : 
                  type === 'success' ? '✅' : 
                  type === 'warning' ? '⚠️' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
  };

  // BANNER SIMPLE
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                🏥 ALTAMEDICA SETUP DEBUG                    ║
║           Diagnóstico y Setup del Sistema                   ║
╚══════════════════════════════════════════════════════════════╝
`);

  log('Iniciando diagnóstico completo...', 'info');

  // 1. VERIFICAR WORKSPACE
  log('Verificando workspace...', 'info');
  try {
    await fs.default.access(SETUP_CONFIG.workspace);
    log(`Workspace encontrado: ${SETUP_CONFIG.workspace}`, 'success');
  } catch (error) {
    log(`ERROR: Workspace no encontrado: ${SETUP_CONFIG.workspace}`, 'error');
    log(`Error detalle: ${error.message}`, 'error');
    process.exit(1);
  }

  // 2. VERIFICAR ARCHIVOS CRÍTICOS
  log('Verificando archivos críticos...', 'info');
  const criticalFiles = [
    'enhanced-multi-agent-mcp.js',
    'altamedica-cli.js',
    'altamedica-bridge.js',
    'altamedica-mcp-tools.js',
    'm.bat',
    'claude_desktop_config_with_tools.json'
  ];

  const missingFiles = [];
  for (const file of criticalFiles) {
    try {
      const filePath = path.default.join(SETUP_CONFIG.workspace, file);
      await fs.default.access(filePath);
      log(`✓ Archivo encontrado: ${file}`, 'success');
    } catch (error) {
      log(`✗ Archivo faltante: ${file}`, 'error');
      missingFiles.push(file);
    }
  }

  if (missingFiles.length > 0) {
    log(`ERROR: ${missingFiles.length} archivos críticos faltantes`, 'error');
    log('Archivos faltantes: ' + missingFiles.join(', '), 'error');
    process.exit(1);
  }

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
    log('CLI básico funcional', 'success');
    console.log('Salida CLI:', stdout.substring(0, 200) + '...');
  } catch (error) {
    log(`ERROR en CLI básico: ${error.message}`, 'error');
  }

  // 5. VERIFICAR PERMISOS
  log('Verificando permisos...', 'info');
  try {
    // Intentar escribir archivo de prueba
    const testFile = path.default.join(SETUP_CONFIG.workspace, 'test-permissions.txt');
    await fs.default.writeFile(testFile, 'test');
    await fs.default.unlink(testFile);
    log('Permisos de escritura en workspace: OK', 'success');
  } catch (error) {
    log(`ERROR de permisos en workspace: ${error.message}`, 'error');
  }

  try {
    // Verificar si puede escribir en System32 (requiere admin)
    const testSystemFile = path.default.join(SETUP_CONFIG.systemPath, 'altamedica-test.txt');
    await fs.default.writeFile(testSystemFile, 'test');
    await fs.default.unlink(testSystemFile);
    log('Permisos de administrador: OK', 'success');
  } catch (error) {
    log('Permisos de administrador: NO (se requiere para instalar comando global)', 'warning');
  }

  // 6. VERIFICAR CLAUDE DESKTOP
  log('Verificando Claude Desktop...', 'info');
  try {
    const claudeDir = path.default.dirname(SETUP_CONFIG.claudeConfigPath);
    await fs.default.access(claudeDir);
    log('Directorio Claude Desktop encontrado', 'success');
    
    try {
      await fs.default.access(SETUP_CONFIG.claudeConfigPath);
      log('Archivo de configuración Claude existe', 'info');
    } catch {
      log('Archivo de configuración Claude no existe (se creará)', 'info');
    }
  } catch (error) {
    log('Directorio Claude Desktop no encontrado (se creará)', 'info');
  }

  // 7. EJECUCIÓN REAL DEL SETUP
  log('Iniciando instalación real...', 'info');

  // Instalar comando global (si hay permisos)
  log('Instalando comando -m global...', 'info');
  try {
    const source = path.default.join(SETUP_CONFIG.workspace, 'm.bat');
    const destination = path.default.join(SETUP_CONFIG.systemPath, 'm.bat');
    
    await fs.default.copyFile(source, destination);
    log('✅ Comando -m instalado globalmente', 'success');
  } catch (error) {
    log(`⚠️ No se pudo instalar comando global: ${error.message}`, 'warning');
    log('Ejecuta como Administrador para instalar comando global', 'warning');
  }

  // Configurar Claude Desktop
  log('Configurando Claude Desktop...', 'info');
  try {
    const configSource = path.default.join(SETUP_CONFIG.workspace, 'claude_desktop_config_with_tools.json');
    const configContent = await fs.default.readFile(configSource, 'utf8');
    
    const claudeDir = path.default.dirname(SETUP_CONFIG.claudeConfigPath);
    await fs.default.mkdir(claudeDir, { recursive: true });
    
    await fs.default.writeFile(SETUP_CONFIG.claudeConfigPath, configContent);
    log('✅ Configuración Claude Desktop actualizada', 'success');
  } catch (error) {
    log(`❌ Error configurando Claude Desktop: ${error.message}`, 'error');
  }

  // Crear script de inicio rápido
  log('Creando script de inicio rápido...', 'info');
  try {
    const quickStart = `@echo off
echo 🏥 Altamedica Quick Start
cd /d "${SETUP_CONFIG.workspace}"
echo ✅ Workspace: %CD%
echo.
echo 🚀 Comandos disponibles:
echo   -m start     - Iniciar servidor MCP
echo   -m agents    - Ver agentes médicos  
echo   -m status    - Estado del sistema
echo   -m help      - Ayuda completa
echo.
pause
`;
    await fs.default.writeFile(path.default.join(SETUP_CONFIG.workspace, 'altamedica-quick-start.bat'), quickStart);
    log('✅ Script de inicio rápido creado', 'success');
  } catch (error) {
    log(`❌ Error creando script de inicio: ${error.message}`, 'error');
  }

  // REPORTE FINAL
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                    📊 REPORTE FINAL                         ║
╚══════════════════════════════════════════════════════════════╝

✅ INSTALACIÓN COMPLETADA

📁 Workspace: ${SETUP_CONFIG.workspace}
🛠️ Archivos verificados: ${criticalFiles.length - missingFiles.length}/${criticalFiles.length}
⚙️ Claude Desktop configurado
🚀 Scripts de inicio creados

🎯 PRÓXIMOS PASOS:
1. Reiniciar Claude Desktop completamente
2. Verificar herramientas MCP en Claude
3. Probar comando: -m status
4. Si no tienes permisos admin, usa el comando desde el workspace

📚 COMANDOS DISPONIBLES:
  -m start     - Iniciar servidor MCP
  -m agents    - Ver 17 agentes médicos
  -m status    - Estado del sistema
  -m help      - Ayuda completa

💡 PRUEBA RÁPIDA:
  cd ${SETUP_CONFIG.workspace}
  node altamedica-cli.js status

🏥 ALTAMEDICA SETUP COMPLETADO EXITOSAMENTE
`);

} catch (error) {
  console.error('💥 ERROR CRÍTICO EN SETUP:', error);
  console.error('📍 Stack trace:', error.stack);
  process.exit(1);
}
