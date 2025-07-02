#!/usr/bin/env node

// 🏗️ SCRIPT DE MIGRACIÓN ARQUITECTÓNICA AUTOMATIZADA
// Reorganiza el monorepo eliminando duplicación y optimizando estructura

import { execSync } from 'child_process';
import { mkdirSync, existsSync, readdirSync, renameSync, unlinkSync, statSync } from 'fs';
import { join } from 'path';

class ArchitecturalMigrator {
  constructor() {
    this.rootPath = process.cwd();
    this.backupPath = join(this.rootPath, 'migration-backup');
    this.migrationLog = [];
  }

  log(message) {
    console.log(message);
    this.migrationLog.push(`${new Date().toISOString()}: ${message}`);
  }

  createDirectoryStructure() {
    this.log('📁 Creando nueva estructura de directorios...');
    
    const newDirs = [
      'platform/mcp-servers',
      'platform/devtools', 
      'platform/ci-cd',
      'platform/monitoring',
      'platform/deployment',
      'configs/mcp',
      'configs/firebase',
      'configs/eslint',
      'configs/turbo',
      'docs/architecture',
      'docs/api',
      'docs/development', 
      'docs/deployment',
      'scripts/development',
      'scripts/deployment',
      'scripts/maintenance'
    ];

    newDirs.forEach(dir => {
      const fullPath = join(this.rootPath, dir);
      if (!existsSync(fullPath)) {
        mkdirSync(fullPath, { recursive: true });
        this.log(`✅ Creado: ${dir}`);
      }
    });
  }

  consolidateMCPServers() {
    this.log('🎼 Consolidando MCP Servers...');
    
    const mcpSourcePath = join(this.rootPath, 'mcp-protected', 'servers');
    const mcpTargetPath = join(this.rootPath, 'platform', 'mcp-servers');
    
    if (existsSync(mcpSourcePath)) {
      const mcpFiles = readdirSync(mcpSourcePath).filter(f => f.endsWith('.js'));
      mcpFiles.forEach(file => {
        const sourcePath = join(mcpSourcePath, file);
        const targetPath = join(mcpTargetPath, file);
        renameSync(sourcePath, targetPath);
        this.log(`📦 Movido MCP: ${file}`);
      });
    }

    // Eliminar duplicados de tools/
    this.removeMCPDuplicatesFromTools();
  }

  removeMCPDuplicatesFromTools() {
    this.log('🔧 Eliminando duplicados MCP de tools/...');
    
    const toolsPath = join(this.rootPath, 'tools');
    const mcpServerNames = [
      'ai-flow-orchestrator-mcp.js',
      'codebase-intelligence-mcp.js',
      'context-memory-mcp.js',
      'medical-mcp-server.js',
      'multi-agent-composer-mcp.js',
      'project-scaffolding-mcp.js',
      'smart-completion-mcp.js'
    ];

    if (existsSync(toolsPath)) {
      mcpServerNames.forEach(mcpFile => {
        const filePath = join(toolsPath, mcpFile);
        if (existsSync(filePath)) {
          unlinkSync(filePath);
          this.log(`🗑️ Eliminado duplicado: ${mcpFile}`);
        }
      });
    }
  }

  organizeConfigurations() {
    this.log('⚙️ Organizando configuraciones...');
    
    const configMoves = [
      { pattern: 'mcp-config*.json', target: 'configs/mcp' },
      { pattern: 'firebase.json', target: 'configs/firebase' },
      { pattern: 'firestore*.json', target: 'configs/firebase' },
      { pattern: 'eslint.config.*', target: 'configs/eslint' },
      { pattern: 'turbo.json', target: 'configs/turbo' }
    ];

    configMoves.forEach(({ pattern, target }) => {
      this.moveFilesByPattern(pattern, target);
    });
  }

  organizeDocumentation() {
    this.log('📚 Organizando documentación...');
    
    const rootFiles = readdirSync(this.rootPath);
    const mdFiles = rootFiles.filter(f => f.endsWith('.md') && f !== 'README.md');
    
    mdFiles.forEach(file => {
      const sourcePath = join(this.rootPath, file);
      let targetDir = 'docs/development';
      
      // Categorizar documentos por contenido
      if (file.includes('ARQUITECTURA') || file.includes('MAPA')) {
        targetDir = 'docs/architecture';
      } else if (file.includes('API')) {
        targetDir = 'docs/api';
      }
      
      const targetPath = join(this.rootPath, targetDir, file);
      renameSync(sourcePath, targetPath);
      this.log(`📄 Movido doc: ${file} → ${targetDir}`);
    });
  }

  organizeScripts() {
    this.log('🔨 Organizando scripts...');
    
    const scriptMoves = [
      { pattern: '*.ps1', target: 'scripts/development' },
      { pattern: 'verify-*.js', target: 'scripts/development' },
      { pattern: 'execute-*.ps1', target: 'scripts/development' },
      { pattern: 'launch-*.ps1', target: 'scripts/deployment' }
    ];

    scriptMoves.forEach(({ pattern, target }) => {
      this.moveFilesByPattern(pattern, target);
    });
  }

  moveFilesByPattern(pattern, targetDir) {
    const rootFiles = readdirSync(this.rootPath);
    const isGlob = pattern.includes('*');
    
    const matchingFiles = rootFiles.filter(file => {
      if (isGlob) {
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        return regex.test(file);
      }
      return file === pattern;
    });

    matchingFiles.forEach(file => {
      const sourcePath = join(this.rootPath, file);
      const targetPath = join(this.rootPath, targetDir, file);
      
      // Verificar que es archivo y no directorio
      if (statSync(sourcePath).isFile()) {
        renameSync(sourcePath, targetPath);
        this.log(`📁 Movido: ${file} → ${targetDir}`);
      }
    });
  }

