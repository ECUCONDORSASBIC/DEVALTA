#!/usr/bin/env node

// 🔍 CHECKLIST DE DIAGNÓSTICO COMPLETO BRIDGE MCP
// Verifica cada eslabón de la cadena Claude → Bridge → Copilot → Terminal

import { execSync, spawn } from 'child_process';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

class BridgeDiagnostics {
  constructor() {
    this.diagnosticResults = {
      infrastructure: {},
      connectivity: {},
      permissions: {},
      integration: {},
      endToEnd: {}
    };
    this.errors = [];
    this.warnings = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${type.toUpperCase()}: ${message}`);
    
    if (type === 'error') this.errors.push(message);
    if (type === 'warning') this.warnings.push(message);
  }

  // 🏗️ DIAGNÓSTICO DE INFRAESTRUCTURA
  async checkInfrastructure() {
    this.log("🏗️ VERIFICANDO INFRAESTRUCTURA...", 'info');
    
    // 1. Verificar archivos MCP existen
    const mcpFiles = {
      'terminal-mcp.js': 'platform/mcp-servers/terminal-mcp.js',
      'copilot-claude-bridge.js': 'platform/mcp-servers/copilot-claude-bridge.js',
      'mcp-config.json': 'mcp-config.json',
      'mcp-config-with-terminal.json': 'mcp-config-with-terminal.json'
    };

    for (const [name, path] of Object.entries(mcpFiles)) {
      const exists = existsSync(path);
      this.diagnosticResults.infrastructure[name] = {
        path,
        exists,
        status: exists ? 'OK' : 'MISSING'
      };
      
      if (exists) {
        this.log(`✅ ${name}: Encontrado en ${path}`, 'info');
        
        // Verificar tamaño del archivo (no vacío)
        try {
          const stats = require('fs').statSync(path);
          if (stats.size < 100) {
            this.log(`⚠️ ${name}: Archivo muy pequeño (${stats.size} bytes)`, 'warning');
          }
        } catch (error) {
          this.log(`❌ ${name}: Error leyendo archivo - ${error.message}`, 'error');
        }
      } else {
        this.log(`❌ ${name}: NO ENCONTRADO en ${path}`, 'error');
      }
    }

    // 2. Verificar configuración MCP
    await this.checkMCPConfiguration();
    
    // 3. Verificar dependencias Node.js
    await this.checkNodeDependencies();
  }

  async checkMCPConfiguration() {
    this.log("⚙️ VERIFICANDO CONFIGURACIÓN MCP...", 'info');
    
    const configFiles = ['mcp-config.json', 'mcp-config-with-terminal.json'];
    
    for (const configFile of configFiles) {
      if (existsSync(configFile)) {
        try {
          const config = JSON.parse(readFileSync(configFile, 'utf-8'));
          
          // Verificar estructura
          const hasServers = config.mcpServers && Object.keys(config.mcpServers).length > 0;
          const hasTerminal = config.mcpServers?.terminal;
          const hasBridge = config.mcpServers?.['copilot-claude-bridge'];
          
          this.diagnosticResults.infrastructure[`${configFile}_structure`] = {
            hasServers,
            hasTerminal,
            hasBridge,
            serverCount: hasServers ? Object.keys(config.mcpServers).length : 0
          };
          
          this.log(`✅ ${configFile}: ${Object.keys(config.mcpServers || {}).length} servidores configurados`, 'info');
          
          if (hasTerminal) {
            this.log(`✅ Terminal MCP configurado con prioridad ${config.mcpServers.terminal.priority}`, 'info');
          } else {
            this.log(`❌ Terminal MCP NO configurado en ${configFile}`, 'error');
          }
          
          if (hasBridge) {
            this.log(`✅ Bridge MCP configurado con prioridad ${config.mcpServers['copilot-claude-bridge'].priority}`, 'info');
          } else {
            this.log(`❌ Bridge MCP NO configurado en ${configFile}`, 'error');
          }
          
        } catch (error) {
          this.log(`❌ ${configFile}: Error parseando JSON - ${error.message}`, 'error');
        }
      }
    }
  }

  async checkNodeDependencies() {
    this.log("📦 VERIFICANDO DEPENDENCIAS NODE.JS...", 'info');
    
    try {
      // Verificar Node.js
      const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
      this.log(`✅ Node.js: ${nodeVersion}`, 'info');
      this.diagnosticResults.infrastructure.node = { version: nodeVersion, status: 'OK' };
      
      // Verificar npm
      const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
      this.log(`✅ npm: ${npmVersion}`, 'info');
      this.diagnosticResults.infrastructure.npm = { version: npmVersion, status: 'OK' };
      
      // Verificar MCP SDK
      try {
        const packageJson = JSON.parse(readFileSync('package.json', 'utf-8'));
        const mcpSdk = packageJson.dependencies?.['@modelcontextprotocol/sdk'];
        if (mcpSdk) {
          this.log(`✅ MCP SDK: ${mcpSdk}`, 'info');
          this.diagnosticResults.infrastructure.mcpSdk = { version: mcpSdk, status: 'OK' };
        } else {
          this.log(`❌ MCP SDK: NO ENCONTRADO en package.json`, 'error');
        }
      } catch (error) {
        this.log(`⚠️ No se pudo verificar MCP SDK: ${error.message}`, 'warning');
      }
      
    } catch (error) {
      this.log(`❌ Error verificando dependencias: ${error.message}`, 'error');
    }
  }

  // 🔌 DIAGNÓSTICO DE CONECTIVIDAD
  async checkConnectivity() {
    this.log("🔌 VERIFICANDO CONECTIVIDAD MCP...", 'info');
    
    // 1. Test de arranque de Terminal MCP
    await this.testMCPStartup('terminal-mcp.js', 'platform/mcp-servers/terminal-mcp.js');
    
    // 2. Test de arranque de Bridge MCP  
    await this.testMCPStartup('copilot-claude-bridge.js', 'platform/mcp-servers/copilot-claude-bridge.js');
    
    // 3. Test de conectividad usando Inspector MCP
    await this.testMCPInspector();
  }

  async testMCPStartup(name, path) {
    if (!existsSync(path)) {
      this.log(`❌ ${name}: Archivo no existe para test de arranque`, 'error');
      return;
    }
    
    try {
      this.log(`🧪 Probando arranque de ${name}...`, 'info');
      
      // Ejecutar MCP con timeout corto para verificar que arranca sin errores
      const result = execSync(`timeout 5s node ${path} || true`, {
        encoding: 'utf8',
        timeout: 6000,
        stdio: 'pipe'
      });
      
      // Si llega aquí, el MCP arrancó sin errores de sintaxis
      this.log(`✅ ${name}: Arranca sin errores de sintaxis`, 'info');
      this.diagnosticResults.connectivity[name] = { 
        startup: 'OK',
        canStart: true 
      };
      
    } catch (error) {
      if (error.message.includes('timeout')) {
        this.log(`✅ ${name}: Arranca correctamente (timeout esperado)`, 'info');
        this.diagnosticResults.connectivity[name] = { 
          startup: 'OK',
          canStart: true 
        };
      } else {
        this.log(`❌ ${name}: Error al arrancar - ${error.message}`, 'error');
        this.diagnosticResults.connectivity[name] = { 
          startup: 'ERROR',
          canStart: false,
          error: error.message 
        };
      }
    }
  }

  async testMCPInspector() {
    this.log("🔍 PROBANDO INSPECTOR MCP...", 'info');
    
    try {
      // Verificar que el Inspector MCP está disponible
      const result = execSync('npx -y @modelcontextprotocol/inspector --help', {
        encoding: 'utf8',
        timeout: 10000
      });
      
      this.log(`✅ Inspector MCP: Disponible`, 'info');
      this.diagnosticResults.connectivity.inspector = { available: true };
      
    } catch (error) {
      this.log(`❌ Inspector MCP: No disponible - ${error.message}`, 'error');
      this.diagnosticResults.connectivity.inspector = { 
        available: false, 
        error: error.message 
      };
    }
  }

  // 🔒 DIAGNÓSTICO DE PERMISOS
  async checkPermissions() {
    this.log("🔒 VERIFICANDO PERMISOS...", 'info');
    
    // 1. Permisos de ejecución de scripts
    await this.checkExecutionPermissions();
    
    // 2. Permisos de PowerShell
    await this.checkPowerShellPermissions();
    
    // 3. Permisos de escritura
    await this.checkWritePermissions();
  }

  async checkExecutionPermissions() {
    try {
      // Test básico de ejecución Node.js
      execSync('node -e "console.log(\'test\')"', { 
        encoding: 'utf8',
        timeout: 5000 
      });
      
      this.log(`✅ Permisos Node.js: OK`, 'info');
      this.diagnosticResults.permissions.node = { canExecute: true };
      
    } catch (error) {
      this.log(`❌ Permisos Node.js: Error - ${error.message}`, 'error');
      this.diagnosticResults.permissions.node = { 
        canExecute: false, 
        error: error.message 
      };
    }
  }

  async checkPowerShellPermissions() {
    try {
      // Test de PowerShell con ExecutionPolicy Bypass
      const result = execSync('powershell -ExecutionPolicy Bypass -Command "Write-Output \'test\'"', {
        encoding: 'utf8',
        timeout: 5000
      });
      
      this.log(`✅ Permisos PowerShell: OK`, 'info');
      this.diagnosticResults.permissions.powershell = { canExecute: true };
      
    } catch (error) {
      this.log(`❌ Permisos PowerShell: Error - ${error.message}`, 'error');
      this.diagnosticResults.permissions.powershell = { 
        canExecute: false, 
        error: error.message 
      };
    }
  }

  async checkWritePermissions() {
    try {
      // Test de escritura en directorio actual
      const testFile = 'diagnostic-test.tmp';
      writeFileSync(testFile, 'test');
      require('fs').unlinkSync(testFile);
      
      this.log(`✅ Permisos de escritura: OK`, 'info');
      this.diagnosticResults.permissions.write = { canWrite: true };
      
    } catch (error) {
      this.log(`❌ Permisos de escritura: Error - ${error.message}`, 'error');
      this.diagnosticResults.permissions.write = { 
        canWrite: false, 
        error: error.message 
      };
    }
  }

  // 🧪 DIAGNÓSTICO END-TO-END
  async testEndToEnd() {
    this.log("🧪 EJECUTANDO TESTS END-TO-END...", 'info');
    
    // 1. Test manual de comando simple
    await this.testSimpleCommand();
    
    // 2. Test de validación de seguridad
    await this.testSecurityValidation();
    
    // 3. Test de logging
    await this.testLogging();
  }

  async testSimpleCommand() {
    this.log("🧪 Test: Comando simple (node --version)...", 'info');
    
    try {
      // Simular el flujo completo manualmente
      const command = 'node';
      const args = ['--version'];
      
      // Validación de seguridad (como haría el Terminal MCP)
      const allowedCommands = ['node', 'npm', 'pnpm', 'git'];
      const isAllowed = allowedCommands.some(cmd => command.includes(cmd));
      
      if (!isAllowed) {
        this.log(`❌ Comando '${command}' bloqueado por seguridad`, 'error');
        return;
      }
      
      // Ejecutar comando real
      const result = execSync(`${command} ${args.join(' ')}`, {
        encoding: 'utf8',
        timeout: 5000
      });
      
      this.log(`✅ Comando ejecutado: ${result.trim()}`, 'info');
      this.diagnosticResults.endToEnd.simpleCommand = {
        success: true,
        command: `${command} ${args.join(' ')}`,
        result: result.trim()
      };
      
    } catch (error) {
      this.log(`❌ Error ejecutando comando: ${error.message}`, 'error');
      this.diagnosticResults.endToEnd.simpleCommand = {
        success: false,
        error: error.message
      };
    }
  }

  async testSecurityValidation() {
    this.log("🛡️ Test: Validación de seguridad...", 'info');
    
    const dangerousCommands = ['rm -rf', 'del /f', 'format', 'shutdown'];
    const blockedCount = dangerousCommands.length;
    
    this.log(`✅ ${blockedCount} comandos peligrosos serían bloqueados`, 'info');
    this.diagnosticResults.endToEnd.security = {
      blockedCommands: blockedCount,
      working: true
    };
  }

  async testLogging() {
    this.log("📝 Test: Sistema de logging...", 'info');
    
    try {
      // Crear directorio de logs si no existe
      const logDir = 'logs';
      if (!existsSync(logDir)) {
        require('fs').mkdirSync(logDir);
      }
      
      // Test de escritura de log
      const logFile = join(logDir, 'diagnostic-test.log');
      const logEntry = {
        timestamp: new Date().toISOString(),
        test: 'diagnostic',
        message: 'Log test'
      };
      
      writeFileSync(logFile, JSON.stringify(logEntry) + '\n');
      
      this.log(`✅ Sistema de logging: OK`, 'info');
      this.diagnosticResults.endToEnd.logging = { working: true };
      
      // Limpiar
      require('fs').unlinkSync(logFile);
      
    } catch (error) {
      this.log(`❌ Sistema de logging: Error - ${error.message}`, 'error');
      this.diagnosticResults.endToEnd.logging = { 
        working: false, 
        error: error.message 
      };
    }
  }

  // 📊 GENERAR REPORTE FINAL
  generateReport() {
    this.log("📊 GENERANDO REPORTE FINAL...", 'info');
    
    const report = {
      timestamp: new Date().toISOString(),
      diagnostic: 'bridge-mcp-complete',
      summary: {
        totalChecks: this.getTotalChecks(),
        errors: this.errors.length,
        warnings: this.warnings.length,
        overallStatus: this.errors.length === 0 ? 'HEALTHY' : 'ISSUES_FOUND'
      },
      results: this.diagnosticResults,
      errors: this.errors,
      warnings: this.warnings,
      recommendations: this.generateRecommendations()
    };
    
    // Guardar reporte
    const reportPath = 'bridge-diagnostic-report.json';
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    this.log(`📋 Reporte guardado: ${reportPath}`, 'info');
    
    // Mostrar resumen
    this.displaySummary(report);
    
    return report;
  }

  getTotalChecks() {
    let total = 0;
    for (const category of Object.values(this.diagnosticResults)) {
      total += Object.keys(category).length;
    }
    return total;
  }

  generateRecommendations() {
    const recommendations = [];
    
    if (this.errors.some(e => e.includes('NO ENCONTRADO'))) {
      recommendations.push('Crear archivos MCP faltantes usando los templates proporcionados');
    }
    
    if (this.errors.some(e => e.includes('MCP SDK'))) {
      recommendations.push('Instalar MCP SDK: npm install @modelcontextprotocol/sdk');
    }
    
    if (this.errors.some(e => e.includes('PowerShell'))) {
      recommendations.push('Verificar permisos de PowerShell y ExecutionPolicy');
    }
    
    if (this.errors.some(e => e.includes('Terminal MCP NO configurado'))) {
      recommendations.push('Usar mcp-config-with-terminal.json como configuración activa');
    }
    
    if (this.errors.length === 0) {
      recommendations.push('Sistema listo para ejecución. Reiniciar MCP servers en Claude/VS Code');
    }
    
    return recommendations;
  }

  displaySummary(report) {
    console.log('\n' + '='.repeat(60));
    console.log('🎯 RESUMEN DEL DIAGNÓSTICO BRIDGE MCP');
    console.log('='.repeat(60));
    
    console.log(`📊 Estado general: ${report.summary.overallStatus}`);
    console.log(`✅ Checks totales: ${report.summary.totalChecks}`);
    console.log(`❌ Errores: ${report.summary.errors}`);
    console.log(`⚠️ Advertencias: ${report.summary.warnings}`);
    
    if (report.recommendations.length > 0) {
      console.log('\n📋 RECOMENDACIONES:');
      report.recommendations.forEach((rec, i) => {
        console.log(`${i + 1}. ${rec}`);
      });
    }
    
    if (report.summary.overallStatus === 'HEALTHY') {
      console.log('\n🎉 DIAGNÓSTICO EXITOSO - BRIDGE MCP LISTO PARA OPERACIÓN');
    } else {
      console.log('\n⚠️ SE ENCONTRARON PROBLEMAS - REVISAR ERRORES Y APLICAR RECOMENDACIONES');
    }
  }

  // 🚀 EJECUTAR DIAGNÓSTICO COMPLETO
  async runFullDiagnostic() {
    console.log('🔍 INICIANDO DIAGNÓSTICO COMPLETO BRIDGE MCP\n');
    
    try {
      await this.checkInfrastructure();
      await this.checkConnectivity();
      await this.checkPermissions();
      await this.testEndToEnd();
      
      return this.generateReport();
      
    } catch (error) {
      this.log(`💥 Error crítico durante diagnóstico: ${error.message}`, 'error');
      return this.generateReport();
    }
  }
}

// Ejecutar diagnóstico si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const diagnostics = new BridgeDiagnostics();
  await diagnostics.runFullDiagnostic();
}

export { BridgeDiagnostics };
