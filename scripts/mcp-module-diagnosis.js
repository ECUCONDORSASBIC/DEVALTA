#!/usr/bin/env node
// MODULE TYPE: ESM (ECMAScript Modules)
// 🔍 DIAGNÓSTICO INTELIGENTE DE MÓDULOS MCP
// Script independiente para diagnóstico de módulos específicos

import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class MCPModuleDiagnosis {
  constructor() {
    this.results = {
      module: null,
      area: null,
      timestamp: new Date().toISOString(),
      diagnostics: {},
      recommendations: [],
      autoFixes: []
    };
    this.errors = [];
    this.warnings = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️';
    console.log(`[${timestamp}] ${prefix} ${message}`);
    
    if (type === 'error') this.errors.push(message);
    if (type === 'warning') this.warnings.push(message);
  }

  parseArguments() {
    const args = process.argv.slice(2);
    const options = {
      diagnose: false,
      module: null,
      area: null,
      autoFix: false,
      report: null
    };

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      
      if (arg === '--diagnose') {
        options.diagnose = true;
      } else if (arg === '--module' && i + 1 < args.length) {
        options.module = args[++i];
      } else if (arg === '--area' && i + 1 < args.length) {
        options.area = args[++i];
      } else if (arg === '--auto-fix') {
        options.autoFix = true;
      } else if (arg === '--report' && i + 1 < args.length) {
        options.report = args[++i];
      } else if (arg.startsWith('--module=')) {
        options.module = arg.split('=')[1];
      } else if (arg.startsWith('--area=')) {
        options.area = arg.split('=')[1];
      } else if (arg.startsWith('--report=')) {
        options.report = arg.split('=')[1];
      }
    }

    return options;
  }

  async diagnoseModule(moduleName, area = null) {
    this.log(`🔍 DIAGNOSTICANDO MÓDULO: ${moduleName}${area ? ` (Área: ${area})` : ''}`, 'info');
    
    this.results.module = moduleName;
    this.results.area = area;

    // 1. Verificar existencia del módulo
    await this.checkModuleExistence(moduleName);
    
    // 2. Verificar estructura del módulo
    await this.checkModuleStructure(moduleName);
    
    // 3. Verificar dependencias
    await this.checkModuleDependencies(moduleName);
    
    // 4. Verificar configuración
    await this.checkModuleConfiguration(moduleName);
    
    // 5. Verificar área específica si se especifica
    if (area) {
      await this.checkSpecificArea(moduleName, area);
    }
    
    // 6. Verificar integración con MCP
    await this.checkMCPIntegration(moduleName);
    
    // 7. Generar recomendaciones
    this.generateRecommendations();
  }

  async checkModuleExistence(moduleName) {
    this.log(`📁 Verificando existencia del módulo ${moduleName}...`, 'info');
    
    const modulePath = join(__dirname, '..', 'apps', moduleName);
    const exists = existsSync(modulePath);
    
    this.results.diagnostics.existence = {
      path: modulePath,
      exists,
      status: exists ? 'OK' : 'MISSING'
    };
    
    if (exists) {
      this.log(`✅ Módulo ${moduleName} encontrado en ${modulePath}`, 'info');
    } else {
      this.log(`❌ Módulo ${moduleName} NO ENCONTRADO en ${modulePath}`, 'error');
      this.results.recommendations.push(`Crear el módulo ${moduleName} en apps/${moduleName}`);
    }
  }

  async checkModuleStructure(moduleName) {
    this.log(`🏗️ Verificando estructura del módulo ${moduleName}...`, 'info');
    
    const modulePath = join(__dirname, '..', 'apps', moduleName);
    if (!existsSync(modulePath)) return;
    
    const expectedStructure = {
      'package.json': 'Configuración del proyecto',
      'next.config.js': 'Configuración de Next.js',
      'src/': 'Código fuente',
      'src/app/': 'App Router de Next.js',
      'src/components/': 'Componentes React'
    };
    
    this.results.diagnostics.structure = {};
    
    for (const [item, description] of Object.entries(expectedStructure)) {
      const itemPath = join(modulePath, item);
      const exists = existsSync(itemPath);
      
      this.results.diagnostics.structure[item] = {
        path: itemPath,
        exists,
        description,
        status: exists ? 'OK' : 'MISSING'
      };
      
      if (exists) {
        this.log(`✅ ${item}: ${description}`, 'info');
      } else {
        this.log(`❌ ${item}: ${description} - NO ENCONTRADO`, 'error');
        this.results.recommendations.push(`Crear ${item} en ${moduleName}`);
      }
    }
  }

  async checkModuleDependencies(moduleName) {
    this.log(`📦 Verificando dependencias del módulo ${moduleName}...`, 'info');
    
    const packageJsonPath = join(__dirname, '..', 'apps', moduleName, 'package.json');
    if (!existsSync(packageJsonPath)) return;
    
    try {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
      
      this.results.diagnostics.dependencies = {
        name: packageJson.name,
        version: packageJson.version,
        dependencies: packageJson.dependencies || {},
        devDependencies: packageJson.devDependencies || {},
        scripts: packageJson.scripts || {}
      };
      
      this.log(`✅ Package.json válido: ${packageJson.name}@${packageJson.version}`, 'info');
      
      // Verificar scripts esenciales
      const essentialScripts = ['dev', 'build', 'start'];
      for (const script of essentialScripts) {
        if (!packageJson.scripts?.[script]) {
          this.log(`⚠️ Script '${script}' no encontrado en package.json`, 'warning');
          this.results.recommendations.push(`Agregar script '${script}' al package.json de ${moduleName}`);
        }
      }
      
    } catch (error) {
      this.log(`❌ Error leyendo package.json: ${error.message}`, 'error');
      this.results.diagnostics.dependencies = { error: error.message };
    }
  }

  async checkModuleConfiguration(moduleName) {
    this.log(`⚙️ Verificando configuración del módulo ${moduleName}...`, 'info');
    
    const configFiles = [
      'next.config.js',
      'tailwind.config.js',
      'postcss.config.js',
      'tsconfig.json'
    ];
    
    this.results.diagnostics.configuration = {};
    
    for (const configFile of configFiles) {
      const configPath = join(__dirname, '..', 'apps', moduleName, configFile);
      const exists = existsSync(configPath);
      
      this.results.diagnostics.configuration[configFile] = {
        path: configPath,
        exists,
        status: exists ? 'OK' : 'MISSING'
      };
      
      if (exists) {
        this.log(`✅ ${configFile}: Configuración encontrada`, 'info');
      } else {
        this.log(`❌ ${configFile}: NO ENCONTRADO`, 'error');
        this.results.recommendations.push(`Crear ${configFile} para ${moduleName}`);
      }
    }
  }

  async checkSpecificArea(moduleName, area) {
    this.log(`🎯 Verificando área específica: ${area}`, 'info');
    
    const modulePath = join(__dirname, '..', 'apps', moduleName);
    const areaPath = join(modulePath, 'src', area);
    
    this.results.diagnostics.area = {
      name: area,
      path: areaPath,
      exists: existsSync(areaPath),
      files: []
    };
    
    if (existsSync(areaPath)) {
      this.log(`✅ Área ${area} encontrada en ${areaPath}`, 'info');
      
      // Listar archivos en el área
      try {
        const files = readFileSync(areaPath, 'utf-8').split('\n').filter(f => f.trim());
        this.results.diagnostics.area.files = files;
        this.log(`📄 Archivos en ${area}: ${files.length}`, 'info');
      } catch (error) {
        this.log(`⚠️ No se pudieron listar archivos en ${area}: ${error.message}`, 'warning');
      }
    } else {
      this.log(`❌ Área ${area} NO ENCONTRADA en ${areaPath}`, 'error');
      this.results.recommendations.push(`Crear directorio ${area} en ${moduleName}/src/`);
    }
  }

  async checkMCPIntegration(moduleName) {
    this.log(`🔗 Verificando integración MCP del módulo ${moduleName}...`, 'info');
    
    const mcpConfigPath = join(__dirname, '..', 'configs', 'mcp', 'mcp-config.json');
    const exists = existsSync(mcpConfigPath);
    
    this.results.diagnostics.mcpIntegration = {
      configExists: exists,
      moduleConfigured: false
    };
    
    if (exists) {
      try {
        const mcpConfig = JSON.parse(readFileSync(mcpConfigPath, 'utf-8'));
        const hasModule = mcpConfig.mcpServers && Object.keys(mcpConfig.mcpServers).includes(moduleName);
        
        this.results.diagnostics.mcpIntegration.moduleConfigured = hasModule;
        
        if (hasModule) {
          this.log(`✅ Módulo ${moduleName} configurado en MCP`, 'info');
        } else {
          this.log(`❌ Módulo ${moduleName} NO configurado en MCP`, 'error');
          this.results.recommendations.push(`Agregar configuración MCP para ${moduleName}`);
        }
      } catch (error) {
        this.log(`❌ Error leyendo configuración MCP: ${error.message}`, 'error');
      }
    } else {
      this.log(`❌ Configuración MCP no encontrada`, 'error');
      this.results.recommendations.push('Crear configuración MCP en configs/mcp/mcp-config.json');
    }
  }

  generateRecommendations() {
    this.log(`💡 Generando recomendaciones...`, 'info');
    
    // Recomendaciones basadas en errores encontrados
    if (this.errors.length > 0) {
      this.results.recommendations.push(`Resolver ${this.errors.length} errores críticos encontrados`);
    }
    
    if (this.warnings.length > 0) {
      this.results.recommendations.push(`Revisar ${this.warnings.length} advertencias`);
    }
    
    // Recomendaciones específicas por área
    if (this.results.area === 'api') {
      this.results.recommendations.push('Verificar endpoints de API y documentación');
      this.results.recommendations.push('Revisar middleware de autenticación');
      this.results.recommendations.push('Validar esquemas de datos');
    }
  }

  async applyAutoFixes() {
    if (!this.results.diagnostics.existence?.exists) {
      this.log(`🔧 Creando módulo ${this.results.module}...`, 'info');
      
      const modulePath = join(__dirname, '..', 'apps', this.results.module);
      mkdirSync(modulePath, { recursive: true });
      
      // Crear package.json básico
      const packageJson = {
        name: this.results.module,
        version: "0.1.0",
        private: true,
        scripts: {
          dev: "next dev",
          build: "next build",
          start: "next start",
          lint: "next lint"
        },
        dependencies: {
          "next": "^14.0.0",
          "react": "^18.0.0",
          "react-dom": "^18.0.0"
        },
        devDependencies: {
          "@types/node": "^20.0.0",
          "@types/react": "^18.0.0",
          "@types/react-dom": "^18.0.0",
          "typescript": "^5.0.0"
        }
      };
      
      writeFileSync(join(modulePath, 'package.json'), JSON.stringify(packageJson, null, 2));
      this.log(`✅ Package.json creado para ${this.results.module}`, 'info');
      
      this.results.autoFixes.push(`Módulo ${this.results.module} creado con estructura básica`);
    }
  }

  generateReport() {
    const report = {
      summary: {
        module: this.results.module,
        area: this.results.area,
        timestamp: this.results.timestamp,
        totalErrors: this.errors.length,
        totalWarnings: this.warnings.length,
        totalRecommendations: this.results.recommendations.length,
        autoFixesApplied: this.results.autoFixes.length
      },
      diagnostics: this.results.diagnostics,
      recommendations: this.results.recommendations,
      autoFixes: this.results.autoFixes,
      errors: this.errors,
      warnings: this.warnings
    };
    
    return report;
  }

  async saveReport(reportPath) {
    if (!reportPath) return;
    
    try {
      const reportDir = dirname(reportPath);
      mkdirSync(reportDir, { recursive: true });
      
      const report = this.generateReport();
      writeFileSync(reportPath, JSON.stringify(report, null, 2));
      
      this.log(`📄 Reporte guardado en ${reportPath}`, 'info');
    } catch (error) {
      this.log(`❌ Error guardando reporte: ${error.message}`, 'error');
    }
  }

  displaySummary() {
    console.log('\n' + '='.repeat(60));
    console.log(`🔍 DIAGNÓSTICO COMPLETADO: ${this.results.module}`);
    console.log('='.repeat(60));
    
    console.log(`📊 RESUMEN:`);
    console.log(`   Módulo: ${this.results.module}`);
    console.log(`   Área: ${this.results.area || 'Todas'}`);
    console.log(`   Errores: ${this.errors.length}`);
    console.log(`   Advertencias: ${this.warnings.length}`);
    console.log(`   Recomendaciones: ${this.results.recommendations.length}`);
    console.log(`   Auto-fixes aplicados: ${this.results.autoFixes.length}`);
    
    if (this.results.recommendations.length > 0) {
      console.log(`\n💡 RECOMENDACIONES:`);
      this.results.recommendations.forEach((rec, index) => {
        console.log(`   ${index + 1}. ${rec}`);
      });
    }
    
    if (this.results.autoFixes.length > 0) {
      console.log(`\n🔧 AUTO-FIXES APLICADOS:`);
      this.results.autoFixes.forEach((fix, index) => {
        console.log(`   ${index + 1}. ${fix}`);
      });
    }
    
    console.log('\n' + '='.repeat(60));
  }

  async run() {
    const options = this.parseArguments();
    
    if (!options.diagnose) {
      this.log('❌ Opción --diagnose requerida', 'error');
      this.showUsage();
      return;
    }
    
    if (!options.module) {
      this.log('❌ Opción --module requerida', 'error');
      this.showUsage();
      return;
    }
    
    try {
      await this.diagnoseModule(options.module, options.area);
      
      if (options.autoFix) {
        await this.applyAutoFixes();
      }
      
      if (options.report) {
        await this.saveReport(options.report);
      }
      
      this.displaySummary();
      
    } catch (error) {
      this.log(`💥 Error durante el diagnóstico: ${error.message}`, 'error');
      process.exit(1);
    }
  }

  showUsage() {
    console.log(`
🔍 USO: node mcp-module-diagnosis.js [OPCIONES]

OPCIONES:
  --diagnose                    Ejecutar diagnóstico
  --module <nombre>            Nombre del módulo a diagnosticar
  --area <área>               Área específica (opcional)
  --auto-fix                   Aplicar correcciones automáticas
  --report <ruta>             Guardar reporte en archivo JSON

EJEMPLOS:
  node mcp-module-diagnosis.js --diagnose --module=patients
  node mcp-module-diagnosis.js --diagnose --module=patients --area=api
  node mcp-module-diagnosis.js --diagnose --module=patients --area=api --auto-fix --report=./logs/diagnosis.json
    `);
  }
}

// 🎯 PUNTO DE ENTRADA
async function main() {
  const diagnosis = new MCPModuleDiagnosis();
  await diagnosis.run();
}

// Ejecutar solo si es el módulo principal
if (fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch(console.error);
}

export { MCPModuleDiagnosis }; 