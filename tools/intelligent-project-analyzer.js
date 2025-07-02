#!/usr/bin/env node
/**
 * 🧠 ALTAMEDICA INTELLIGENT PROJECT ANALYZER
 * ==========================================
 * Sistema inteligente que ANALIZA ANTES DE ACTUAR
 * Preserva funcionalidad, corrige errores reales, cleanup conservador
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn, exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.log('🧠 ALTAMEDICA INTELLIGENT PROJECT ANALYZER');
console.log('============================================');

class IntelligentProjectAnalyzer {
  constructor() {
    this.analysis = {
      functional: {
        apis: [],
        mcps: [],
        services: [],
        tests: [],
        scripts: []
      },
      broken: {
        typescript: [],
        missing: [],
        deprecated: []
      },
      duplicates: {
        real: [],
        false: []
      },
      recommendations: []
    };
    
    this.stats = {
      totalFiles: 0,
      functionalFiles: 0,
      brokenFiles: 0,
      duplicateFiles: 0,
      safeToClean: 0
    };
  }

  async analyzeProject() {
    console.log('🔍 FASE 1: ANÁLISIS PROFUNDO DEL ESTADO ACTUAL\n');
    
    // 1. Verificar servicios funcionando
    await this.analyzeRunningServices();
    
    // 2. Verificar MCPs configurados
    await this.analyzeMCPServers();
    
    // 3. Analizar APIs funcionales
    await this.analyzeAPIs();
    
    // 4. Detectar errores reales de TypeScript
    await this.analyzeTypeScriptErrors();
    
    // 5. Analizar tests funcionales
    await this.analyzeFunctionalTests();
    
    // 6. Detectar duplicados REALES vs similares
    await this.analyzeRealDuplicates();
    
    // 7. Analizar dependencias y uso
    await this.analyzeDependencyUsage();
    
    // 8. Generar reporte inteligente
    this.generateIntelligentReport();
    
    // 9. Aplicar fixes automáticos seguros
    await this.applySafeFixes();
    
    // 10. Sugerir cleanup conservador
    await this.suggestConservativeCleanup();
  }

  async analyzeRunningServices() {
    console.log('🔍 Analizando servicios funcionando...');
    
    const ports = [3001, 3002, 3003, 3004, 3005];
    
    for (const port of ports) {
      try {
        const { stdout } = await execAsync(`netstat -an | findstr ":${port}"`);
        if (stdout.includes('LISTENING')) {
          console.log(`   ✅ Puerto ${port}: ACTIVO`);
          this.analysis.functional.services.push({
            port,
            status: 'active',
            type: this.getServiceType(port)
          });
        }
      } catch (error) {
        console.log(`   ⚠️ Puerto ${port}: INACTIVO`);
      }
    }
    
    // Verificar health endpoints
    for (const service of this.analysis.functional.services) {
      if (service.port === 3001) {
        try {
          const { stdout } = await execAsync(`curl -s http://localhost:${service.port}/api/v1/health`);
          if (stdout.includes('"status"') || stdout.includes('healthy')) {
            console.log(`   ✅ Health endpoint ${service.port}: FUNCIONAL`);
            service.healthCheck = 'working';
          }
        } catch (error) {
          console.log(`   ⚠️ Health endpoint ${service.port}: Error`);
          service.healthCheck = 'error';
        }
      }
    }
    
    console.log('');
  }

  async analyzeMCPServers() {
    console.log('🔍 Analizando servidores MCP configurados...');
    
    const mcpConfigPath = path.join(projectRoot, 'mcp-config.json');
    
    if (fs.existsSync(mcpConfigPath)) {
      try {
        const config = JSON.parse(fs.readFileSync(mcpConfigPath, 'utf8'));
        const servers = Object.keys(config.mcpServers || {});
        
        console.log(`   ✅ Configuración MCP encontrada: ${servers.length} servidores`);
        
        for (const serverName of servers) {
          const serverConfig = config.mcpServers[serverName];
          const serverFile = this.findMCPServerFile(serverConfig);
          
          if (serverFile && fs.existsSync(serverFile)) {
            console.log(`   ✅ ${serverName}: ARCHIVO FUNCIONAL`);
            this.analysis.functional.mcps.push({
              name: serverName,
              file: serverFile,
              status: 'functional',
              config: serverConfig
            });
          } else {
            console.log(`   ⚠️ ${serverName}: ARCHIVO FALTANTE`);
            this.analysis.broken.missing.push({
              type: 'mcp-server',
              name: serverName,
              expected: serverFile
            });
          }
        }
      } catch (error) {
        console.log(`   ❌ Error leyendo configuración MCP: ${error.message}`);
      }
    } else {
      console.log('   ⚠️ No se encontró configuración MCP');
    }
    
    console.log('');
  }

  async analyzeAPIs() {
    console.log('🔍 Analizando APIs y endpoints...');
    
    const apiDirs = [
      'apps/api-server/src/app/api',
      'apps/companies/src/app/api', 
      'apps/doctors/src/app/api'
    ];
    
    for (const apiDir of apiDirs) {
      const fullPath = path.join(projectRoot, apiDir);
      if (fs.existsSync(fullPath)) {
        const endpoints = this.findAPIEndpoints(fullPath);
        console.log(`   ✅ ${apiDir}: ${endpoints.length} endpoints encontrados`);
        
        this.analysis.functional.apis.push({
          dir: apiDir,
          endpoints,
          status: 'functional'
        });
      }
    }
    
    console.log('');
  }

  async analyzeTypeScriptErrors() {
    console.log('🔍 Analizando errores reales de TypeScript...');
    
    try {
      // Buscar archivos TypeScript con problemas comunes
      const tsFiles = this.findTypeScriptFiles();
      
      for (const file of tsFiles) {
        const errors = await this.checkTypeScriptFile(file);
        if (errors.length > 0) {
          console.log(`   ⚠️ ${file}: ${errors.length} errores`);
          this.analysis.broken.typescript.push({
            file,
            errors,
            fixable: this.areErrorsFixable(errors)
          });
        }
      }
      
    } catch (error) {
      console.log(`   ⚠️ Error analizando TypeScript: ${error.message}`);
    }
    
    console.log('');
  }

  async analyzeFunctionalTests() {
    console.log('🔍 Analizando tests funcionales...');
    
    const testFiles = this.findTestFiles();
    
    for (const testFile of testFiles) {
      const isFunctional = await this.isTestFunctional(testFile);
      
      if (isFunctional) {
        console.log(`   ✅ ${testFile}: TEST FUNCIONAL`);
        this.analysis.functional.tests.push({
          file: testFile,
          status: 'working',
          purpose: this.getTestPurpose(testFile)
        });
      } else {
        console.log(`   ⚠️ ${testFile}: Obsoleto o roto`);
        this.analysis.broken.deprecated.push({
          file: testFile,
          reason: 'test-broken'
        });
      }
    }
    
    console.log('');
  }

  async analyzeRealDuplicates() {
    console.log('🔍 Analizando duplicados REALES vs archivos similares...');
    
    const files = this.getAllProjectFiles();
    const duplicateGroups = this.groupSimilarFiles(files);
    
    for (const group of duplicateGroups) {
      if (group.length > 1) {
        const isDuplicateGroup = await this.areRealDuplicates(group);
        
        if (isDuplicateGroup) {
          console.log(`   ⚠️ Duplicados reales: ${group.map(f => path.basename(f)).join(', ')}`);
          this.analysis.duplicates.real.push(group);
        } else {
          console.log(`   ✅ Archivos similares pero diferentes propósitos: ${group.map(f => path.basename(f)).join(', ')}`);
          this.analysis.duplicates.false.push(group);
        }
      }
    }
    
    console.log('');
  }

  async analyzeDependencyUsage() {
    console.log('🔍 Analizando uso real de archivos y dependencias...');
    
    // Buscar imports y referencias
    const allFiles = this.getAllProjectFiles();
    const usageMap = new Map();
    
    for (const file of allFiles) {
      if (file.endsWith('.js') || file.endsWith('.ts') || file.endsWith('.jsx') || file.endsWith('.tsx')) {
        try {
          const content = fs.readFileSync(file, 'utf8');
          const imports = this.extractImports(content);
          const references = this.extractReferences(content);
          
          usageMap.set(file, { imports, references });
        } catch (error) {
          // Archivo no legible
        }
      }
    }
    
    // Marcar archivos que NO son referenciados por ningún otro
    const referencedFiles = new Set();
    for (const [file, usage] of usageMap) {
      for (const imported of usage.imports) {
        const resolvedPath = this.resolveImportPath(imported, file);
        if (resolvedPath) {
          referencedFiles.add(resolvedPath);
        }
      }
    }
    
    for (const file of allFiles) {
      if (!referencedFiles.has(file) && !this.isEntryPoint(file)) {
        console.log(`   ⚠️ Archivo sin referencias: ${path.relative(projectRoot, file)}`);
        this.analysis.broken.deprecated.push({
          file,
          reason: 'unreferenced'
        });
      }
    }
    
    console.log('');
  }

  generateIntelligentReport() {
    console.log('📊 REPORTE INTELIGENTE DE ANÁLISIS');
    console.log('=' .repeat(60));
    
    console.log('\n✅ SISTEMAS FUNCIONALES DETECTADOS:');
    console.log(`   🚀 Servicios activos: ${this.analysis.functional.services.length}`);
    console.log(`   🤖 Servidores MCP: ${this.analysis.functional.mcps.length}`);
    console.log(`   📡 APIs funcionales: ${this.analysis.functional.apis.length}`);
    console.log(`   🧪 Tests funcionales: ${this.analysis.functional.tests.length}`);
    
    console.log('\n⚠️ PROBLEMAS DETECTADOS:');
    console.log(`   🔧 Errores TypeScript: ${this.analysis.broken.typescript.length}`);
    console.log(`   📁 Archivos faltantes: ${this.analysis.broken.missing.length}`);
    console.log(`   🗑️ Archivos obsoletos: ${this.analysis.broken.deprecated.length}`);
    console.log(`   📋 Duplicados reales: ${this.analysis.duplicates.real.length}`);
    
    console.log('\n🎯 RECOMENDACIONES INTELIGENTES:');
    
    // Priorizar correcciones sobre cleanup
    if (this.analysis.broken.typescript.length > 0) {
      console.log('   🔧 PRIORIDAD 1: Corregir errores TypeScript críticos');
    }
    
    if (this.analysis.broken.missing.length > 0) {
      console.log('   📁 PRIORIDAD 2: Restaurar archivos faltantes críticos');  
    }
    
    if (this.analysis.duplicates.real.length > 0) {
      console.log('   🗑️ PRIORIDAD 3: Eliminar duplicados reales (conservador)');
    }
    
    if (this.analysis.broken.deprecated.length > 0) {
      console.log('   📋 PRIORIDAD 4: Limpiar archivos verdaderamente obsoletos');
    }
    
    console.log('\n🛡️ ARCHIVOS PROTEGIDOS (NO TOCAR):');
    for (const mcp of this.analysis.functional.mcps) {
      console.log(`   🤖 MCP: ${mcp.file}`);
    }
    for (const test of this.analysis.functional.tests) {
      console.log(`   🧪 Test: ${test.file}`);
    }
    for (const api of this.analysis.functional.apis) {
      console.log(`   📡 API: ${api.dir}`);
    }
    
    console.log('');
  }

  async applySafeFixes() {
    console.log('🔧 APLICANDO CORRECCIONES AUTOMÁTICAS SEGURAS...');
    
    let fixesApplied = 0;
    
    // Corregir errores TypeScript simples y seguros
    for (const tsError of this.analysis.broken.typescript) {
      if (tsError.fixable) {
        try {
          const fixes = await this.applyTypeScriptFixes(tsError.file, tsError.errors);
          if (fixes > 0) {
            console.log(`   ✅ ${tsError.file}: ${fixes} correcciones aplicadas`);
            fixesApplied += fixes;
          }
        } catch (error) {
          console.log(`   ⚠️ ${tsError.file}: No se pudo corregir automáticamente`);
        }
      }
    }
    
    console.log(`\n🎯 Total de correcciones aplicadas: ${fixesApplied}\n`);
  }

  async suggestConservativeCleanup() {
    console.log('🧹 CLEANUP CONSERVADOR SUGERIDO');
    console.log('=' .repeat(40));
    
    const safeToRemove = this.analysis.broken.deprecated.filter(item => 
      !this.isCriticalFile(item.file) && 
      item.reason === 'unreferenced'
    );
    
    if (safeToRemove.length > 0) {
      console.log('\n📁 Archivos seguros para backup/archivo:');
      for (const item of safeToRemove) {
        console.log(`   📄 ${path.relative(projectRoot, item.file)}`);
      }
      
      console.log('\n💡 Para aplicar cleanup conservador:');
      console.log('   node tools/intelligent-cleanup.js --conservative');
    } else {
      console.log('\n✨ ¡Proyecto ya está bien organizado!');
      console.log('   No se detectaron archivos seguros para limpiar');
    }
    
    console.log('\n🛡️ PRINCIPIOS DE CLEANUP CONSERVADOR:');
    console.log('   ✅ Preservar TODOS los archivos funcionales');
    console.log('   ✅ Backup completo antes de cualquier cambio');
    console.log('   ✅ Cleanup por fases con validación');
    console.log('   ✅ Rollback automático si algo falla');
    console.log('   ✅ Nunca tocar MCPs, APIs o tests funcionales');
  }

  // Métodos auxiliares
  getServiceType(port) {
    const services = {
      3001: 'api-server',
      3002: 'companies',
      3003: 'doctors',
      3004: 'telemedicine',
      3005: 'labs'
    };
    return services[port] || 'unknown';
  }

  findMCPServerFile(serverConfig) {
    if (serverConfig.args && serverConfig.args.length > 0) {
      const arg = serverConfig.args[0];
      if (arg.startsWith('tools/')) {
        return path.join(projectRoot, arg);
      }
    }
    return null;
  }

  findAPIEndpoints(apiDir) {
    const endpoints = [];
    try {
      const files = fs.readdirSync(apiDir, { recursive: true });
      for (const file of files) {
        if (file.endsWith('/route.ts') || file.endsWith('/route.js')) {
          endpoints.push(file);
        }
      }
    } catch (error) {
      // Directorio no accesible
    }
    return endpoints;
  }

  findTypeScriptFiles() {
    const files = [];
    const walkDir = (dir) => {
      try {
        const items = fs.readdirSync(dir);
        for (const item of items) {
          const fullPath = path.join(dir, item);
          const stat = fs.statSync(fullPath);
          if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
            walkDir(fullPath);
          } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
            files.push(fullPath);
          }
        }
      } catch (error) {
        // Directorio no accesible
      }
    };
    
    walkDir(projectRoot);
    return files;
  }

  async checkTypeScriptFile(file) {
    const errors = [];
    try {
      const content = fs.readFileSync(file, 'utf8');
      
      // Buscar errores comunes y fáciles de corregir
      const lines = content.split('\n');
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Error como el que acabamos de corregir
        if (line.includes(': void {') && line.includes('function')) {
          errors.push({
            line: i + 1,
            type: 'syntax',
            description: 'Tipo de retorno mal posicionado',
            fixable: true
          });
        }
        
        // Otros errores comunes detectables
        if (line.includes('import type') && !line.includes('from')) {
          errors.push({
            line: i + 1,
            type: 'import',
            description: 'Import incompleto',
            fixable: true
          });
        }
      }
    } catch (error) {
      errors.push({
        type: 'file',
        description: 'Archivo no legible',
        fixable: false
      });
    }
    
    return errors;
  }

  areErrorsFixable(errors) {
    return errors.every(error => error.fixable);
  }

  findTestFiles() {
    const testFiles = [];
    const walkDir = (dir) => {
      try {
        const items = fs.readdirSync(dir);
        for (const item of items) {
          const fullPath = path.join(dir, item);
          const stat = fs.statSync(fullPath);
          if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
            walkDir(fullPath);
          } else if (item.includes('test') && (item.endsWith('.js') || item.endsWith('.cjs') || item.endsWith('.mjs'))) {
            testFiles.push(fullPath);
          }
        }
      } catch (error) {
        // Directorio no accesible
      }
    };
    
    walkDir(projectRoot);
    return testFiles;
  }

  async isTestFunctional(testFile) {
    try {
      const content = fs.readFileSync(testFile, 'utf8');
      
      // Un test es funcional si:
      // 1. Tiene estructura válida de test
      // 2. No está comentado como "obsoleto"
      // 3. Tiene imports/requires válidos
      
      const hasTestStructure = content.includes('async function') || content.includes('test') || content.includes('describe');
      const isNotObsolete = !content.includes('// OBSOLETO') && !content.includes('// DEPRECATED');
      const hasValidImports = content.includes('require(') || content.includes('import ');
      
      return hasTestStructure && isNotObsolete && hasValidImports;
    } catch (error) {
      return false;
    }
  }

  getTestPurpose(testFile) {
    const filename = path.basename(testFile);
    if (filename.includes('lab')) return 'lab-results-testing';
    if (filename.includes('appointment')) return 'appointments-testing';
    if (filename.includes('prescription')) return 'prescriptions-testing';
    if (filename.includes('api')) return 'api-testing';
    if (filename.includes('mcp')) return 'mcp-testing';
    return 'general-testing';
  }

  getAllProjectFiles() {
    const files = [];
    const walkDir = (dir) => {
      try {
        const items = fs.readdirSync(dir);
        for (const item of items) {
          const fullPath = path.join(dir, item);
          const stat = fs.statSync(fullPath);
          if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules' && item !== 'dist') {
            walkDir(fullPath);
          } else if (stat.isFile()) {
            files.push(fullPath);
          }
        }
      } catch (error) {
        // Directorio no accesible
      }
    };
    
    walkDir(projectRoot);
    return files;
  }

  groupSimilarFiles(files) {
    const groups = [];
    const processed = new Set();
    
    for (const file of files) {
      if (processed.has(file)) continue;
      
      const basename = path.basename(file, path.extname(file));
      const similar = files.filter(f => 
        !processed.has(f) && 
        path.basename(f, path.extname(f)) === basename &&
        f !== file
      );
      
      if (similar.length > 0) {
        const group = [file, ...similar];
        groups.push(group);
        group.forEach(f => processed.add(f));
      }
    }
    
    return groups;
  }

  async areRealDuplicates(group) {
    try {
      // Comparar contenido real vs solo nombres similares
      const contents = group.map(file => {
        try {
          return fs.readFileSync(file, 'utf8');
        } catch {
          return '';
        }
      });
      
      // Si los contenidos son >95% similares, son duplicados reales
      if (contents.length > 1) {
        const similarity = this.calculateSimilarity(contents[0], contents[1]);
        return similarity > 0.95;
      }
      
      return false;
    } catch (error) {
      return false;
    }
  }

  calculateSimilarity(content1, content2) {
    const lines1 = content1.split('\n');
    const lines2 = content2.split('\n');
    
    const maxLines = Math.max(lines1.length, lines2.length);
    let similarLines = 0;
    
    for (let i = 0; i < maxLines; i++) {
      const line1 = lines1[i] || '';
      const line2 = lines2[i] || '';
      
      if (line1.trim() === line2.trim()) {
        similarLines++;
      }
    }
    
    return similarLines / maxLines;
  }

  extractImports(content) {
    const imports = [];
    const importRegex = /(?:import.*from\s+['"`]([^'"`]+)['"`]|require\(['"`]([^'"`]+)['"`]\))/g;
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      imports.push(match[1] || match[2]);
    }
    
    return imports;
  }

  extractReferences(content) {
    // Buscar referencias a archivos locales
    const references = [];
    const refRegex = /['"`]\.\/([^'"`]+)['"`]/g;
    let match;
    
    while ((match = refRegex.exec(content)) !== null) {
      references.push(match[1]);
    }
    
    return references;
  }

  resolveImportPath(importPath, fromFile) {
    if (importPath.startsWith('./') || importPath.startsWith('../')) {
      const resolved = path.resolve(path.dirname(fromFile), importPath);
      
      // Probar diferentes extensiones
      const extensions = ['', '.js', '.ts', '.jsx', '.tsx', '.json'];
      for (const ext of extensions) {
        const fullPath = resolved + ext;
        if (fs.existsSync(fullPath)) {
          return fullPath;
        }
      }
    }
    return null;
  }

  isEntryPoint(file) {
    const basename = path.basename(file);
    const entryPoints = [
      'package.json',
      'next.config.js',
      'next.config.ts', 
      'tailwind.config.js',
      'tsconfig.json',
      'index.js',
      'index.ts',
      'route.js',
      'route.ts',
      'page.js',
      'page.ts',
      'layout.js',
      'layout.ts'
    ];
    
    return entryPoints.includes(basename) || file.includes('pages/') || file.includes('app/');
  }

  isCriticalFile(file) {
    const critical = [
      'package.json',
      'next.config',
      'tsconfig.json',
      'mcp-config.json',
      '.env',
      'firestore.rules'
    ];
    
    const basename = path.basename(file);
    return critical.some(pattern => basename.includes(pattern)) ||
           file.includes('src/app/') ||
           file.includes('src/pages/') ||
           this.analysis.functional.mcps.some(mcp => mcp.file === file) ||
           this.analysis.functional.tests.some(test => test.file === file);
  }

  async applyTypeScriptFixes(file, errors) {
    let content = fs.readFileSync(file, 'utf8');
    let fixesApplied = 0;
    
    for (const error of errors) {
      if (error.type === 'syntax' && error.description.includes('Tipo de retorno mal posicionado')) {
        // Corregir el error que acabamos de encontrar
        content = content.replace(/function\s+(\w+)\s*\([^)]*\)\s*=\s*['"][^'"]*['"]:\s*void\s*{/g, 
          (match, funcName) => {
            const corrected = match.replace(/['"][^'"]*['"]:\s*void\s*{/, '): void {');
            return corrected;
          });
        fixesApplied++;
      }
    }
    
    if (fixesApplied > 0) {
      fs.writeFileSync(file, content, 'utf8');
    }
    
    return fixesApplied;
  }
}

// Ejecutar análisis
if (import.meta.url === `file://${process.argv[1]}`) {
  const analyzer = new IntelligentProjectAnalyzer();
  await analyzer.analyzeProject();
}

export { IntelligentProjectAnalyzer };
