#!/usr/bin/env node
/**
 * @fileoverview Script para analizar uso de hooks en tiempo real
 * @description Herramienta para detectar hooks no utilizados y validar migraciones
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class HooksUsageAnalyzer {
  constructor() {
    this.rootDir = path.resolve(__dirname, '..');
    this.hooksPackageDir = path.join(this.rootDir, 'packages', 'hooks', 'src');
    this.appsDir = path.join(this.rootDir, 'apps');
    this.results = {
      totalHooks: 0,
      usedHooks: new Set(),
      unusedHooks: new Set(),
      duplicatedHooks: new Map(),
      dependencyIssues: [],
      migrationOpportunities: []
    };
  }

  /**
   * Ejecuta análisis completo
   */
  async analyze() {
    console.log('🔍 Iniciando análisis de uso de hooks...\n');
    
    await this.inventoryAvailableHooks();
    await this.analyzeAppsUsage();
    await this.findDuplicatedHooks();
    await this.checkDependencies();
    await this.generateReport();
  }

  /**
   * Inventario de hooks disponibles en el paquete central
   */
  async inventoryAvailableHooks() {
    console.log('📦 Analizando hooks disponibles...');
    
    const hooksFiles = this.findFiles(this.hooksPackageDir, /\.(ts|tsx)$/);
    
    for (const file of hooksFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const hooks = this.extractHookExports(content);
      
      hooks.forEach(hook => {
        this.results.totalHooks++;
        this.results.unusedHooks.add({
          name: hook,
          file: path.relative(this.rootDir, file),
          category: this.categorizeHook(file, hook)
        });
      });
    }
    
    console.log(`   ✅ Encontrados ${this.results.totalHooks} hooks disponibles`);
  }

  /**
   * Analiza uso en todas las aplicaciones
   */
  async analyzeAppsUsage() {
    console.log('🏗️  Analizando uso en aplicaciones...');
    
    const apps = fs.readdirSync(this.appsDir).filter(dir => 
      fs.statSync(path.join(this.appsDir, dir)).isDirectory()
    );

    for (const app of apps) {
      await this.analyzeAppUsage(app);
    }
    
    console.log(`   ✅ ${this.results.usedHooks.size} hooks en uso encontrados`);
  }

  /**
   * Analiza uso en una aplicación específica
   */
  async analyzeAppUsage(appName) {
    const appDir = path.join(this.appsDir, appName, 'src');
    if (!fs.existsSync(appDir)) return;

    const files = this.findFiles(appDir, /\.(ts|tsx|js|jsx)$/);
    
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      
      // Buscar imports directos de @altamedica/hooks
      const directImports = content.match(
        /import\s+\{([^}]+)\}\s+from\s+['"]@altamedica\/hooks['"]/g
      );
      
      if (directImports) {
        directImports.forEach(importStatement => {
          const hooks = importStatement
            .match(/\{([^}]+)\}/)[1]
            .split(',')
            .map(h => h.trim())
            .filter(h => h.startsWith('use'));
          
          hooks.forEach(hook => {
            this.results.usedHooks.add({
              name: hook,
              app: appName,
              file: path.relative(this.rootDir, file),
              type: 'direct'
            });
            
            // Remover de unusedHooks
            this.results.unusedHooks = new Set([...this.results.unusedHooks]
              .filter(unused => unused.name !== hook));
          });
        });
      }

      // Buscar re-exports que apunten a @altamedica/hooks
      const reExports = content.match(
        /export\s+\{([^}]+)\}\s+from\s+['"]@altamedica\/hooks['"]/g
      );
      
      if (reExports) {
        reExports.forEach(exportStatement => {
          const hooks = exportStatement
            .match(/\{([^}]+)\}/)[1]
            .split(',')
            .map(h => h.trim());
          
          hooks.forEach(hook => {
            this.results.usedHooks.add({
              name: hook,
              app: appName,
              file: path.relative(this.rootDir, file),
              type: 'reexport'
            });
          });
        });
      }
    }
  }

  /**
   * Encuentra hooks duplicados implementados localmente
   */
  async findDuplicatedHooks() {
    console.log('🔄 Buscando hooks duplicados...');
    
    const apps = fs.readdirSync(this.appsDir);
    
    for (const app of apps) {
      const hooksDir = path.join(this.appsDir, app, 'src', 'hooks');
      if (!fs.existsSync(hooksDir)) continue;
      
      const files = this.findFiles(hooksDir, /\.(ts|tsx)$/);
      
      for (const file of files) {
        const content = fs.readFileSync(file, 'utf8');
        const localHooks = this.extractHookDefinitions(content);
        
        localHooks.forEach(hook => {
          const availableHooks = [...this.results.unusedHooks, ...this.results.usedHooks];
          const centralHook = availableHooks.find(h => h.name === hook.name);
          
          if (centralHook) {
            if (!this.results.duplicatedHooks.has(hook.name)) {
              this.results.duplicatedHooks.set(hook.name, []);
            }
            
            this.results.duplicatedHooks.get(hook.name).push({
              app,
              file: path.relative(this.rootDir, file),
              lines: hook.lines
            });
          }
        });
      }
    }
    
    console.log(`   ✅ ${this.results.duplicatedHooks.size} hooks duplicados encontrados`);
  }

  /**
   * Verifica dependencias faltantes
   */
  async checkDependencies() {
    console.log('📋 Verificando dependencias...');
    
    const apps = fs.readdirSync(this.appsDir);
    
    for (const app of apps) {
      const packageJsonPath = path.join(this.appsDir, app, 'package.json');
      if (!fs.existsSync(packageJsonPath)) continue;
      
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const hasHooksDependency = packageJson.dependencies && 
        packageJson.dependencies['@altamedica/hooks'];
      
      // Verificar si la app tiene código que sugiere que debería usar hooks
      const srcDir = path.join(this.appsDir, app, 'src');
      if (!fs.existsSync(srcDir)) continue;
      
      const hasReactFiles = this.findFiles(srcDir, /\.(ts|tsx)$/).length > 0;
      const usesHooks = this.findFiles(srcDir, /\.(ts|tsx)$/)
        .some(file => {
          const content = fs.readFileSync(file, 'utf8');
          return /import.*use\w+.*from.*react/i.test(content);
        });
      
      if (hasReactFiles && usesHooks && !hasHooksDependency) {
        this.results.dependencyIssues.push({
          app,
          issue: 'missing_hooks_dependency',
          description: 'App usa React hooks pero no tiene @altamedica/hooks como dependencia'
        });
      }
    }
    
    console.log(`   ✅ ${this.results.dependencyIssues.length} problemas de dependencias encontrados`);
  }

  /**
   * Genera reporte final
   */
  async generateReport() {
    const usagePercentage = (this.results.usedHooks.size / this.results.totalHooks * 100).toFixed(1);
    const unusedCount = this.results.totalHooks - this.results.usedHooks.size;
    
    const report = `
# 📊 REPORTE DE ANÁLISIS DE HOOKS

## 📈 Métricas Generales
- **Total hooks disponibles**: ${this.results.totalHooks}
- **Hooks utilizados**: ${this.results.usedHooks.size}
- **Hooks no utilizados**: ${unusedCount}
- **Porcentaje de uso**: ${usagePercentage}%
- **Hooks duplicados**: ${this.results.duplicatedHooks.size}

## 🎯 Hooks Utilizados
${[...this.results.usedHooks].map(hook => 
  `- **${hook.name}** (${hook.app}) - ${hook.type}`
).join('\n')}

## ❌ Hooks No Utilizados (${unusedCount})
${[...this.results.unusedHooks].map(hook => 
  `- **${hook.name}** [${hook.category}] - ${hook.file}`
).join('\n')}

## 🔄 Hooks Duplicados (${this.results.duplicatedHooks.size})
${Array.from(this.results.duplicatedHooks.entries()).map(([hookName, duplicates]) =>
  `### ${hookName}\n${duplicates.map(d => `  - ${d.app}: ${d.file}`).join('\n')}`
).join('\n\n')}

