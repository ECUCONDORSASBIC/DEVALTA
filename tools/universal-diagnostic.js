#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class UniversalDiagnostic {
  constructor() {
    this.workspaceRoot = path.resolve(__dirname, '..');
    this.results = {
      timestamp: new Date().toISOString(),
      system: {},
      mcp: {},
      files: {},
      dependencies: {},
      errors: [],
      recommendations: []
    };
  }

  async runDiagnostic() {
    console.log('🏥 ALTAMEDICADEV - Diagnóstico Universal del Sistema');
    console.log('=' .repeat(60));
    
    try {
      await this.checkSystemInfo();
      await this.checkMCPStatus();
      await this.checkProjectStructure();
      await this.checkDependencies();
      await this.generateReport();
    } catch (error) {
      this.results.errors.push(`Diagnostic error: ${error.message}`);
      console.error('❌ Error en diagnóstico:', error.message);
    }
  }

  async checkSystemInfo() {
    console.log('🖥️ Verificando información del sistema...');
    
    try {
      this.results.system = {
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version,
        workingDirectory: process.cwd(),
        workspaceRoot: this.workspaceRoot,
        timestamp: new Date().toISOString()
      };

      // Check PowerShell version
      try {
        const psVersion = execSync('pwsh --version', { encoding: 'utf8', timeout: 5000 });
        this.results.system.powershellVersion = psVersion.trim();
      } catch (e) {
        this.results.system.powershellVersion = 'Not available';
      }

      console.log('✅ Sistema: ' + this.results.system.platform + ' ' + this.results.system.arch);
      console.log('✅ Node.js: ' + this.results.system.nodeVersion);
    } catch (error) {
      this.results.errors.push(`System check failed: ${error.message}`);
    }
  }

  async checkMCPStatus() {
    console.log('🤖 Verificando estado de MCPs...');
    
    try {
      // Check if MCP processes are running
      const nodeProcesses = execSync('tasklist /FI "IMAGENAME eq node.exe" /FO CSV', { encoding: 'utf8' });
      const processes = nodeProcesses.split('\n').filter(line => line.includes('node.exe'));
      
      this.results.mcp.runningProcesses = processes.length - 1; // Subtract header
      
      // Check MCP configuration
      const mcpConfigPath = path.join(this.workspaceRoot, 'mcp-config.json');
      if (fs.existsSync(mcpConfigPath)) {
        const mcpConfig = JSON.parse(fs.readFileSync(mcpConfigPath, 'utf8'));
        this.results.mcp.configuredServers = Object.keys(mcpConfig.mcpServers || {}).length;
        this.results.mcp.config = mcpConfig;
      }

      // Check protected MCP directory
      const protectedPath = path.join(this.workspaceRoot, 'mcp-protected');
      if (fs.existsSync(protectedPath)) {
        const serversPath = path.join(protectedPath, 'servers');
        if (fs.existsSync(serversPath)) {
          const servers = fs.readdirSync(serversPath).filter(f => f.endsWith('.js'));
          this.results.mcp.protectedServers = servers;
        }
      }

      console.log(`✅ MCPs ejecutándose: ${this.results.mcp.runningProcesses}`);
      console.log(`✅ MCPs configurados: ${this.results.mcp.configuredServers || 0}`);
      console.log(`✅ MCPs protegidos: ${this.results.mcp.protectedServers?.length || 0}`);
    } catch (error) {
      this.results.errors.push(`MCP check failed: ${error.message}`);
    }
  }

  async checkProjectStructure() {
    console.log('📁 Verificando estructura del proyecto...');
    
    try {
      const criticalPaths = [
        'package.json',
        'mcp-config.json',
        'mcp-protected',
        'tools',
        'scripts',
        'apps',
        'packages'
      ];

      this.results.files.critical = {};
      for (const criticalPath of criticalPaths) {
        const fullPath = path.join(this.workspaceRoot, criticalPath);
        this.results.files.critical[criticalPath] = fs.existsSync(fullPath);
      }

      // Count files in key directories
      this.results.files.counts = {};
      const dirs = ['apps', 'packages', 'tools', 'scripts'];
      for (const dir of dirs) {
        const dirPath = path.join(this.workspaceRoot, dir);
        if (fs.existsSync(dirPath)) {
          const files = this.countFilesRecursive(dirPath);
          this.results.files.counts[dir] = files;
        }
      }

      const existingPaths = Object.entries(this.results.files.critical)
        .filter(([_, exists]) => exists).length;
      
      console.log(`✅ Estructura: ${existingPaths}/${criticalPaths.length} rutas críticas encontradas`);
    } catch (error) {
      this.results.errors.push(`Structure check failed: ${error.message}`);
    }
  }

  countFilesRecursive(dirPath) {
    let count = 0;
    try {
      const items = fs.readdirSync(dirPath);
      for (const item of items) {
        const fullPath = path.join(dirPath, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          count += this.countFilesRecursive(fullPath);
        } else if (stat.isFile()) {
          count++;
        }
      }
    } catch (error) {
      // Skip directories we can't read
    }
    return count;
  }

  async checkDependencies() {
    console.log('📦 Verificando dependencias...');
    
    try {
      const packageJsonPath = path.join(this.workspaceRoot, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        this.results.dependencies = {
          dependencies: Object.keys(packageJson.dependencies || {}),
          devDependencies: Object.keys(packageJson.devDependencies || {}),
          scripts: Object.keys(packageJson.scripts || {})
        };
      }

      // Check if node_modules exists
      const nodeModulesPath = path.join(this.workspaceRoot, 'node_modules');
      this.results.dependencies.nodeModulesExists = fs.existsSync(nodeModulesPath);

      console.log(`✅ Dependencias: ${this.results.dependencies.dependencies?.length || 0} prod, ${this.results.dependencies.devDependencies?.length || 0} dev`);
    } catch (error) {
      this.results.errors.push(`Dependencies check failed: ${error.message}`);
    }
  }

  async generateReport() {
    console.log('\n📊 GENERANDO REPORTE DE DIAGNÓSTICO...');
    console.log('=' .repeat(60));

    // Generate recommendations
    this.generateRecommendations();

    // Display summary
    console.log('🎯 RESUMEN:');
    console.log(`- Errores encontrados: ${this.results.errors.length}`);
    console.log(`- MCPs ejecutándose: ${this.results.mcp.runningProcesses || 0}`);
    console.log(`- Archivos totales: ${Object.values(this.results.files.counts || {}).reduce((a, b) => a + b, 0)}`);
    
    if (this.results.errors.length > 0) {
      console.log('\n❌ ERRORES:');
      this.results.errors.forEach(error => console.log(`  - ${error}`));
    }

    if (this.results.recommendations.length > 0) {
      console.log('\n💡 RECOMENDACIONES:');
      this.results.recommendations.forEach(rec => console.log(`  - ${rec}`));
    }

    // Save detailed report
    const reportPath = path.join(this.workspaceRoot, 'logs', `diagnostic-${Date.now()}.json`);
    const logsDir = path.dirname(reportPath);
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`\n💾 Reporte guardado en: ${reportPath}`);
  }

  generateRecommendations() {
    // MCP recommendations
    if (this.results.mcp.runningProcesses === 0) {
      this.results.recommendations.push('Iniciar MCPs usando el sistema de protección');
    }

    if (!this.results.files.critical['mcp-config.json']) {
      this.results.recommendations.push('Crear archivo mcp-config.json para integración con VS Code');
    }

    if (!this.results.dependencies.nodeModulesExists) {
      this.results.recommendations.push('Ejecutar "pnpm install" para instalar dependencias');
    }

    // Missing critical files
    const missingFiles = Object.entries(this.results.files.critical)
      .filter(([_, exists]) => !exists)
      .map(([file, _]) => file);
    
    if (missingFiles.length > 0) {
      this.results.recommendations.push(`Crear archivos faltantes: ${missingFiles.join(', ')}`);
    }
  }
}

// Execute diagnostic
const diagnostic = new UniversalDiagnostic();
diagnostic.runDiagnostic().catch(console.error);
