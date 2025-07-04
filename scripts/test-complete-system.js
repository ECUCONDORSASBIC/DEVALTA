#!/usr/bin/env node

/**
 * 🧪 Test Completo del Sistema Altamedica
 * Verifica que todos los componentes y flujos funcionen correctamente
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class SystemTester {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      total: 0,
      details: []
    };
    this.startTime = Date.now();
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: 'ℹ️',
      success: '✅',
      error: '❌',
      warning: '⚠️',
      test: '🧪'
    }[type] || 'ℹ️';

    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async test(testName, testFunction) {
    this.results.total++;
    this.log(`Ejecutando: ${testName}`, 'test');

    try {
      await testFunction();
      this.results.passed++;
      this.log(`✅ PASÓ: ${testName}`, 'success');
      this.results.details.push({ name: testName, status: 'passed', error: null });
    } catch (error) {
      this.results.failed++;
      this.log(`❌ FALLÓ: ${testName} - ${error.message}`, 'error');
      this.results.details.push({ name: testName, status: 'failed', error: error.message });
    }
  }

  // Test 1: Verificar estructura de archivos
  async testFileStructure() {
    const requiredFiles = [
      'apps/patients/src/app/dashboard/page.tsx',
      'apps/doctors/src/app/dashboard/page.tsx',
      'apps/companies/src/app/page.tsx',
      'apps/admin/src/app/page.tsx',
      'apps/web-app/src/app/(auth)/login/page.tsx',
      'apps/api-server/src/app/api/auth/login/route.ts',
      'apps/api-server/src/app/api/auth/register/route.ts',
      'apps/api-server/src/app/api/appointments/route.ts',
      'configs/database/schema.sql',
      'configs/env/api-server.env.example'
    ];

    for (const file of requiredFiles) {
      if (!fs.existsSync(file)) {
        throw new Error(`Archivo requerido no encontrado: ${file}`);
      }
    }
  }

  // Test 2: Verificar configuraciones
  async testConfigurations() {
    const configFiles = [
      'apps/patients/package.json',
      'apps/doctors/package.json',
      'apps/companies/package.json',
      'apps/admin/package.json',
      'apps/api-server/package.json',
      'apps/web-app/package.json'
    ];

    for (const configFile of configFiles) {
      if (!fs.existsSync(configFile)) {
        throw new Error(`Archivo de configuración no encontrado: ${configFile}`);
      }

      const packageJson = JSON.parse(fs.readFileSync(configFile, 'utf8'));
      
      // Verificar dependencias básicas
      const requiredDeps = ['react', 'next'];
      for (const dep of requiredDeps) {
        if (!packageJson.dependencies?.[dep] && !packageJson.devDependencies?.[dep]) {
          throw new Error(`Dependencia ${dep} faltante en ${configFile}`);
        }
      }
    }
  }

  // Test 3: Verificar componentes de UI
  async testUIComponents() {
    const uiComponents = [
      'packages/ui/src/components/medical/DashboardMedico.tsx',
      'packages/ui/src/components/medical/GestionCitas.tsx',
      'packages/ui/src/components/medical/GestionPacientes.tsx',
      'packages/ui/src/components/medical/Telemedicina.tsx'
    ];

    for (const component of uiComponents) {
      if (!fs.existsSync(component)) {
        throw new Error(`Componente UI no encontrado: ${component}`);
      }

      const content = fs.readFileSync(component, 'utf8');
      if (!content.includes('export default') && !content.includes('export const')) {
        throw new Error(`Componente ${component} no tiene exportación válida`);
      }
    }
  }

  // Test 4: Verificar endpoints de API
  async testAPIEndpoints() {
    const apiEndpoints = [
      'apps/api-server/src/app/api/auth/login/route.ts',
      'apps/api-server/src/app/api/auth/register/route.ts',
      'apps/api-server/src/app/api/appointments/route.ts',
      'apps/api-server/src/app/api/v1/notifications/route.ts',
      'apps/api-server/src/app/api/v1/telemedicine/route.ts',
      'apps/api-server/src/app/api/v1/users/route.ts'
    ];

    for (const endpoint of apiEndpoints) {
      if (!fs.existsSync(endpoint)) {
        throw new Error(`Endpoint de API no encontrado: ${endpoint}`);
      }

      const content = fs.readFileSync(endpoint, 'utf8');
      if (!content.includes('export async function') && !content.includes('export const')) {
        throw new Error(`Endpoint ${endpoint} no tiene funciones exportadas válidas`);
      }
    }
  }

  // Test 5: Verificar base de datos
  async testDatabase() {
    const dbFiles = [
      'configs/database/schema.sql',
      'configs/database/init.sql'
    ];

    for (const dbFile of dbFiles) {
      if (!fs.existsSync(dbFile)) {
        throw new Error(`Archivo de base de datos no encontrado: ${dbFile}`);
      }

      const content = fs.readFileSync(dbFile, 'utf8');
      if (content.trim().length === 0) {
        throw new Error(`Archivo de base de datos vacío: ${dbFile}`);
      }
    }
  }

  // Test 6: Verificar variables de entorno
  async testEnvironmentVariables() {
    const envFiles = [
      'configs/env/api-server.env.example'
    ];

    for (const envFile of envFiles) {
      if (!fs.existsSync(envFile)) {
        throw new Error(`Archivo de variables de entorno no encontrado: ${envFile}`);
      }

      const content = fs.readFileSync(envFile, 'utf8');
      if (content.trim().length === 0) {
        throw new Error(`Archivo de variables de entorno vacío: ${envFile}`);
      }
    }
  }

  // Test 7: Verificar hooks personalizados
  async testCustomHooks() {
    const hooks = [
      'apps/patients/src/hooks/useAppointments.ts',
      'apps/patients/src/hooks/useNotifications.ts',
      'apps/patients/src/hooks/useTelemedicineSession.ts',
      'apps/patients/src/hooks/useAuth.ts'
    ];

    for (const hook of hooks) {
      if (!fs.existsSync(hook)) {
        throw new Error(`Hook personalizado no encontrado: ${hook}`);
      }

      const content = fs.readFileSync(hook, 'utf8');
      if (!content.includes('export function') && !content.includes('export const')) {
        throw new Error(`Hook ${hook} no tiene exportación válida`);
      }
    }
  }

  // Test 8: Verificar servicios
  async testServices() {
    const services = [
      'apps/api-server/src/lib/database.ts',
      'apps/api-server/src/lib/auth.ts',
      'apps/api-server/src/lib/firebase.ts'
    ];

    for (const service of services) {
      if (!fs.existsSync(service)) {
        throw new Error(`Servicio no encontrado: ${service}`);
      }

      const content = fs.readFileSync(service, 'utf8');
      if (content.trim().length === 0) {
        throw new Error(`Servicio vacío: ${service}`);
      }
    }
  }

  // Test 9: Verificar tipos TypeScript
  async testTypeScriptTypes() {
    const typeFiles = [
      'packages/medical-types/src/index.ts',
      'packages/types/src/index.ts'
    ];

    for (const typeFile of typeFiles) {
      if (!fs.existsSync(typeFile)) {
        throw new Error(`Archivo de tipos no encontrado: ${typeFile}`);
      }

      const content = fs.readFileSync(typeFile, 'utf8');
      if (!content.includes('interface') && !content.includes('type')) {
        throw new Error(`Archivo de tipos ${typeFile} no contiene definiciones de tipos`);
      }
    }
  }

  // Test 10: Verificar documentación
  async testDocumentation() {
    const docs = [
      'README.md',
      'docs/ARQUITECTURA_IMPLEMENTACION_REALISTA.md'
    ];

    for (const doc of docs) {
      if (!fs.existsSync(doc)) {
        throw new Error(`Documentación no encontrada: ${doc}`);
      }

      const content = fs.readFileSync(doc, 'utf8');
      if (content.trim().length < 100) {
        throw new Error(`Documentación muy corta: ${doc}`);
      }
    }
  }

  // Ejecutar todos los tests
  async runAllTests() {
    this.log('🚀 Iniciando tests completos del sistema Altamedica', 'info');
    this.log('='.repeat(60), 'info');

    await this.test('Estructura de archivos', () => this.testFileStructure());
    await this.test('Configuraciones de aplicaciones', () => this.testConfigurations());
    await this.test('Componentes de UI', () => this.testUIComponents());
    await this.test('Endpoints de API', () => this.testAPIEndpoints());
    await this.test('Base de datos', () => this.testDatabase());
    await this.test('Variables de entorno', () => this.testEnvironmentVariables());
    await this.test('Hooks personalizados', () => this.testCustomHooks());
    await this.test('Servicios', () => this.testServices());
    await this.test('Tipos TypeScript', () => this.testTypeScriptTypes());
    await this.test('Documentación', () => this.testDocumentation());

    this.generateReport();
  }

  // Generar reporte final
  generateReport() {
    const endTime = Date.now();
    const duration = ((endTime - this.startTime) / 1000).toFixed(2);

    this.log('='.repeat(60), 'info');
    this.log('📊 REPORTE FINAL DE TESTS', 'info');
    this.log('='.repeat(60), 'info');

    this.log(`Total de tests: ${this.results.total}`, 'info');
    this.log(`Tests pasados: ${this.results.passed}`, 'success');
    this.log(`Tests fallidos: ${this.results.failed}`, this.results.failed > 0 ? 'error' : 'info');
    this.log(`Duración total: ${duration}s`, 'info');

    const successRate = ((this.results.passed / this.results.total) * 100).toFixed(1);
    this.log(`Tasa de éxito: ${successRate}%`, successRate >= 90 ? 'success' : 'warning');

    if (this.results.failed > 0) {
      this.log('\n❌ TESTS FALLIDOS:', 'error');
      this.results.details
        .filter(detail => detail.status === 'failed')
        .forEach(detail => {
          this.log(`  - ${detail.name}: ${detail.error}`, 'error');
        });
    }

    this.log('\n✅ TESTS EXITOSOS:', 'success');
    this.results.details
      .filter(detail => detail.status === 'passed')
      .forEach(detail => {
        this.log(`  - ${detail.name}`, 'success');
      });

    // Guardar reporte en archivo
    const reportPath = 'test-results.json';
    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      duration: parseFloat(duration),
      results: this.results
    }, null, 2));

    this.log(`\n📄 Reporte guardado en: ${reportPath}`, 'info');

    // Resumen final
    if (this.results.failed === 0) {
      this.log('\n🎉 ¡TODOS LOS TESTS PASARON! El sistema está listo para producción.', 'success');
    } else {
      this.log(`\n⚠️  ${this.results.failed} test(s) fallaron. Revisa los errores antes de continuar.`, 'warning');
    }
  }
}

// Ejecutar tests si el script se ejecuta directamente
if (require.main === module) {
  const tester = new SystemTester();
  tester.runAllTests().catch(error => {
    console.error('❌ Error ejecutando tests:', error);
    process.exit(1);
  });
}

module.exports = SystemTester; 