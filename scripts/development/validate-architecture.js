#!/usr/bin/env node

// 🔍 VALIDADOR DE ARQUITECTURA OPTIMIZADA
// Verifica que la migración se ejecutó correctamente y muestra métricas

import { existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

class ArchitectureValidator {
  constructor() {
    this.rootPath = process.cwd();
    this.results = {
      structure: {},
      consolidation: {},
      optimization: {},
      metrics: {}
    };
  }

  validateNewStructure() {
    console.log('📁 Validando nueva estructura...');
    
    const expectedStructure = {
      'platform/mcp-servers': 'MCP Servers consolidados',
      'platform/devtools': 'Herramientas de desarrollo',
      'platform/ci-cd': 'Scripts CI/CD',
      'platform/monitoring': 'Monitoreo y analytics',
      'configs/mcp': 'Configuraciones MCP',
      'configs/firebase': 'Configuraciones Firebase',
      'docs/architecture': 'Documentación de arquitectura',
      'docs/development': 'Guías de desarrollo',
      'scripts/development': 'Scripts de desarrollo',
      'scripts/deployment': 'Scripts de deployment'
    };

    Object.entries(expectedStructure).forEach(([path, description]) => {
      const fullPath = join(this.rootPath, path);
      const exists = existsSync(fullPath);
      const fileCount = exists ? readdirSync(fullPath).length : 0;
      
      this.results.structure[path] = {
        exists,
        description,
        fileCount,
        status: exists ? '✅' : '❌'
      };
      
      console.log(`${exists ? '✅' : '❌'} ${path} (${fileCount} archivos)`);
    });
  }

  validateMCPConsolidation() {
    console.log('\n🎼 Validando consolidación MCP...');
    
    const mcpServersPath = join(this.rootPath, 'platform', 'mcp-servers');
    const toolsPath = join(this.rootPath, 'tools');
    
    let mcpInPlatform = 0;
    let mcpInTools = 0;
    
    if (existsSync(mcpServersPath)) {
      mcpInPlatform = readdirSync(mcpServersPath).filter(f => f.endsWith('.js')).length;
    }
    
    if (existsSync(toolsPath)) {
      const mcpFiles = ['ai-flow-orchestrator-mcp.js', 'multi-agent-composer-mcp.js', 
                       'codebase-intelligence-mcp.js', 'smart-completion-mcp.js'];
      mcpInTools = readdirSync(toolsPath).filter(f => mcpFiles.includes(f)).length;
    }
    
    this.results.consolidation = {
      mcpInPlatform,
      mcpInTools,
      duplicatesRemoved: mcpInTools === 0,
      consolidationSuccess: mcpInPlatform > 0 && mcpInTools === 0
    };
    
    console.log(`✅ MCP en platform/: ${mcpInPlatform}`);
    console.log(`${mcpInTools === 0 ? '✅' : '❌'} Duplicados en tools/: ${mcpInTools}`);
    console.log(`${this.results.consolidation.consolidationSuccess ? '✅' : '❌'} Consolidación exitosa`);
  }

  validateRootCleanup() {
    console.log('\n🧹 Validando limpieza del root...');
    
    const rootFiles = readdirSync(this.rootPath).filter(f => {
      const fullPath = join(this.rootPath, f);
      return statSync(fullPath).isFile();
    });
    
    const expectedRootFiles = [
      'package.json', 'pnpm-lock.yaml', 'pnpm-workspace.yaml', 'turbo.json',
      'next.config.js', 'tsconfig.json', 'README.md', '.gitignore',
      'migrate-architecture.js', 'optimize-architecture.ps1', 'ARQUITECTURA_OPTIMIZADA_ANALISIS.md'
    ];
    
    const unexpectedFiles = rootFiles.filter(f => !expectedRootFiles.includes(f) && 
                                               !f.startsWith('.') && !f.includes('optimized'));
    
    this.results.optimization = {
      totalRootFiles: rootFiles.length,
      unexpectedFiles: unexpectedFiles.length,
      cleanupSuccess: unexpectedFiles.length < 10 // Permitir algunos archivos adicionales
    };
    
    console.log(`📊 Archivos en root: ${rootFiles.length}`);
    console.log(`${this.results.optimization.cleanupSuccess ? '✅' : '⚠️'} Archivos inesperados: ${unexpectedFiles.length}`);
    
    if (unexpectedFiles.length > 0 && unexpectedFiles.length < 20) {
      console.log('📋 Archivos que podrían moverse:', unexpectedFiles.slice(0, 5).join(', '));
    }
  }

  calculateMetrics() {
    console.log('\n📊 Calculando métricas de optimización...');
    
    // Calcular mejoras estructurales
    const structureScore = Object.values(this.results.structure)
                                 .filter(s => s.exists).length / 
                           Object.keys(this.results.structure).length * 100;
    
    const consolidationScore = this.results.consolidation.consolidationSuccess ? 100 : 0;
    const cleanupScore = this.results.optimization.cleanupSuccess ? 100 : 
                        Math.max(0, 100 - this.results.optimization.unexpectedFiles * 5);
    
    const overallScore = (structureScore + consolidationScore + cleanupScore) / 3;
    
    this.results.metrics = {
      structureScore: Math.round(structureScore),
      consolidationScore,
      cleanupScore: Math.round(cleanupScore),
      overallScore: Math.round(overallScore),
      grade: overallScore >= 90 ? 'A' : overallScore >= 80 ? 'B' : 
             overallScore >= 70 ? 'C' : overallScore >= 60 ? 'D' : 'F'
    };
    
    console.log(`📈 Estructura: ${this.results.metrics.structureScore}%`);
    console.log(`🎼 Consolidación MCP: ${this.results.metrics.consolidationScore}%`);
    console.log(`🧹 Limpieza Root: ${this.results.metrics.cleanupScore}%`);
    console.log(`🏆 Puntuación General: ${this.results.metrics.overallScore}% (${this.results.metrics.grade})`);
  }

  generateReport() {
    console.log('\n📋 Generando reporte de validación...');
    
    const report = {
      timestamp: new Date().toISOString(),
      validation: 'architecture-optimization',
      ...this.results,
      recommendations: this.generateRecommendations()
    };
    
    const reportPath = join(this.rootPath, 'architecture-validation-report.json');
    require('fs').writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`✅ Reporte guardado: ${reportPath}`);
    return report;
  }

  generateRecommendations() {
    const recommendations = [];
    
    if (this.results.metrics.structureScore < 100) {
      recommendations.push('Completar la creación de directorios faltantes en la nueva estructura');
    }
    
    if (!this.results.consolidation.consolidationSuccess) {
      recommendations.push('Ejecutar consolidación MCP para eliminar duplicados');
    }
    
    if (this.results.optimization.unexpectedFiles > 15) {
      recommendations.push('Continuar moviendo archivos del root a sus ubicaciones organizadas');
    }
    
    if (this.results.metrics.overallScore < 90) {
      recommendations.push('Ejecutar script de migración completo: node migrate-architecture.js');
    }
    
    return recommendations;
  }

  async validate() {
    console.log('🔍 INICIANDO VALIDACIÓN DE ARQUITECTURA OPTIMIZADA\n');
    
    this.validateNewStructure();
    this.validateMCPConsolidation();
    this.validateRootCleanup();
    this.calculateMetrics();
    
    const report = this.generateReport();
    
    console.log('\n🎯 RESUMEN DE VALIDACIÓN:');
    console.log(`${this.results.metrics.grade === 'A' ? '🎉' : '📈'} Optimización: ${this.results.metrics.overallScore}% (Grado ${this.results.metrics.grade})`);
    
    if (this.results.metrics.overallScore >= 90) {
      console.log('✅ ARQUITECTURA OPTIMIZADA EXITOSAMENTE');
      console.log('🚀 Monorepo listo para desarrollo enterprise');
    } else {
      console.log('⚠️ OPTIMIZACIÓN PARCIAL - Revisar recomendaciones');
      report.recommendations.forEach(rec => console.log(`  • ${rec}`));
    }
    
    return report;
  }
}

// Ejecutar validación si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new ArchitectureValidator();
  await validator.validate();
}

export { ArchitectureValidator };
