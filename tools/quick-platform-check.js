#!/usr/bin/env node
/**
 * 🏥 ALTAMEDICA - Verificación Simplificada de Plataforma
 * Script simplificado para verificar el estado de la plataforma
 */

import { execSync } from 'child_process';
import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

class SimpleVerifier {
  constructor() {
    this.results = [];
    this.totalChecks = 0;
    this.passedChecks = 0;
  }

  async check(description, testFunction) {
    this.totalChecks++;
    try {
      const result = await testFunction();
      if (result) {
        this.passedChecks++;
        console.log(`✅ ${description}`);
        this.results.push({ description, status: 'PASS', details: 'OK' });
        return true;
      } else {
        console.log(`❌ ${description}`);
        this.results.push({ description, status: 'FAIL', details: 'Verificación falló' });
        return false;
      }
    } catch (error) {
      console.log(`🔧 ${description} - Error: ${error.message}`);
      this.results.push({ description, status: 'ERROR', details: error.message });
      return false;
    }
  }

  async fetchWithTimeout(url, timeout = 5000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  async fileExists(path) {
    try {
      await fs.access(path);
      return true;
    } catch {
      return false;
    }
  }

  async verify() {
    console.log('🏥 ALTAMEDICA - VERIFICACIÓN RÁPIDA DE PLATAFORMA');
    console.log('='.repeat(60));
    console.log(`📅 ${new Date().toLocaleString('es-ES')}\n`);

    // 1. BACKEND - API Server
    console.log('🚀 VERIFICANDO BACKEND:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    await this.check('API Server Health Check', async () => {
      const response = await this.fetchWithTimeout('http://localhost:3001/api/v1/health');
      const data = await response.json();
      return data.success && data.data.status === 'healthy';
    });

    await this.check('Database Connection', async () => {
      const response = await this.fetchWithTimeout('http://localhost:3001/api/v1/health');
      const data = await response.json();
      return data.data.checks.database === 'healthy';
    });

    await this.check('Authentication System', async () => {
      const response = await this.fetchWithTimeout('http://localhost:3001/api/v1/health');
      const data = await response.json();
      return data.data.checks.auth === 'healthy';
    });

    // 2. ESTRUCTURA DE ARCHIVOS
    console.log('\n📁 VERIFICANDO ESTRUCTURA:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    await this.check('Package.json principal', () => this.fileExists(join(rootDir, 'package.json')));
    await this.check('Configuración Next.js', () => this.fileExists(join(rootDir, 'next.config.ts')));
    await this.check('Variables de entorno', () => this.fileExists(join(rootDir, '.env.local')));
    await this.check('Reglas de Firestore', () => this.fileExists(join(rootDir, 'firestore.rules')));
    await this.check('App API Server', () => this.fileExists(join(rootDir, 'apps/api-server')));
    await this.check('App Companies', () => this.fileExists(join(rootDir, 'apps/companies')));
    await this.check('App Doctors', () => this.fileExists(join(rootDir, 'apps/doctors')));

    // 3. PACKAGES INTERNOS
    console.log('\n📦 VERIFICANDO PACKAGES:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    await this.check('Package Shared', () => this.fileExists(join(rootDir, 'packages/shared')));
    await this.check('Package Firebase', () => this.fileExists(join(rootDir, 'packages/firebase')));
    await this.check('Package UI', () => this.fileExists(join(rootDir, 'packages/ui')));

    // 4. HERRAMIENTAS Y SCRIPTS
    console.log('\n🛠️  VERIFICANDO HERRAMIENTAS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    await this.check('Directorio de tools', () => this.fileExists(join(rootDir, 'tools')));
    await this.check('Diagnóstico universal', () => this.fileExists(join(rootDir, 'tools/universal-diagnostic.js')));
    await this.check('Checklist de plataforma', () => this.fileExists(join(rootDir, 'CHECKLIST_PLATAFORMA_ALTAMEDICA.md')));

    // 5. ENDPOINTS ESPECÍFICOS
    console.log('\n🔌 VERIFICANDO ENDPOINTS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    await this.check('Auth Refresh Token', async () => {
      try {
        const response = await this.fetchWithTimeout('http://localhost:3001/api/v1/auth/refresh', 5000);
        // Esperamos un 400 o 401 porque no enviamos token
        return response.status === 400 || response.status === 401;
      } catch {
        return false;
      }
    });

    await this.check('Debug Firestore', async () => {
      try {
        const response = await this.fetchWithTimeout('http://localhost:3001/api/v1/debug-firestore');
        return response.ok;
      } catch {
        return false;
      }
    });

    // RESUMEN
    this.printSummary();
  }

  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN DE VERIFICACIÓN');
    console.log('='.repeat(60));
    
    const percentage = Math.round((this.passedChecks / this.totalChecks) * 100);
    let status = '';
    
    if (percentage >= 90) status = '🟢 EXCELENTE';
    else if (percentage >= 75) status = '🟡 BUENO';
    else if (percentage >= 50) status = '🟠 REGULAR';
    else status = '🔴 REQUIERE ATENCIÓN';

    console.log(`\n🎯 RESULTADO: ${this.passedChecks}/${this.totalChecks} verificaciones pasaron (${percentage}%)`);
    console.log(`📈 ESTADO: ${status}\n`);

    // Mostrar fallos si los hay
    const failures = this.results.filter(r => r.status !== 'PASS');
    if (failures.length > 0) {
      console.log('❌ ELEMENTOS QUE REQUIEREN ATENCIÓN:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      failures.forEach(f => {
        console.log(`   • ${f.description} - ${f.details}`);
      });
      console.log('');
    }

    console.log('🚀 PRÓXIMOS PASOS RECOMENDADOS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (percentage >= 80) {
      console.log('   • ✅ La plataforma está en buen estado');
      console.log('   • 🧪 Implementar suite de testing');
      console.log('   • 📖 Completar documentación de APIs');
      console.log('   • 🌐 Preparar entorno de staging');
    } else if (percentage >= 60) {
      console.log('   • 🔧 Resolver fallos identificados arriba');
      console.log('   • 🔌 Completar endpoints faltantes');
      console.log('   • 🔐 Reforzar configuración de seguridad');
    } else {
      console.log('   • 🚨 Resolver problemas críticos primero');
      console.log('   • 🔄 Ejecutar diagnóstico detallado');
      console.log('   • 📞 Considerar apoyo técnico adicional');
    }

    console.log('\n📄 RECURSOS DISPONIBLES:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('   • 📋 CHECKLIST_PLATAFORMA_ALTAMEDICA.md - Checklist completo');
    console.log('   • 🔧 node tools/universal-diagnostic.js - Diagnóstico profundo');
    console.log('   • 🏥 curl http://localhost:3001/api/v1/health - Health check');

    console.log('\n' + '='.repeat(60));
  }
}

// Ejecución
const verifier = new SimpleVerifier();
verifier.verify().catch(console.error);
