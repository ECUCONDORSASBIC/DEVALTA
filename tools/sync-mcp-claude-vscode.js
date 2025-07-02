#!/usr/bin/env node
/**
 * 🔄 SINCRONIZADOR MCP CLAUDE-VSCODE ALTAMEDICADEV
 * Sincroniza servidores MCP entre Claude Desktop y VS Code automáticamente
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

class MCPSynchronizer {
  constructor() {
    this.claudeConfigPath = 'C:\\Users\\Eduardo\\AppData\\Roaming\\Claude\\claude_desktop_config.json';
    this.vscodeConfigPath = 'C:\\Users\\Eduardo\\AppData\\Roaming\\Code - Insiders\\User\\settings.json';
    this.altamedicadevPath = 'C:\\Users\\Eduardo\\Documents\\altamedicadev';
  }

  async synchronizeMCP() {
    log('cyan', '🔄 INICIANDO SINCRONIZACIÓN MCP CLAUDE-VSCODE');
    log('cyan', '='.repeat(55));
    
    try {
      // 1. Leer configuración de Claude Desktop
      const claudeConfig = this.readClaudeConfig();
      log('green', '✅ Configuración Claude Desktop leída');
      
      // 2. Leer configuración de VS Code
      const vscodeConfig = this.readVSCodeConfig();
      log('green', '✅ Configuración VS Code leída');
      
      // 3. Convertir servidores MCP de Claude a formato VS Code
      const convertedServers = this.convertClaudeToVSCode(claudeConfig.mcpServers);
      log('green', '✅ Servidores MCP convertidos a formato VS Code');
      
      // 4. Actualizar configuración VS Code
      this.updateVSCodeConfig(vscodeConfig, convertedServers);
      log('green', '✅ Configuración VS Code actualizada');
      
      // 5. Crear script de inicio automático
      this.createAutoStartScript();
      log('green', '✅ Script de inicio automático creado');
      
      console.log('');
      log('green', '🎯 SINCRONIZACIÓN COMPLETADA EXITOSAMENTE');
      
    } catch (error) {
      log('red', `❌ Error en sincronización: ${error.message}`);
      throw error;
    }
  }

  readClaudeConfig() {
    if (!existsSync(this.claudeConfigPath)) {
      throw new Error('Archivo de configuración Claude Desktop no encontrado');
    }
    return JSON.parse(readFileSync(this.claudeConfigPath, 'utf8'));
  }

  readVSCodeConfig() {
    if (!existsSync(this.vscodeConfigPath)) {
      throw new Error('Archivo de configuración VS Code no encontrado');
    }
    const content = readFileSync(this.vscodeConfigPath, 'utf8');
    return JSON.parse(content);
  }

  convertClaudeToVSCode(claudeServers) {
    const vscodeServers = {};
    
    for (const [name, config] of Object.entries(claudeServers)) {
      // Convertir configuración de Claude Desktop a formato VS Code MCP
      vscodeServers[name] = {
        command: config.command,
        args: config.args,
        env: config.env || {}
      };
      
      log('blue', `   🔄 Convertido: ${name}`);
    }
    
    return vscodeServers;
  }

  updateVSCodeConfig(vscodeConfig, convertedServers) {
    // Asegurar que existe la sección MCP
    if (!vscodeConfig.mcp) {
      vscodeConfig.mcp = {};
    }
    if (!vscodeConfig.mcp.servers) {
      vscodeConfig.mcp.servers = {};
    }
    
    // Actualizar servidores MCP sincronizados
    Object.assign(vscodeConfig.mcp.servers, convertedServers);
    
    // Escribir configuración actualizada
    const jsonContent = JSON.stringify(vscodeConfig, null, 2);
    writeFileSync(this.vscodeConfigPath, jsonContent, 'utf8');
  }

  createAutoStartScript() {
    const scriptContent = `
Write-Host "🚀 INICIANDO SERVIDORES MCP AUTOMÁTICAMENTE"

# Verificar que VS Code esté ejecutándose
$vscodeProcess = Get-Process "Code - Insiders" -ErrorAction SilentlyContinue
if ($vscodeProcess) {
    Write-Host "✅ VS Code detectado - Iniciando servidores MCP..."
    
    # Los servidores MCP se iniciarán automáticamente con VS Code
    # gracias a la configuración sincronizada
    
    Write-Host "✅ Servidores MCP disponibles en VS Code"
} else {
    Write-Host "⚠️  VS Code no está ejecutándose"
}
`;

    const scriptPath = join(this.altamedicadevPath, 'scripts', 'sync-mcp-auto.ps1');
    writeFileSync(scriptPath, scriptContent.trim(), 'utf8');
    
    log('blue', `   📄 Script creado: ${scriptPath}`);
  }
}

// Ejecutar sincronización
async function main() {
  try {
    const synchronizer = new MCPSynchronizer();
    await synchronizer.synchronizeMCP();
    
    console.log('');
    log('cyan', '📋 PRÓXIMOS PASOS:');
    log('yellow', '   1. Reinicia VS Code para aplicar la configuración MCP sincronizada');
    log('yellow', '   2. Los servidores MCP de Claude Desktop ahora funcionarán en VS Code');
    log('yellow', '   3. Configuración automática completada');
    
    console.log('');
    log('green', '✅ INTEGRACIÓN MCP CLAUDE-VSCODE COMPLETADA');
    
  } catch (error) {
    log('red', `❌ Error: ${error.message}`);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { MCPSynchronizer };