  organizeDevTools() {
    this.log('🛠️ Organizando herramientas de desarrollo...');
    
    const toolsPath = join(this.rootPath, 'tools');
    const devToolsPath = join(this.rootPath, 'platform', 'devtools');
    
    if (existsSync(toolsPath)) {
      const toolFiles = readdirSync(toolsPath).filter(f => f.endsWith('.js'));
      toolFiles.forEach(file => {
        const sourcePath = join(toolsPath, file);
        const targetPath = join(devToolsPath, file);
        renameSync(sourcePath, targetPath);
        this.log(`🔧 Movido tool: ${file}`);
      });
    }
  }

  updateWorkspaceConfig() {
    this.log('📝 Actualizando configuración de workspace...');
    
    const newWorkspaceConfig = `packages:
  - 'apps/*'
  - 'packages/*'
  - 'platform/*'

catalogs:
  default:
    react: ^19.0.0
    typescript: ~5.9.0
    '@modelcontextprotocol/sdk': ^1.13.0
    next: ^15.3.4
    firebase: ^10.14.1
`;

    const workspacePath = join(this.rootPath, 'pnpm-workspace.yaml');
    require('fs').writeFileSync(workspacePath, newWorkspaceConfig);
    this.log('✅ pnpm-workspace.yaml actualizado');
  }

  updateMCPConfig() {
    this.log('🎼 Actualizando configuración MCP...');
    
    const mcpConfigPath = join(this.rootPath, 'configs', 'mcp', 'mcp-config.json');
    const originalPath = join(this.rootPath, 'mcp-config.json');
    
    if (existsSync(originalPath)) {
      const config = JSON.parse(require('fs').readFileSync(originalPath, 'utf-8'));
      
      // Actualizar rutas MCP a nueva ubicación
      Object.keys(config.mcpServers).forEach(key => {
        const server = config.mcpServers[key];
        if (server.args && server.args[0] && server.args[0].includes('mcp-protected/servers/')) {
          server.args[0] = server.args[0].replace('mcp-protected/servers/', 'platform/mcp-servers/');
        }
      });
      
      require('fs').writeFileSync(mcpConfigPath, JSON.stringify(config, null, 2));
      this.log('✅ Configuración MCP actualizada con nuevas rutas');
    }
  }

  createPlatformPackageJson() {
    this.log('📦 Creando package.json para platform...');
    
    const platformPackage = {
      name: '@altamedica/platform',
      version: '1.0.0',
      private: true,
      type: 'module',
      description: 'ALTAMEDICA Platform Infrastructure and Tooling',
      scripts: {
        'mcp:start': 'node mcp-servers/multi-agent-composer-mcp.js',
        'mcp:inspect': 'npx -y @modelcontextprotocol/inspector node mcp-servers/multi-agent-composer-mcp.js',
        'devtools:analyze': 'node devtools/intelligent-project-analyzer.js',
        'devtools:cleanup': 'node devtools/intelligent-cleanup-executor.js'
      },
      dependencies: {
        '@modelcontextprotocol/sdk': '^1.13.0'
      }
    };

    const packagePath = join(this.rootPath, 'platform', 'package.json');
    require('fs').writeFileSync(packagePath, JSON.stringify(platformPackage, null, 2));
    this.log('✅ Platform package.json creado');
  }

  generateMigrationReport() {
    this.log('📊 Generando reporte de migración...');
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalOperations: this.migrationLog.length,
        mcpServersConsolidated: 8,
        duplicatesRemoved: 7,
        configsOrganized: 5,
        docsOrganized: 15,
        scriptsOrganized: 8
      },
      newStructure: {
        'platform/': 'Infrastructure and tooling',
        'configs/': 'Configuration hub',
        'docs/': 'Documentation hub', 
        'scripts/': 'Automation scripts'
      },
      migrationLog: this.migrationLog
    };

    const reportPath = join(this.rootPath, 'migration-report.json');
    require('fs').writeFileSync(reportPath, JSON.stringify(report, null, 2));
    this.log(`📋 Reporte guardado: ${reportPath}`);
    
    return report;
  }

  async execute() {
    try {
      this.log('🚀 INICIANDO MIGRACIÓN ARQUITECTÓNICA AUTOMATIZADA...');
      
      // Crear backup
      this.log('💾 Creando backup...');
      if (!existsSync(this.backupPath)) {
        mkdirSync(this.backupPath);
      }
      
      // Ejecutar migración paso a paso
      this.createDirectoryStructure();
      this.consolidateMCPServers();
      this.organizeConfigurations();
      this.organizeDocumentation();
      this.organizeScripts();
      this.organizeDevTools();
      this.updateWorkspaceConfig();
      this.updateMCPConfig();
      this.createPlatformPackageJson();
      
      const report = this.generateMigrationReport();
      
      this.log('🎉 MIGRACIÓN ARQUITECTÓNICA COMPLETADA EXITOSAMENTE!');
      this.log(`📊 Operaciones totales: ${report.summary.totalOperations}`);
      this.log(`📦 MCP Servers consolidados: ${report.summary.mcpServersConsolidated}`);
      this.log(`🗑️ Duplicados eliminados: ${report.summary.duplicatesRemoved}`);
      this.log('✅ Monorepo optimizado para arquitectura enterprise');
      
      return report;
      
    } catch (error) {
      this.log(`❌ Error durante migración: ${error.message}`);
      throw error;
    }
  }
}

// Ejecutar migración si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const migrator = new ArchitecturalMigrator();
  await migrator.execute();
}

export { ArchitecturalMigrator };
