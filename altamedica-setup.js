#!/usr/bin/env node
// 🚀 ALTAMEDICA SETUP - Instalación Automática Multi-Entorno

import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// 🏥 CONFIGURACIÓN
const SETUP_CONFIG = {
  workspace: 'C:\\Users\\Eduardo\\Documents\\devaltamedica',
  claudeConfigPath: process.env.APPDATA + '\\Claude\\claude_desktop_config.json',
  systemPath: 'C:\\Windows\\System32'
};

// 🎨 COLORES
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

// 🛠️ CLASE DE INSTALACIÓN
class AltamedicaSetup {
  constructor() {
    this.workspace = SETUP_CONFIG.workspace;
    this.errors = [];
    this.warnings = [];
    this.success = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    
    switch (type) {
      case 'success':
        console.log(`${colors.green}✅ [${timestamp}] ${message}${colors.reset}`);
        this.success.push(message);
        break;
      case 'error':
        console.log(`${colors.red}❌ [${timestamp}] ${message}${colors.reset}`);
        this.errors.push(message);
        break;
      case 'warning':
        console.log(`${colors.yellow}⚠️ [${timestamp}] ${message}${colors.reset}`);
        this.warnings.push(message);
        break;
      case 'info':
        console.log(`${colors.blue}ℹ️ [${timestamp}] ${message}${colors.reset}`);
        break;
    }
  }

  async showBanner() {
    console.log(`${colors.cyan}
╔══════════════════════════════════════════════════════════════╗
║                🏥 ALTAMEDICA SETUP AUTOMÁTICO                ║
║           Instalación Multi-Entorno Claude + Cursor + Warp  ║
║                Enhanced Multi-Agent MCP System              ║
╚══════════════════════════════════════════════════════════════╝
${colors.reset}`);
  }

  async verifyPrerequisites() {
    this.log('Verificando prerrequisitos...', 'info');
    
    try {
      // Verificar Node.js
      const { stdout: nodeVersion } = await execAsync('node --version');
      this.log(`Node.js detectado: ${nodeVersion.trim()}`, 'success');
      
      // Verificar npm
      const { stdout: npmVersion } = await execAsync('npm --version');
      this.log(`npm detectado: ${npmVersion.trim()}`, 'success');
      
      // Verificar workspace
      const workspaceExists = await fs.access(this.workspace).then(() => true).catch(() => false);
      if (workspaceExists) {
        this.log(`Workspace encontrado: ${this.workspace}`, 'success');
      } else {
        this.log(`Workspace no encontrado: ${this.workspace}`, 'error');
        return false;
      }
      
      return true;
      
    } catch (error) {
      this.log(`Error verificando prerrequisitos: ${error.message}`, 'error');
      return false;
    }
  }

  async installSystemCommand() {
    this.log('Instalando comando -m en sistema...', 'info');
    
    try {
      const source = path.join(this.workspace, 'm.bat');
      const destination = path.join(SETUP_CONFIG.systemPath, 'm.bat');
      
      // Verificar que el archivo fuente existe
      await fs.access(source);
      
      // Copiar al PATH del sistema
      await fs.copyFile(source, destination);
      
      this.log('Comando -m instalado globalmente', 'success');
      return true;
      
    } catch (error) {
      this.log(`Error instalando comando sistema: ${error.message}`, 'error');
      this.log('Intenta ejecutar como Administrador', 'warning');
      return false;
    }
  }

  async setupClaudeDesktop() {
    this.log('Configurando Claude Desktop...', 'info');
    
    try {
      // Leer configuración actualizada
      const configSource = path.join(this.workspace, 'claude_desktop_config_with_tools.json');
      const configContent = await fs.readFile(configSource, 'utf8');
      
      // Crear directorio de Claude si no existe
      const claudeDir = path.dirname(SETUP_CONFIG.claudeConfigPath);
      await fs.mkdir(claudeDir, { recursive: true });
      
      // Escribir configuración
      await fs.writeFile(SETUP_CONFIG.claudeConfigPath, configContent);
      
      this.log('Configuración de Claude Desktop actualizada', 'success');
      this.log('🔄 IMPORTANTE: Reinicia Claude Desktop para aplicar cambios', 'warning');
      return true;
      
    } catch (error) {
      this.log(`Error configurando Claude Desktop: ${error.message}`, 'error');
      return false;
    }
  }