## ⚠️ Problemas de Dependencias
${this.results.dependencyIssues.map(issue =>
  `- **${issue.app}**: ${issue.description}`
).join('\n')}

## 💡 Recomendaciones de Acción
1. **Eliminar hooks no utilizados** para reducir bundle size
2. **Migrar hooks duplicados** hacia el paquete central
3. **Agregar dependencias faltantes** en apps que necesitan hooks
4. **Implementar testing automatizado** para prevenir regresiones

---
*Generado el ${new Date().toISOString()}*
`;

    const reportPath = path.join(this.rootDir, 'hooks-usage-report.md');
    fs.writeFileSync(reportPath, report);
    
    console.log('\n' + '='.repeat(60));
    console.log(`📊 RESUMEN: ${usagePercentage}% de hooks utilizados (${this.results.usedHooks.size}/${this.results.totalHooks})`);
    console.log(`🔄 ${this.results.duplicatedHooks.size} hooks con implementaciones duplicadas`);
    console.log(`⚠️  ${this.results.dependencyIssues.length} problemas de dependencias`);
    console.log('='.repeat(60));
    console.log(`\n📄 Reporte completo guardado en: ${reportPath}`);
  }

  /**
   * Utilidades de ayuda
   */
  findFiles(dir, pattern) {
    if (!fs.existsSync(dir)) return [];
    
    const files = [];
    const entries = fs.readdirSync(dir);
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        files.push(...this.findFiles(fullPath, pattern));
      } else if (pattern.test(entry)) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  extractHookExports(content) {
    const hooks = [];
    
    // Buscar exports de funciones que empiecen con 'use'
    const exportMatches = content.match(/export\s+(?:function\s+)?(use\w+)/g) || [];
    exportMatches.forEach(match => {
      const hook = match.match(/use\w+/)[0];
      hooks.push(hook);
    });
    
    // Buscar re-exports
    const reExportMatches = content.match(/export\s+\{\s*([^}]*)\s*\}/g) || [];
    reExportMatches.forEach(match => {
      const exports = match.match(/\{([^}]*)\}/)[1]
        .split(',')
        .map(e => e.trim())
        .filter(e => e.startsWith('use'));
      hooks.push(...exports);
    });
    
    return [...new Set(hooks)];
  }

  extractHookDefinitions(content) {
    const hooks = [];
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (/(?:export\s+)?(?:function\s+)?(use\w+)/.test(line)) {
        const match = line.match(/(use\w+)/);
        if (match) {
          hooks.push({
            name: match[1],
            lines: i + 1
          });
        }
      }
    }
    
    return hooks;
  }

  categorizeHook(filePath, hookName) {
    if (filePath.includes('/auth/')) return 'auth';
    if (filePath.includes('/api/')) return 'api';
    if (filePath.includes('/ui/')) return 'ui';
    if (filePath.includes('/medical/')) return 'medical';
    if (filePath.includes('/utils/')) return 'utils';
    if (filePath.includes('/performance/')) return 'performance';
    if (filePath.includes('/realtime/')) return 'realtime';
    return 'other';
  }
}

// Ejecutar análisis si se llama directamente
if (require.main === module) {
  const analyzer = new HooksUsageAnalyzer();
  analyzer.analyze().catch(console.error);
}

module.exports = HooksUsageAnalyzer;