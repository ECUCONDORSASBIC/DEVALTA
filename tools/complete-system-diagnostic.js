#!/usr/bin/env node
/**
 * 🏥 DIAGNÓSTICO COMPLETO SISTEMA ALTAMEDICA
 * =========================================
 * Verifica MCPs, APIs, Base de datos y toda la funcionalidad
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

class AltamedicaSystemDiagnostic {
  constructor() {
    this.results = {
      mcps: {},
      apis: {},
      database: {},
      services: {},
      overall: 'unknown'
    };
  }

  async runCompleteCheck() {
    console.log('🏥 DIAGNÓSTICO COMPLETO SISTEMA ALTAMEDICA');
    console.log('==========================================\n');

    // 1. Verificar configuración MCP
    await this.checkMCPConfiguration();
    
    // 2. Verificar APIs en puertos
    await this.checkAPIServices();
    
    // 3. Verificar base de datos
    await this.checkDatabaseConnectivity();
    
    // 4. Verificar archivos críticos
    await this.checkCriticalFiles();
    
    // 5. Generar reporte final
    this.generateFinalReport();
    
    return this.results;
  }

  async checkMCPConfiguration() {
    console.log('📡 VERIFICANDO CONFIGURACIÓN MCP');
    console.log('===============================');
    
    try {
      // Verificar mcp-config.json
      const mcpConfigPath = path.join(projectRoot, 'mcp-config.json');
      if (fs.existsSync(mcpConfigPath)) {
        const mcpConfig = JSON.parse(fs.readFileSync(mcpConfigPath, 'utf8'));
        const servers = Object.keys(mcpConfig.mcpServers || {});
        
        console.log(`✅ mcp-config.json encontrado con ${servers.length} servidores:`);
        servers.forEach(server => {
          console.log(`   - ${server}`);
          this.results.mcps[server] = 'configured';
        });
        
        this.results.mcps.configFile = 'exists';
      } else {
        console.log('❌ mcp-config.json NO encontrado');
        this.results.mcps.configFile = 'missing';
      }
      
      // Verificar scripts MCP
      const mcpScripts = [
        'start-mcp.bat',
        'status-mcp.bat',
        'dev-master.ps1'
      ];
      
      console.log('\n📜 Verificando scripts MCP:');
      mcpScripts.forEach(script => {
        const scriptPath = path.join(projectRoot, script);
        if (fs.existsSync(scriptPath)) {
          console.log(`✅ ${script} - OK`);
          this.results.mcps[script] = 'exists';
        } else {
          console.log(`❌ ${script} - Faltante`);
          this.results.mcps[script] = 'missing';
        }
      });
      
    } catch (error) {
      console.log(`❌ Error verificando MCP: ${error.message}`);
      this.results.mcps.error = error.message;
    }
    
    console.log();
  }

  async checkAPIServices() {
    console.log('🚀 VERIFICANDO SERVICIOS DE API');
    console.log('===============================');
    
    const ports = [
      { name: 'API Server', port: 3001, endpoint: '/api/v1/health' },
      { name: 'Companies API', port: 3002, endpoint: '/api/health' },
      { name: 'Doctors API', port: 3003, endpoint: '/api/health' }
    ];
    
    for (const service of ports) {
      try {
        const response = await fetch(`http://localhost:${service.port}${service.endpoint}`);
        const data = await response.json();
        
        if (response.ok) {
          console.log(`✅ ${service.name} (${service.port}) - HEALTHY`);
          console.log(`   Status: ${data.status || 'OK'}`);
          this.results.apis[service.name.toLowerCase().replace(' ', '_')] = 'healthy';
        } else {
          console.log(`⚠️  ${service.name} (${service.port}) - Responde pero con errores`);
          this.results.apis[service.name.toLowerCase().replace(' ', '_')] = 'unhealthy';
        }
      } catch (error) {
        console.log(`❌ ${service.name} (${service.port}) - OFFLINE`);
        this.results.apis[service.name.toLowerCase().replace(' ', '_')] = 'offline';
      }
    }
    
    console.log();
  }

  async checkDatabaseConnectivity() {
    console.log('🗄️  VERIFICANDO CONECTIVIDAD BASE DE DATOS');
    console.log('=========================================');
    
    try {
      // Verificar endpoint específico de diagnóstico si existe
      const response = await fetch('http://localhost:3001/api/v1/debug-firestore');
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Firestore - Endpoint de diagnóstico accesible');
        console.log(`   Detalles: ${JSON.stringify(data, null, 2)}`);
        this.results.database.firestore = 'connected';
      } else {
        console.log('⚠️  Firestore - Endpoint de diagnóstico responde con error');
        this.results.database.firestore = 'error';
      }
    } catch (error) {
      console.log('❌ Firestore - No se puede verificar conectividad');
      this.results.database.firestore = 'unreachable';
    }
    
    // Verificar configuración Firebase
    const firebaseFiles = [
      'firebase.json',
      'firestore.rules',
      'firestore.indexes.json'
    ];
    
    console.log('\n📂 Verificando archivos Firebase:');
    firebaseFiles.forEach(file => {
      const filePath = path.join(projectRoot, file);
      if (fs.existsSync(filePath)) {
        console.log(`✅ ${file} - OK`);
        this.results.database[file.replace('.', '_')] = 'exists';
      } else {
        console.log(`❌ ${file} - Faltante`);
        this.results.database[file.replace('.', '_')] = 'missing';
      }
    });
    
    console.log();
  }

  async checkCriticalFiles() {
    console.log('📋 VERIFICANDO ARCHIVOS CRÍTICOS');
    console.log('================================');
    
    const criticalFiles = [
      'package.json',
      'pnpm-workspace.yaml',
      'pnpm-lock.yaml',
      '.env.local',
      'next.config.js',
      'tsconfig.json'
    ];
    
    criticalFiles.forEach(file => {
      const filePath = path.join(projectRoot, file);
      if (fs.existsSync(filePath)) {
        console.log(`✅ ${file} - OK`);
        this.results.services[file.replace('.', '_')] = 'exists';
      } else {
        console.log(`❌ ${file} - Faltante`);
        this.results.services[file.replace('.', '_')] = 'missing';
      }
    });
    
    // Verificar directorios críticos
    const criticalDirs = [
      'apps/api-server',
      'apps/companies', 
      'apps/doctors',
      'packages',
      'tools'
    ];
    
    console.log('\n📁 Verificando directorios críticos:');
    criticalDirs.forEach(dir => {
      const dirPath = path.join(projectRoot, dir);
      if (fs.existsSync(dirPath)) {
        console.log(`✅ ${dir}/ - OK`);
        this.results.services[dir.replace('/', '_')] = 'exists';
      } else {
        console.log(`❌ ${dir}/ - Faltante`);
        this.results.services[dir.replace('/', '_')] = 'missing';
      }
    });
    
    console.log();
  }

  generateFinalReport() {
    console.log('📊 REPORTE FINAL DEL SISTEMA');
    console.log('============================');
    
    // Contar elementos funcionando
    const mcpHealthy = Object.values(this.results.mcps).filter(v => v === 'configured' || v === 'exists').length;
    const mcpTotal = Object.keys(this.results.mcps).length;
    
    const apisHealthy = Object.values(this.results.apis).filter(v => v === 'healthy').length;
    const apisTotal = Object.keys(this.results.apis).length;
    
    const dbHealthy = Object.values(this.results.database).filter(v => v === 'connected' || v === 'exists').length;
    const dbTotal = Object.keys(this.results.database).length;
    
    const servicesHealthy = Object.values(this.results.services).filter(v => v === 'exists').length;
    const servicesTotal = Object.keys(this.results.services).length;
    
    console.log(`🔧 MCPs: ${mcpHealthy}/${mcpTotal} configurados`);
    console.log(`🚀 APIs: ${apisHealthy}/${apisTotal} saludables`);
    console.log(`🗄️  Base de datos: ${dbHealthy}/${dbTotal} elementos OK`);
    console.log(`📋 Servicios: ${servicesHealthy}/${servicesTotal} archivos críticos OK`);
    
    // Determinar estado general
    const totalHealthy = mcpHealthy + apisHealthy + dbHealthy + servicesHealthy;
    const totalElements = mcpTotal + apisTotal + dbTotal + servicesTotal;
    const healthPercentage = Math.round((totalHealthy / totalElements) * 100);
    
    console.log(`\n🎯 ESTADO GENERAL: ${healthPercentage}% FUNCIONAL`);
    
    if (healthPercentage >= 80) {
      console.log('✅ SISTEMA EN EXCELENTE ESTADO');
      this.results.overall = 'excellent';
    } else if (healthPercentage >= 60) {
      console.log('⚠️  SISTEMA FUNCIONAL CON ÁREAS DE MEJORA');
      this.results.overall = 'good';
    } else {
      console.log('❌ SISTEMA REQUIERE ATENCIÓN');
      this.results.overall = 'needs_attention';
    }
    
    console.log('\n🔍 DETALLES COMPLETOS:');
    console.log('=====================');
    console.log(JSON.stringify(this.results, null, 2));
  }
}

// Ejecutar diagnóstico
const diagnostic = new AltamedicaSystemDiagnostic();
diagnostic.runCompleteCheck().catch(console.error);