  async testSystemCommands() {
    this.log('Probando comandos del sistema...', 'info');
    
    try {
      // Cambiar al workspace
      process.chdir(this.workspace);
      
      // Probar comando básico
      const { stdout } = await execAsync('node altamedica-cli.js version');
      this.log('CLI básico funcional', 'success');
      
      // Probar bridge
      const { stdout: bridgeOut } = await execAsync('node altamedica-bridge.js env');
      this.log('Bridge multi-entorno funcional', 'success');
      
      // Verificar MCP tools
      const mcpToolsExists = await fs.access(path.join(this.workspace, 'altamedica-mcp-tools.js')).then(() => true).catch(() => false);
      if (mcpToolsExists) {
        this.log('Herramientas MCP para Claude disponibles', 'success');
      } else {
        this.log('Herramientas MCP no encontradas', 'warning');
      }
      
      return true;
      
    } catch (error) {
      this.log(`Error probando comandos: ${error.message}`, 'error');
      return false;
    }
  }

  async createDesktopShortcuts() {
    this.log('Creando accesos directos...', 'info');
    
    try {
      // Crear script de inicio rápido
      const quickStart = `@echo off
echo 🏥 Altamedica Quick Start
cd /d "${this.workspace}"
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

      await fs.writeFile(path.join(this.workspace, 'altamedica-quick-start.bat'), quickStart);
      this.log('Script de inicio rápido creado', 'success');
      
      return true;
      
    } catch (error) {
      this.log(`Error creando accesos directos: ${error.message}`, 'error');
      return false;
    }
  }

  async generateSetupReport() {
    console.log(`\n${colors.magenta}
╔══════════════════════════════════════════════════════════════╗
║                    📊 REPORTE DE INSTALACIÓN                ║
╚══════════════════════════════════════════════════════════════╝
${colors.reset}`);

    console.log(`${colors.green}✅ INSTALACIONES EXITOSAS (${this.success.length}):${colors.reset}`);
    this.success.forEach(item => console.log(`   ✓ ${item}`));

    if (this.warnings.length > 0) {
      console.log(`\n${colors.yellow}⚠️ ADVERTENCIAS (${this.warnings.length}):${colors.reset}`);
      this.warnings.forEach(item => console.log(`   ⚠ ${item}`));
    }

    if (this.errors.length > 0) {
      console.log(`\n${colors.red}❌ ERRORES (${this.errors.length}):${colors.reset}`);
      this.errors.forEach(item => console.log(`   ✗ ${item}`));
    }

    console.log(`\n${colors.cyan}🎯 PRÓXIMOS PASOS:${colors.reset}`);
    console.log('1. Reiniciar Claude Desktop');
    console.log('2. Verificar herramientas MCP en Claude');
    console.log('3. Probar comando: -m status');
    console.log('4. Configurar Cursor: source cursor-integration.sh');
    console.log('5. Configurar Warp: source warp-integration.sh');

    console.log(`\n${colors.blue}📚 DOCUMENTACIÓN:${colors.reset}`);
    console.log('- GUIA-COMPLETA-MULTI-ENTORNO.md');
    console.log('- GUIA-COMANDO-M.md');
    console.log('- mejoras-recomendadas.md');

    console.log(`\n${colors.green}🏥 ALTAMEDICA SETUP COMPLETADO${colors.reset}`);
  }

  async runFullSetup() {
    await this.showBanner();
    
    this.log('Iniciando instalación completa de Altamedica...', 'info');
    
    // 1. Verificar prerrequisitos
    const prereqsOk = await this.verifyPrerequisites();
    if (!prereqsOk) {
      this.log('Prerrequisitos no cumplidos. Instalación abortada.', 'error');
      return false;
    }
    
    // 2. Instalar comando del sistema
    await this.installSystemCommand();
    
    // 3. Configurar Claude Desktop
    await this.setupClaudeDesktop();
    
    // 4. Probar comandos
    await this.testSystemCommands();
    
    // 5. Crear accesos directos
    await this.createDesktopShortcuts();
    
    // 6. Mostrar reporte
    await this.generateSetupReport();
    
    return this.errors.length === 0;
  }
}

// 🎯 FUNCIÓN PRINCIPAL
async function main() {
  const setup = new AltamedicaSetup();
  
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
🏥 Altamedica Setup - Instalación Automática

USO:
  node altamedica-setup.js [opciones]

OPCIONES:
  --help, -h     Mostrar esta ayuda
  --verify       Solo verificar prerrequisitos
  --claude       Solo configurar Claude Desktop
  --system       Solo instalar comando de sistema

EJEMPLOS:
  node altamedica-setup.js                # Instalación completa
  node altamedica-setup.js --verify       # Solo verificar
  node altamedica-setup.js --claude       # Solo Claude
`);
    return;
  }
  
  if (args.includes('--verify')) {
    await setup.verifyPrerequisites();
    return;
  }
  
  if (args.includes('--claude')) {
    await setup.setupClaudeDesktop();
    return;
  }
  
  if (args.includes('--system')) {
    await setup.installSystemCommand();
    return;
  }
  
  // Instalación completa por defecto
  const success = await setup.runFullSetup();
  process.exit(success ? 0 : 1);
}

// 🚀 EJECUTAR
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { AltamedicaSetup };
